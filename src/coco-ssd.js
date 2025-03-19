module.exports = function (RED) {
    const tf = require("@tensorflow/tfjs-node");
    const cocoSsd = require("@tensorflow-models/coco-ssd");

    function CocoSsdNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        let modelPromise = cocoSsd.load();

        node.on("input", async function (msg) {

            try {
                let buffer = Buffer.from(msg.payload.data, "base64");
                let imageTensor = tf.node.decodeImage(buffer);

                let model = await modelPromise;
                let predictions = await model.detect(imageTensor);

                msg.detections = predictions;
                node.send(msg);
            } catch (error) {
                node.error(error.message, msg);
            }
        });
    }

    RED.nodes.registerType("coco-ssd", CocoSsdNode);
};
