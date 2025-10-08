module.exports = function(RED) {
    function ServoNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.name = config.name;
        node.servoId = parseInt(config.servoId);
        node.angle = parseInt(config.angle);

        node.on('input', function(msg) {
            var servoId = node.servoId;
            var angle = node.angle;

            // Check if angle was passed as a simple number (e.g., from a slider)
            // Only accept numbers in valid servo range (0-180)
            if (typeof msg.payload === 'number' && msg.payload >= 0 && msg.payload <= 180) {
                angle = parseInt(msg.payload);
            }
            // Check if servo parameters were passed as an object
            else if (typeof msg.payload === 'object') {
                if (typeof msg.payload.servoId !== 'undefined') {
                    servoId = parseInt(msg.payload.servoId);
                }
                if (typeof msg.payload.angle !== 'undefined') {
                    angle = parseInt(msg.payload.angle);
                }
            }
            // Otherwise use configured values (handles inject timestamps, etc.)

            msg.payload = {
                "serviceName": "/dexi/servo_control",
                "serviceType": "dexi_interfaces/srv/ServoControl",
                "serviceRequest": {
                    "pin": servoId,
                    "angle": angle
                }
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("servo", ServoNode);
}
