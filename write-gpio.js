module.exports = function(RED) {
  function WriteGPIO(config) {
      RED.nodes.createNode(this, config)
      var node = this
      node.on('input', function(msg) {
          msg.payload = {
              "serviceName": `/dexi/gpio_writer_service/write_gpio_${config.pinnumber}`,
              "serviceType": "dexi_interfaces/srv/GPIOSend",
              "serviceRequest": {
                "pin": 21,
                "state": config.pinstate === 'true'
              }
          }
          node.send(msg)
      })
  }
  RED.nodes.registerType("write-gpio", WriteGPIO)
}