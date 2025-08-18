module.exports = function(RED) {
    function LedNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            msg.payload = {
                "serviceName": "/dexi/led_service/set_led_ring_color",
                "serviceType": "dexi_interfaces/srv/LEDRingColor",
                "serviceRequest": {
                    "color": config.color,
                    "brightness": parseInt(config.brightness) || 100
                }
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("led", LedNode)
}