module.exports = function(RED) {
    function ArmNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            msg.payload = {"command": "arm"}
            node.send(msg)
        })
    }
    RED.nodes.registerType("arm", ArmNode)
}