module.exports = function(RED) {
    var ROSLIB = require('roslib'); 
    const Time = require('./Time.js');

    let dexiTopics = []
  
    function Ros2PublishNode(config) {
      RED.nodes.createNode(this,config);
      var node = this;
  
      node.server = RED.nodes.getNode(config.server);
      
      if (!node.server || !node.server.ros){
        return;
      }
  
      var msgtype = config.messagetype
      var topic = new ROSLIB.Topic({
        name : config.topicname,
        messageType : msgtype
      });
  
      node.on('input', (msg) => {
        topic.ros = node.server.ros;
        node.log('publishing msg ' + msg.payload);
        // var pubslishMsg = new ROSLIB.Message({data: msg.payload});
        var new_payload = msg.payload;
        // Insert timestamp in header
        if (config.stampheader){
          const now = Time.now();
          new_payload = addHeader(new_payload, now);
        }
        topic.publish(new_payload);
        // Pass to the next node
        node.send(msg);
      });
  
      function addHeader(payload_, now_)
      {      
        if ('header' in payload_){
          payload_.header.stamp = now_;
        }
        else{
          node.error('Cannot add stamp to header, because incoming msg does not contain a header!');
        }
        return payload_;
      }
  
      node.server.on('ros connected', () => {
        node.status({fill:"green",shape:"dot",text:"connected"});
      });
  
      node.server.on('ros error', () => {
        node.status({fill:"red",shape:"dot",text:"error"});
      });
  
    }

    // Expose "API" to the editor for displaying topics
    RED.httpAdmin.get('/dexi/topics', (req, res) => {
      res.json(dexiTopics)
    })
    
    RED.nodes.registerType("ros2-publish", Ros2PublishNode);
  };