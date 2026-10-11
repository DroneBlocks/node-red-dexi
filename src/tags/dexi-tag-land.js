module.exports = function (RED) {
  var nav = require('../lib/dexi-commands');

  // Lands on a tag: centers over it, then hands the landing to the flight controller.
  // Untick "center first" to land where the aircraft is (the usual failure path).
  function TagLandNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var tag = Number(config.tag);
    var center = config.center !== false;
    var label = center ? 'land on tag ' + tag : 'land here';
    var onlyOffboard = config.onlyOffboard === true;
    nav.commandNode(RED, node, config, label, async function () {
      if (onlyOffboard) {
        // On a failure path: land only if the mission still has the aircraft. A step
        // also fails when the pilot takes over (leaves Offboard), and landing then
        // would take the aircraft away from the pilot.
        var t = await nav.telemetry(node);
        if (!t || t.mode !== 'Offboard') {
          node.status({ fill: 'grey', shape: 'ring', text: 'not landing: ' + (t ? 'pilot has the aircraft (' + t.mode + ')' : 'no telemetry') });
          return { ok: true, message: 'not landing: the mission does not have the aircraft' };
        }
      }
      if (center) {
        var r = await nav.call(node, 'center_on_tag', { tag: tag, timeout: 25 });
        if (!r.ok) { return r; }
      }
      return nav.call(node, 'land', { timeout: 30 });
    });
  }
  RED.nodes.registerType('dexi-tag-land', TagLandNode);
};
