module.exports = function(RED) {
    function LedEffectNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.name = config.name;
        node.effect = config.effect;

        node.on('input', function(msg) {
            // Check if effect was passed from another node
            if (typeof msg.payload.effect !== 'undefined') {
                msg.payload = {
                    "serviceName": "/dexi/led_service/set_led_effect",
                    "serviceType": "dexi_interfaces/srv/LEDEffect",
                    "serviceRequest": {
                        "effect_name": msg.payload.effect
                    }
                }
            } else {
                msg.payload = {
                    "serviceName": "/dexi/led_service/set_led_effect",
                    "serviceType": "dexi_interfaces/srv/LEDEffect",
                    "serviceRequest": {
                        "effect_name": node.effect
                    }
                }
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("led-effect", LedEffectNode);
} 