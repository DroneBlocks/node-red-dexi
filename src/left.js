module.exports = function(RED) {
    function FlyLeftNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let distance = parseFloat(config.distance) || 1.0; // Default to 1.0 if undefined

        node.on('input', function(msg) {
            // Adheres to offboardnavcommand message format from dexi_interfaces
            msg.payload = {
                "command": "fly_left",
                "distance_or_degrees": distance
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("left", FlyLeftNode);
}