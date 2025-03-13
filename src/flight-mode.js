module.exports = function (RED) {
    function FlightModeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.mode = config.mode || "Hold"; // Default to Hold if undefined

        node.on('input', function (msg) {
            // Ensure msg.payload carries the flight mode
            msg.payload = {
                "command": "set_mode",
                "mode": node.mode
            };
            node.send(msg);
        });
    }

    RED.nodes.registerType("flight-mode", FlightModeNode);
};
