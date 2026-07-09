module.exports = function (RED){
    var ROSLIB = require('roslib')

    function ROS2SubscribeNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.server = RED.nodes.getNode(config.server);

      if (!node.server || !node.server.ros){
        return;
      }

      node.closed = false;

      // if topic has not been advertised yet, keep trying again
      function topicQuery(topic){
        if (node.closed){ return; }

        node.server.ros.getTopicType(topic.name, (type) => {
          if (node.closed){ return; }

          if (!type){
            node.status({fill:"yellow", shape:"ring", text:"waiting for topic"});
            node.tout = setTimeout(()=>{topicQuery(topic)}, 1000);
          } else {
            topic.subscribe(function(data){
              var o = JSON.parse(JSON.stringify(data))
              node.send({payload: o});
            });
            node.status({fill:"green", shape:"dot", text:"subscribed"});
          }
        })
      }

      function subscribe(){
        // A reconnect calls this again; drop any retry still pending from the
        // previous connection so the 1s loops don't accumulate.
        if (node.tout) { clearTimeout(node.tout); node.tout = null; }

        node.topic = new ROSLIB.Topic({
          ros : node.server.ros,
          name : config.topicname
        });

        topicQuery(node.topic);
      }

      node.server.on('ros connected', subscribe);

      // The server can already be connected when this node is created - a
      // deploy of modified nodes only does not restart the config node, so
      // 'ros connected' has already fired and will not fire again.
      if (node.server.ros.isConnected){
        subscribe();
      } else {
        node.status({fill:"grey", shape:"ring", text:"connecting"});
      }

      node.server.on('ros error', () => {
        node.status({fill: "red", shape:"dot", text:"error"});
      });

      node.on("close", function() {
        node.closed = true;
        if (node.tout) { clearTimeout(node.tout); }
        if (node.topic && !node.server.closing){
          node.topic.unsubscribe();
        }
      });
    }

    RED.nodes.registerType("ros2-subscribe", ROS2SubscribeNode);
  };
