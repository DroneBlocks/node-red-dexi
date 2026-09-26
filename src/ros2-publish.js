module.exports = function(RED) {
    var ROSLIB = require('roslib'); 
    const Time = require('./Time.js');

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
  

      // Connection status. Without this the node renders blank until the first
      // connect or error event. On a cold boot rosbridge is ~2 min behind the
      // container, so a flow that silently does nothing looks entirely normal.
      function setStatus(state) {
        if (state === 'connected') {
          node.status({fill: 'green', shape: 'dot', text: 'connected'});
        } else if (state === 'error') {
          node.status({fill: 'red', shape: 'ring', text: 'connect error'});
        } else if (state === 'closed') {
          node.status({fill: 'yellow', shape: 'ring', text: 'reconnecting'});
        } else {
          node.status({fill: 'grey', shape: 'ring', text: 'connecting'});
        }
      }

      function rosReady() {
        return !!(node.server && node.server.ros && node.server.ros.isConnected);
      }

      setStatus(rosReady() ? 'connected' : 'connecting');

      node.on('input', (msg) => {
        if (!rosReady()) {
          setStatus('closed');
          node.warn('rosbridge not connected, dropping message for ' + config.topicname);
          return;
        }
        topic.ros = node.server.ros;
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
  
      node.server.on('ros connected', () => { setStatus('connected'); });
      node.server.on('ros error', () => { setStatus('error'); });
      node.server.on('ros closed', () => { setStatus('closed'); });
  
    }
    
    RED.nodes.registerType("ros2-publish", Ros2PublishNode);
  };