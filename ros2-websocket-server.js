module.exports = function (RED){
    var ROSLIB = require('roslib');
  
    function ROS2WebsocketServerNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;

      node.closing = false;
      node.on("close", function() {
        node.closing = true;
        if (node.tout) { clearTimeout(node.tout); }
        if (node.ros){
          node.ros.close();
        }
      });
  
      var trials = 0;
  
      function startconn() {    // Connect to remote endpoint
        var ros = new ROSLIB.Ros({
          url : config.url
        });
        node.ros = ros; // keep for closing
        handleConnection(ros);
      }
  
      function handleConnection(ros) {
        ros.on('connection', function() {
          node.emit('ros connected');
          node.log('connected');

          
          // setTimeout(() => {
          //   ros.getTopics(function(topicsData) {
          //     //window.topics = topicsData
          //     console.log(topicsData)
          //   });
          // }, 3000)          
          

        });
  
        ros.on('error', function(error) {
          trials++;
          node.emit('ros error');
          node.log('Error connecting : ', error);

          //if(trials == 5) node.closing = true
        });
  
        ros.on('close', function() {
            node.emit('ros closed');
            node.log('Connection closed');
          if (!node.closing) {
            node.log('reconnecting');
            node.tout = setTimeout(function(){ startconn(); }, 1000);
          }
        });
      }
  
      startconn();
      node.closing = false;
    }
  
    RED.nodes.registerType("ros2-websocket-server", ROS2WebsocketServerNode);
  };