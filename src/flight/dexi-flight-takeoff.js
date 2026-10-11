module.exports = function (RED) {
  var nav = require('../lib/dexi-commands');

  // Arms and takes off in Offboard to a height, through the offboard manager. Works in
  // the simulator and on an aircraft; the pilot can take over by leaving Offboard.
  function TagTakeoffNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var altitude = Math.min(Math.max(Number(config.altitude) || 1.5, 0.5), 3.0);
    nav.commandNode(RED, node, config, 'take off to ' + altitude + ' m', async function () {
      var r = await nav.call(node, 'arm', { timeout: 10 });
      if (!r.ok) { return r; }
      return nav.call(node, 'offboard_takeoff', { value: altitude, timeout: 30 });
    });
  }
  RED.nodes.registerType('dexi-flight-takeoff', TagTakeoffNode);
};
