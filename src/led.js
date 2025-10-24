module.exports = function(RED) {
    function LedNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            // Use color from message payload if available, otherwise use config
            const color = (msg.payload && msg.payload.color) ? msg.payload.color : config.color

            msg.payload = {
                "serviceName": "/dexi/led_service/set_led_ring_color",
                "serviceType": "dexi_interfaces/srv/LEDRingColor",
                "serviceRequest": {
                    "color": color
                }
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("led", LedNode)
}