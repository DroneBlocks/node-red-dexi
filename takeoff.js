module.exports = function(RED) {
    function TakeoffNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            let altitude = msg.payload
            console.log(altitude)
            msg.payload = {"command": 22, "param1": -1, "param2": 0, "param3": 0, "param4": 0, "param5": eval(NaN), "param6": 8.545594667714894, "param7": altitude}
            node.send(msg)
        })
    }
    RED.nodes.registerType("takeoff", TakeoffNode);
}


// msg = VehicleCommand()
// msg.command = VehicleCommand.VEHICLE_CMD_NAV_TAKEOFF
// msg.param1 = float(-1)
// msg.param2 = float(0)
// msg.param3 = float(0)
// msg.param4 = float('nan')
// msg.param5 = float('nan')  // latitude
// msg.param6 = float('nan') // longitude
// msg.param7 = float(alt + self.alt) 

// {"command": 22, "param1": -1, "param2": 0, "param3": 0, "param4": 0, "param5": 47.397742679365244, "param6": 8.545594667714894, "param7": -492}