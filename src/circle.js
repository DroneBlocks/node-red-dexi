module.exports = function(RED) {
    function FlyCircleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let radius = parseFloat(config.radius) || 2.0; // Default to 2.0m if undefined

        node.on('input', function(msg) {
            // Adheres to offboardnavcommand message format from dexi_interfaces
            msg.payload = {
                "command": "circle",
                "distance_or_degrees": radius
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("circle", FlyCircleNode);
}
