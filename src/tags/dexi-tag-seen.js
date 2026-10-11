module.exports = function (RED) {
  var ROSLIB = require('roslib');

  // Emits a message each time a new tag comes into view: msg.payload = the tag id,
  // msg.tags = every id in view. A tag counts as gone once it has been out of view
  // for forget_s, so hovering over one tag announces it once, not ten times a second.
  function TagSeenNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var forgetMs = (Number(config.forget) || 2) * 1000;
    var lastSeen = {};
    node.server = RED.nodes.getNode(config.server);
    if (!node.server || !node.server.ros) { return; }

    function subscribe() {
      if (node.topic) { node.topic.unsubscribe(); }
      node.topic = new ROSLIB.Topic({
        ros: node.server.ros, name: '/apriltag_detections',
        messageType: 'apriltag_msgs/msg/AprilTagDetectionArray', throttle_rate: 200, queue_length: 1
      });
      node.topic.subscribe(function (m) {
        var now = Date.now();
        var ids = (m.detections || []).map(function (d) { return d.id; });
        ids.forEach(function (id) {
          var fresh = !lastSeen[id] || now - lastSeen[id] > forgetMs;
          lastSeen[id] = now;
          if (fresh) {
            node.status({ fill: 'green', shape: 'dot', text: 'tag ' + id });
            node.send({ payload: id, tags: ids, topic: 'tag ' + id });
          }
        });
      });
      node.status({ fill: 'grey', shape: 'ring', text: 'watching' });
    }

    node.server.on('ros connected', subscribe);
    if (node.server.ros.isConnected) { subscribe(); }
    node.on('close', function () { if (node.topic) { node.topic.unsubscribe(); } });
  }
  RED.nodes.registerType('dexi-tag-seen', TagSeenNode);
};
