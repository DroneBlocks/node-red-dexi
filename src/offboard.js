module.exports = function (RED) {
    function OffboardNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.on('input', function (msg, send, done) {

            if (config.action === "start") {
                msg.payload = {
                    "command": "start_offboard_heartbeat",
                }
            } else {
                msg.payload = {
                    "command": "stop_offboard_heartbeat",
                }
            }
            send(msg);
        });
    }
    RED.nodes.registerType('offboard', OffboardNode);
};