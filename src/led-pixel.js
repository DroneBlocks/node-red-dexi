module.exports = function(RED) {
    function LedPixelNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            // Check if values were passed from another node
            if (typeof msg.payload.index !== 'undefined' &&
                typeof msg.payload.red !== 'undefined' &&
                typeof msg.payload.green !== 'undefined' &&
                typeof msg.payload.blue !== 'undefined') {
                msg.payload = {
                    "serviceName": "/dexi/led_service/set_led_pixel_color",
                    "serviceType": "dexi_interfaces/srv/LEDPixelColor",
                    "serviceRequest": {
                        "index": parseInt(msg.payload.index),
                        "r": parseInt(msg.payload.red),
                        "g": parseInt(msg.payload.green),
                        "b": parseInt(msg.payload.blue),
                        "brightness": parseInt(msg.payload.brightness) || parseInt(config.brightness) || 100
                    }
                }
            } else {
                msg.payload = {
                    "serviceName": "/dexi/led_service/set_led_pixel_color",
                    "serviceType": "dexi_interfaces/srv/LEDPixelColor",
                    "serviceRequest": {
                        "index": parseInt(config.ledindex),
                        "r": parseInt(config.red),
                        "g": parseInt(config.green),
                        "b": parseInt(config.blue),
                        "brightness": parseInt(config.brightness) || 100
                    }
                }
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("led-pixel", LedPixelNode)
}