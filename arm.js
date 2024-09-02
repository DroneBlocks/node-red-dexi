module.exports = function(RED) {
    function ArmNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            msg.payload = {"command": 400, "param1": 1, "param2": 0}
            node.send(msg)
        })
    }
    RED.nodes.registerType("arm", ArmNode)
}