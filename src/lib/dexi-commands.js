// Shared plumbing for the tag navigation nodes. Not a node itself.
//
// Every step is a ROS 2 service call that answers when the step is done (or failed).
// The offboard manager serves flight steps (arm, takeoff, land, mode switches) on
// /dexi/flight/command; tag_nav (dexi_apriltag) serves the AprilTag primitives on
// /dexi/tag_nav/command.

var ROSLIB = require('roslib');

var FLIGHT = { name: '/dexi/flight/command', type: 'dexi_interfaces/srv/FlightCommand' };
var TAG_NAV = { name: '/dexi/tag_nav/command', type: 'dexi_interfaces/srv/TagNavCommand' };
var TAG_COMMANDS = ['center_on_tag', 'hold_on_tag', 'fly_until_tag', 'wait_for_tag', 'wait_for_offboard'];

// Calls one command and resolves { ok, message }. Never rejects: a missing service,
// a dropped connection or a timeout all come back as ok=false with the reason.
//   flight:  opts.value, opts.north/east/down/yaw, opts.timeout
//   tag nav: opts.tag, opts.holdS, opts.forward/right/down, opts.timeout
function call(node, command, opts) {
  opts = opts || {};
  var isTag = TAG_COMMANDS.indexOf(command) >= 0;
  var service = isTag ? TAG_NAV : FLIGHT;
  var timeout = Number(opts.timeout || 30);
  var request = isTag ? {
    command: command, tag_id: Math.round(Number(opts.tag === undefined ? -1 : opts.tag)),
    hold_s: Number(opts.holdS || 0), forward: Number(opts.forward || 0), right: Number(opts.right || 0),
    down: Number(opts.down || 0), timeout: timeout
  } : {
    command: command, value: Number(opts.value || 0), north: Number(opts.north || 0),
    east: Number(opts.east || 0), down: Number(opts.down || 0), yaw: Number(opts.yaw || 0), timeout: timeout
  };
  return new Promise(function (resolve) {
    var ros = node.server && node.server.ros;
    if (!ros || !ros.isConnected) {
      return resolve({ ok: false, message: 'rosbridge not connected' });
    }
    var client = new ROSLIB.Service({ ros: ros, name: service.name, serviceType: service.type });
    var done = false;
    // The service answers when the step finishes; allow a margin past its own limit.
    var waitS = timeout + Number(opts.holdS || 0) + 10;
    var timer = setTimeout(function () {
      if (!done) { done = true; resolve({ ok: false, message: command + ': no answer from ' + service.name }); }
    }, waitS * 1000);
    client.callService(request, function (r) {
      if (done) { return; }
      done = true; clearTimeout(timer);
      resolve({ ok: !!r.success, message: r.message || '' });
    }, function (err) {
      if (done) { return; }
      done = true; clearTimeout(timer);
      resolve({ ok: false, message: String(err) });
    });
  });
}

// One message from /dexi/telemetry (the drone's 2 Hz JSON summary), or null after 3 s.
function telemetry(node) {
  return new Promise(function (resolve) {
    var ros = node.server && node.server.ros;
    if (!ros || !ros.isConnected) { return resolve(null); }
    var t = new ROSLIB.Topic({ ros: ros, name: '/dexi/telemetry', messageType: 'std_msgs/String' });
    var timer = setTimeout(function () { t.unsubscribe(); resolve(null); }, 3000);
    t.subscribe(function (m) {
      clearTimeout(timer); t.unsubscribe();
      try { resolve(JSON.parse(m.data)); } catch (e) { resolve(null); }
    });
  });
}

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Wires up a command node: one input, one output. The output fires when the step
// finishes. A failed step raises a Node-RED error carrying the message, so one Catch
// node can handle every failure in a flow (land, alert) without a wire per step.
// A message arriving while a step runs is dropped, so a double click or a stray
// trigger cannot start two primitives at once.
function commandNode(RED, node, config, label, run) {
  node.server = RED.nodes.getNode(config.server);
  node.busy = false;
  node.status({});
  node.on('input', function (msg, send, done) {
    send = send || function () { node.send.apply(node, arguments); };
    done = done || function (err) { if (err) { node.error(err, msg); } };
    if (node.busy) {
      // Expected on a double click or a second trigger while the step runs.
      node.debug(label + ' is already running; ignoring the new message');
      done();
      return;
    }
    node.busy = true;
    node.status({ fill: 'blue', shape: 'dot', text: label + '…' });
    Promise.resolve(run(msg, node)).then(function (r) {
      node.busy = false;
      msg.tagnav = { step: label, ok: r.ok, message: r.message };
      if (r.ok) {
        node.status({ fill: 'green', shape: 'dot', text: label + ' ✓' });
        send(msg);
        done();
      } else {
        node.status({ fill: 'red', shape: 'ring', text: label + ': ' + r.message });
        done(label + ': ' + r.message);
      }
    });
  });
  node.on('close', function () { node.busy = false; });
}

module.exports = { call: call, sleep: sleep, telemetry: telemetry, commandNode: commandNode };
