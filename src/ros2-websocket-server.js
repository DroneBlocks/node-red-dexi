module.exports = function (RED){
    var ROSLIB = require('roslib');

    // Last known topic list, served if rosbridge is unreachable when the
    // editor asks. Shape must match roslib's getTopics response.
    let dexiTopics = { topics: [], types: [] }
    let activeRos = null

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
          activeRos = ros;
          node.emit('ros connected');
          node.log('connected');

          // Warm the fallback list. The editor queries live via /dexi/topics.
          ros.getTopics((topicsResponse) => {
            dexiTopics = topicsResponse
          })

        });

        ros.on('error', function(error) {
          trials++;
          node.emit('ros error');
          node.log('Error connecting : ', error);

          //if(trials == 5) node.closing = true
        });

        ros.on('close', function() {
            if (activeRos === ros) { activeRos = null; }
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

    // Expose "API" to the editor for displaying topics.
    // Queried live on every request: a ROS node launched after node-red
    // connected would otherwise never appear in the editor's topic list.
    RED.httpAdmin.get('/dexi/topics', (req, res) => {
      if (!activeRos) {
        return res.json(dexiTopics)
      }

      let answered = false
      const reply = (payload) => {
        if (answered) { return }
        answered = true
        res.json(payload)
      }

      // Don't leave the editor spinning if rosapi never answers.
      const timer = setTimeout(() => reply(dexiTopics), 3000)

      activeRos.getTopics(
        (topicsResponse) => {
          clearTimeout(timer)
          dexiTopics = topicsResponse
          reply(topicsResponse)
        },
        () => {
          clearTimeout(timer)
          reply(dexiTopics)
        }
      )
    })
  
    RED.nodes.registerType("ros2-websocket-server", ROS2WebsocketServerNode);
  };