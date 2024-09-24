module.exports = function(RED) {
    function LandNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = {"command": 21}
            node.send(msg)
        })
    }
    RED.nodes.registerType("land", LandNode);
}
