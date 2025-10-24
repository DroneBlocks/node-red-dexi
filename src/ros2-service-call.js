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

      node.on('input', (msg) => {

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
  
      node.server.on('ros connected', () => {
        node.status({fill:"green",shape:"dot",text:"connected"});
      });
  
      node.server.on('ros error', () => {
        node.status({fill:"red",shape:"dot",text:"error"});
      });
  
    }
  
    // Expose "API" to the editor for displaying topics
    RED.httpAdmin.get('/dexi/services', (req, res) => {
      res.json(dexiServices)
    })

    RED.nodes.registerType("ros2-service-call", Ros2ServiceCallNode);
  };