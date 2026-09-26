module.exports = function(RED) {
    var ROSLIB = require('roslib');

    let dexiServices = []
  
    function Ros2ServiceCallNode(config) {
      RED.nodes.createNode(this, config);
      var node = this;
  
      node.server = RED.nodes.getNode(config.server);
      
      if (!node.server || !node.server.ros){
        return;
      }
  
      // Calling a service
      // -----------------
  
      var msgtype = config.typepackage + "/" + config.typename
      var serviceClient = new ROSLIB.Service({
        ros : node.server.ros,
        name : config.servicename,
        serviceType : msgtype
      });

      // Get list of topics to send to the editor
      node.server.ros.getServices((servicesResponse) => {
        dexiServices = servicesResponse
      })
  
      // node.on('input', (msg) => {
      //   serviceClient.callService(msg.payload, function(result) {
      //     console.log('Result for service call on '
      //       + serviceClient.name
      //       + ': '
      //       + result.success
      //       + ', '
      //       + result.message);
      //     var o = JSON.parse(JSON.stringify(result))
      //     node.send({payload: o});
      //   });
      // });


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
          node.warn('rosbridge not connected, dropping call to ' + (msg.payload && msg.payload.serviceName));
          return;
        }

        let serviceClient = new ROSLIB.Service({
          ros : node.server.ros,
          name : msg.payload.serviceName,
          serviceType : msg.payload.serviceType
        })

        serviceClient.callService(msg.payload.serviceRequest, (response) => {
          // In the future we'll do something with the service response
          var o = JSON.parse(JSON.stringify(response))
          msg.payload = o;
          node.send(msg);
        })
    })
  
      node.server.on('ros connected', () => { setStatus('connected'); });
      node.server.on('ros error', () => { setStatus('error'); });
      node.server.on('ros closed', () => { setStatus('closed'); });
  
    }
  
    // Expose "API" to the editor for displaying topics
    RED.httpAdmin.get('/dexi/services', (req, res) => {
      res.json(dexiServices)
    })

    RED.nodes.registerType("ros2-service-call", Ros2ServiceCallNode);
  };