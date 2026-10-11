module.exports = function (RED) {
  var nav = require('../lib/dexi-commands');

  // Centers the aircraft over a tag, then stays centered for "hold" seconds (default 1)
  // while tag_nav keeps correcting from the tag. Tag -1 = whichever tag is in view.
  function TagCenterNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var tag = Number(config.tag);
    var hold = config.hold === undefined || config.hold === '' ? 1 : Math.max(0, Number(config.hold));
    var name = tag === -1 ? 'any tag' : 'tag ' + tag;
    nav.commandNode(RED, node, config, 'center on ' + name, async function () {
      var r = await nav.call(node, 'center_on_tag', { tag: tag, timeout: Number(config.timeout) || 25 });
      if (!r.ok || hold <= 0) { return r; }
      var t0 = Date.now();
      var tick = setInterval(function () {
        var left = Math.max(0, hold - (Date.now() - t0) / 1000);
        node.status({ fill: 'blue', shape: 'dot', text: 'holding over ' + name + '… ' + left.toFixed(0) + ' s' });
      }, 500);
      // tag_nav's hold_on_tag takes the hold time in the timeout field.
      var h = await nav.call(node, 'hold_on_tag', { tag: tag, holdS: hold });
      clearInterval(tick);
      return h.ok ? { ok: true, message: r.message + ', held ' + hold + ' s' } : h;
    });
  }
  RED.nodes.registerType('dexi-tag-center', TagCenterNode);
};
