// Runtime half of the DEXI sim panel. The editor half is dexi-sim-panel.html.
//
// Tells the editor where the simulator viewer and rosbridge are. Same rule as the
// DroneBlocks GCS: DEXI_SIM_URL / DEXI_ROSBRIDGE_URL (or the GCS's NUXT_PUBLIC_*
// names) when set, otherwise the browser's own hostname on ports 1337 and 9090.
module.exports = function (RED) {
  RED.plugins.registerPlugin('dexi-sim-panel', { type: 'dexi-editor-panel' });

  RED.httpAdmin.get('/dexi/sim-panel/config', function (req, res) {
    res.json({
      simUrl: process.env.DEXI_SIM_URL || process.env.NUXT_PUBLIC_SIM_URL || '',
      rosbridgeUrl: process.env.DEXI_ROSBRIDGE_URL || process.env.NUXT_PUBLIC_ROSBRIDGE_URL || ''
    });
  });
};
