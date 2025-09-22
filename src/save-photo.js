module.exports = function (RED) {
    var ROSLIB = require('roslib');

    function SavePhotoNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);
        node.topicName = config.topicName || '/cam0/image_raw/compressed';
        node.topicType = config.topicType || 'compressed';
        node.filename = config.filename || 'dexi_photo';
        node.autoSave = config.autoSave || false;
        node.showPreview = config.showPreview !== false; // default true

        if (!node.server || !node.server.ros) {
            node.status({fill: "red", shape: "dot", text: "no connection"});
            return;
        }

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
                node.status({fill: "green", shape: "dot", text: "image received"});
            }
            catch(e) {
                node.error("Invalid image data", e);
                node.status({fill: "red", shape: "dot", text: "invalid data"});
            }
        }

        function processImageMessage(data) {
            try {
                let imageData;

                if (node.topicType === 'compressed') {
                    // Handle sensor_msgs/CompressedImage
                    if (data.data && data.format) {
                        // CompressedImage message has data as base64 or buffer
                        if (Buffer.isBuffer(data.data)) {
                            imageData = data.data.toString("base64");
                        } else if (Array.isArray(data.data)) {
                            imageData = Buffer.from(data.data).toString("base64");
                        } else {
                            imageData = data.data;
                        }
                        sendImageToClient(imageData);
                    }
                } else {
                    // Handle sensor_msgs/Image (raw)
                    if (data.encoding && data.width && data.height && data.data) {
                        // For raw images, we need to convert to base64
                        // This is more complex and may require image processing
                        let buffer;
                        if (Buffer.isBuffer(data.data)) {
                            buffer = data.data;
                        } else if (Array.isArray(data.data)) {
                            buffer = Buffer.from(data.data);
                        } else {
                            node.warn('Unsupported raw image data format');
                            return;
                        }

                        // For now, pass through raw data - in practice you'd want to
                        // convert to JPEG using a library like sharp or jimp
                        sendImageToClient(buffer.toString("base64"));
                    }
                }

                // Send message through output
                node.send({
                    payload: {
                        topic: node.topicName,
                        timestamp: new Date().toISOString(),
                        imageReceived: true
                    }
                });

            } catch (err) {
                node.error(`Error processing image: ${err.message}`);
                node.status({fill: "red", shape: "dot", text: "processing error"});
            }
        }

        // if topic has not been advertised yet, keep trying again
        function topicQuery(topic) {
            node.server.ros.getTopicType(topic.name, (type) => {
                if (!type) {
                    setTimeout(() => { topicQuery(topic) }, 1000);
                } else {
                    node.log(`Subscribed to ${topic.name} with message type: ${type}`);
                    topic.subscribe(function (data) {
                        processImageMessage(data);
                    });
                }
            });
        }

        node.server.on('ros connected', () => {
            // Determine message type based on topic type
            let messageType;
            if (node.topicType === 'compressed' || node.topicType === 'compressed_2hz') {
                messageType = 'sensor_msgs/CompressedImage';
            } else {
                messageType = 'sensor_msgs/Image';
            }

            node.topic = new ROSLIB.Topic({
                ros: node.server.ros,
                name: node.topicName,
                messageType: messageType
            });

            topicQuery(node.topic);
            node.status({fill: "green", shape: "dot", text: "connected"});
        });

        node.server.on('ros error', () => {
            node.status({fill: "red", shape: "dot", text: "connection error"});
        });

        // Handle manual save trigger
        node.on("input", function (msg) {
            if (msg.payload === "save") {
                // Trigger a save of the latest image
                node.send({
                    payload: {
                        action: "save_requested",
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });

        node.on("close", function () {
            if (node.topic && !node.server.closing) {
                node.topic.unsubscribe();
            }
            // Clear the preview
            RED.comms.publish("save-photo", { id: node.id });
        });
    }

    RED.nodes.registerType("save-photo", SavePhotoNode);
};