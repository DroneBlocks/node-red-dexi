module.exports = function(RED) {
    function YawRightNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let degrees = parseFloat(config.degrees) || 1.0; // Default to 1.0 if undefined

        node.on('input', function(msg) {
            // Adheres to offboardnavcommand message format from dexi_interfaces
            msg.payload = {
                "command": "yaw_right",
                "distance_or_degrees": degrees
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("yaw_right", YawRightNode);
}