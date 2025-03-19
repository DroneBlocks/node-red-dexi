module.exports = function(RED) {

    function ImageNode(config) {
        RED.nodes.createNode(this, config);
        this.imageWidth = parseInt(config.width || 160);
        this.data       = config.data || "";
        this.dataType   = config.dataType || "msg";
        this.active     = (config.active === null || typeof config.active === "undefined") || config.active;
        this.pass       = config.pass;

        var node = this;

        function sendImageToClient(image, msg) {
            var d = { id:node.id }
            if (image !== null) {
                if (Buffer.isBuffer(image)) {
                    image = image.toString("base64");
                }
                d.data = image;
            }
            try {
                RED.comms.publish("image-preview", d);
                if (msg.hasOwnProperty("filename")) { node.status({text:" " + msg.filename}); }
            }
            catch(e) {
                node.error("Invalid image", msg);
            }
        }

        function handleError(err, msg, statusText) {
            node.status({ fill:"red", shape:"dot", text:statusText });
            node.error(err, msg);
        }

        node.on("input", function(msg) {
            var image;

            if (this.active !== true) { return; }

            if (node.pass) { node.send(msg); }

            // Get the image from the location specified in the typedinput field
            RED.util.evaluateNodeProperty(node.data, node.dataType, node, msg, (err, value) => {
                if (err) {
                    handleError(err, msg, "Invalid source");
                    return;
                } else {
                    image = value;
                }
            });

            // Reset the image in case an empty payload arrives
            if (!image || image === "") {
                node.status("");
                sendImageToClient(null, msg);
                return;
            }

            if (!Buffer.isBuffer(image) && (typeof image !== 'string') && !(image instanceof String)) {
                node.error("Input should be a buffer or a base64 string or a Jimp image (containing a jpg or png image)",msg);
                return;
            }

            if (typeof image === "string") {
                sendImageToClient(image.replace(/^data:image\/[a-z]+;base64,/, ""), msg);
            }
            else { sendImageToClient(image, msg) }
            
        });

        node.on("close", function() {
            RED.comms.publish("image-preview", { id:this.id });
            node.status({});
        });
    }
    RED.nodes.registerType("image-preview", ImageNode);

    // Via the button on the node (in the FLOW EDITOR), the image pushing can be enabled or disabled
    RED.httpAdmin.post("/image-output/:id/:state", RED.auth.needsPermission("image-output.write"), function(req,res) {
        var state = req.params.state;
        var node = RED.nodes.getNode(req.params.id);

        if(node === null || typeof node === "undefined") {
            res.sendStatus(404);
            return;
        }

        if (state === "enable") {
            node.active = true;
            res.send('activated');
        }
        else if (state === "disable") {
            node.active = false;
            res.send('deactivated');
        }
        else {
            res.sendStatus(404);
        }
    });
};