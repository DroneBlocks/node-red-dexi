module.exports = function (RED){
    var ROSLIB = require('roslib')

    let dexiTopics = []

    function ROS2SubscribeNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.server = RED.nodes.getNode(config.server);
      
      if (!node.server || !node.server.ros){
        return;
      }
  
      // if topic has not been advertised yet, keep trying again
      function topicQuery(topic){
        node.server.ros.getTopicType(topic.name, (type) => {
          if (!type){
            setTimeout(()=>{topicQuery(topic)}, 1000);
          } else {
            topic.subscribe(function(data){
              var o = JSON.parse(JSON.stringify(data))
              node.send({payload: o});
            });
          }
        })
      }
  
      node.server.on('ros connected', () => {
        node.topic = new ROSLIB.Topic({
          ros : node.server.ros,
          name : config.topicname
        });

        node.server.ros.getTopics((topicsResponse) => {
          dexiTopics = topicsResponse
        })

        // setTimeout(() => {
        //   // This works
        //   node.log(node.server.url)
        //   config.prefix = node.server.url
        // }, 3000)
        
        topicQuery(node.topic);
        node.status({fill:"green", shape:"dot", text:"connected"});
      });
  
      node.server.on('ros error', () => {
        node.status({fill: "red", shape:"dot", text:"error"});
      });

      node.on("close", function() {
        if (!node.server.closing){
          node.topic.unsubscribe();
        }
      });
    }

    RED.httpAdmin.get('/dexi/topics', (req, res) => {
      res.json(dexiTopics)
    })
  
    RED.nodes.registerType("ros2-subscribe", ROS2SubscribeNode);
  };