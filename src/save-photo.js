module.exports = function (RED) {
    function SavePhotoNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.filename = config.filename || 'dexi_photo';
        node.autoSave = config.autoSave || false;
        node.showPreview = config.showPreview !== false; // default true

        function sendImageToClient(imageData) {
            if (!node.showPreview && !node.autoSave) return;

            var d = { id: node.id };
            if (imageData !== null) {
                // Handle different image data formats
                if (Buffer.isBuffer(imageData)) {
                    imageData = imageData.toString("base64");
                }
                d.data = imageData;
            }
            try {
                RED.comms.publish("save-photo", d);
                node.status({fill:"green", shape:"dot", text:"image received"});
            }
            catch(e) {
                node.error("Invalid image data", e);
                node.status({fill:"red", shape:"dot", text:"error"});
            }
        }

        function processImageMessage(data) {
            try {
                let imageData;

                // Handle different input formats
                if (typeof data === 'string') {
                    // Already base64 encoded string
                    imageData = data;
                } else if (data && data.data && data.format) {
                    // ROS CompressedImage message format
                    if (Buffer.isBuffer(data.data)) {
                        imageData = data.data.toString("base64");
                    } else if (Array.isArray(data.data)) {
                        imageData = Buffer.from(data.data).toString("base64");
                    } else {
                        imageData = data.data;
                    }
                } else if (data && data.encoding && data.width && data.height && data.data) {
                    // ROS Image message format (raw)
                    let buffer;
                    if (Buffer.isBuffer(data.data)) {
                        buffer = data.data;
                    } else if (Array.isArray(data.data)) {
                        buffer = Buffer.from(data.data);
                    } else {
                        node.warn('Unsupported raw image data format');
                        return;
                    }
                    imageData = buffer.toString("base64");
                } else if (Buffer.isBuffer(data)) {
                    // Direct buffer input
                    imageData = data.toString("base64");
                } else {
                    node.warn('Unsupported image data format');
                    node.status({fill:"red", shape:"dot", text:"error"});
                    return;
                }

                sendImageToClient(imageData);

                // Send message through output
                node.send({
                    payload: {
                        timestamp: new Date().toISOString(),
                        imageReceived: true,
                        filename: node.filename
                    }
                });

            } catch (err) {
                node.error(`Error processing image: ${err.message}`);
                node.status({fill:"red", shape:"dot", text:"error"});
            }
        }

        // Handle input messages
        node.on("input", function (msg) {
            if (msg.payload === "save") {
                // Trigger a save of the latest image
                node.send({
                    payload: {
                        action: "save_requested",
                        timestamp: new Date().toISOString()
                    }
                });
            } else if (msg.payload) {
                // Process image data from input
                processImageMessage(msg.payload);
            }
        });

        node.on("close", function () {
            // Clear the preview
            RED.comms.publish("save-photo", { id: node.id });
        });

        // Initial status
        node.status({fill:"green", shape:"dot", text:"ready"});
    }

    RED.nodes.registerType("save-photo", SavePhotoNode);
};