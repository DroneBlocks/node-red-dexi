# Pinned (was 'latest-minimal'): freeze the Node-RED base so image rebuilds
# don't silently jump major versions / Node.js runtimes. Bump deliberately.
FROM nodered/node-red:5.0.0-minimal

# Default websocket URL for physical hardware (can be overridden).
# host.docker.internal resolves to the Docker bridge gateway (the host), which
# is stable regardless of the drone's LAN IP, so the ROS2 websocket keeps
# working when the drone leaves AP mode (192.168.4.1) and joins a network.
# Requires the container to be run with --add-host=host.docker.internal:host-gateway.
ENV ROS2_WEBSOCKET_URL=ws://host.docker.internal:9090

RUN npm i @droneblocks/node-red-dexi

# For displaying led on dashboard
RUN npm i node-red-contrib-ui-led

# For embedding camera stream
RUN npm i node-red-node-ui-iframe

# docker build --no-cache -t droneblocks/dexi-node-red:latest .