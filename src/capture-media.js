// Builds the service request for dexi_capture_media. Wire it into a
// ros2-service-call node, the same way as the led node.
const SERVICES = {
    photo: '/dexi/capture_media/capture_photo',
    start_recording: '/dexi/capture_media/start_recording',
    stop_recording: '/dexi/capture_media/stop_recording'
}

module.exports = function(RED) {
    function CaptureMediaNode(config) {
        RED.nodes.createNode(this, config)
        var node = this
        node.on('input', function(msg) {
            // msg.payload.action overrides the configured action
            const action = (msg.payload && msg.payload.action) ? msg.payload.action : config.action
            if (!SERVICES[action]) {
                node.error(`unknown capture action "${action}" (photo, start_recording, stop_recording)`, msg)
                return
            }
            msg.payload = {
                "serviceName": SERVICES[action],
                "serviceType": "std_srvs/srv/Trigger",
                "serviceRequest": {}
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("capture-media", CaptureMediaNode)
}
