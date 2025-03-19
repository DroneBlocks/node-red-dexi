module.exports = function (RED) {
    const tf = require("@tensorflow/tfjs-node");
    const handpose = require("@tensorflow-models/handpose");

    function HandPoseNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        let modelPromise = handpose.load(); // Load the HandPose model once

        node.on("input", async function (msg) {
            try {
                let buffer = Buffer.from(msg.payload.data, "base64");
                let imageTensor = tf.node.decodeImage(buffer);

                let model = await modelPromise;
                let predictions = await model.estimateHands(imageTensor);

                msg.detections = predictions; // Return hand keypoints
                node.send(msg);
            } catch (error) {
                node.error(error.message, msg);
            }
        });
    }

    RED.nodes.registerType("hand-pose", HandPoseNode);
};
