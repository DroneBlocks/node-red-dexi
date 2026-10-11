module.exports = function (RED) {
  var ROSLIB = require('roslib');   // tag_nav status topic
  var nav = require('../lib/dexi-commands');

  // Waits for the pilot to hand the aircraft over: armed, airborne, Offboard and
  // engaged (RC Offboard switch). Before waiting it starts the manager's setpoint
  // stream, which PX4 needs before it will accept the switch to Offboard. To start a
  // mission without a pilot (simulator included), use a take off node instead.
  function TagHandoffNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var timeout = Number(config.timeout) || 120;

    // Watches tag_nav's status for "engaged, armed, in Offboard" rather than calling
    // wait_for_offboard. tag_nav serves one command at a time, so a long wait held on its
    // service would block every other client (DroneBlocks, Python, the next node).
    function waitForHandoff(timeoutS) {
      return new Promise(function (resolve) {
        var t = new ROSLIB.Topic({ ros: node.server.ros, name: '/dexi/tag_nav/status', messageType: 'std_msgs/String' });
        var done = false;
        function finish(r) { if (!done) { done = true; clearTimeout(timer); t.unsubscribe(); node.removeListener('close', onClose); resolve(r); } }
        function onClose() { finish({ ok: false, message: 'flow stopped' }); }
        var timer = setTimeout(function () { finish({ ok: false, message: 'no hand-off within ' + timeoutS + ' s' }); }, timeoutS * 1000);
        node.on('close', onClose);
        t.subscribe(function (m) {
          var st = {};
          try { st = JSON.parse(m.data); } catch (e) { return; }
          if (st.engaged === true && st.armed === true && st.nav_state === 14) {
            finish({ ok: true, message: 'hand-off accepted' });
          }
        });
      });
    }

    nav.commandNode(RED, node, config, 'hand-off', async function () {
      var r = await nav.call(node, 'start_setpoint_stream', { timeout: 5 });
      if (!r.ok) { return r; }
      node.status({ fill: 'blue', shape: 'dot', text: 'waiting for the pilot (Offboard switch)' });
      return waitForHandoff(timeout);
    });
  }
  RED.nodes.registerType('dexi-tag-handoff', TagHandoffNode);
};
