module.exports = function(RED) {
    function FlyRightNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let distance = parseFloat(config.distance) || 1.0; // Default to 1.0 if undefined

        node.on('input', function(msg) {
            // Adheres to offboardnavcommand message format from dexi_interfaces
            msg.payload = {
                "command": "fly_right",
                "distance_or_degrees": distance
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("right", FlyRightNode);
}