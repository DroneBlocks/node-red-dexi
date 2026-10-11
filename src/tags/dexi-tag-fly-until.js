module.exports = function (RED) {
  var nav = require('../lib/dexi-commands');

  // Flies level in one direction until the tag is seen, then stops. Altitude is held
  // by tag_nav. Horizontal directions only: climbing or descending until a tag
  // appears has no ceiling indoors.
  var BODY = { forward: [1, 0], backward: [-1, 0], right: [0, 1], left: [0, -1] };

  function TagFlyUntilNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var dir = BODY[config.direction] ? config.direction : 'forward';
    var speed = Math.min(Math.abs(Number(config.speed) || 0.25), 1.0);
    var tag = Number(config.tag);
    var label = 'fly ' + dir + ' until tag ' + tag;
    nav.commandNode(RED, node, config, label, function () {
      return nav.call(node, 'fly_until_tag', {
        tag: tag, timeout: Number(config.timeout) || 20,
        forward: BODY[dir][0] * speed, right: BODY[dir][1] * speed, down: 0
      });
    });
  }
  RED.nodes.registerType('dexi-tag-fly-until', TagFlyUntilNode);
};
