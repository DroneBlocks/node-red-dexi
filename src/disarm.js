module.exports = function(RED) {
    function DisarmNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            msg.payload = {"command": "disarm"}
            node.send(msg)
        })
    }
    RED.nodes.registerType("disarm", DisarmNode)
}