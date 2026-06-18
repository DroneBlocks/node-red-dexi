FROM nodered/node-red:latest-minimal

# Set default websocket URL for physical hardware (can be overridden)
ENV ROS2_WEBSOCKET_URL=ws://192.168.4.1:9090

# Pin the DEXI node package to a published version. CI passes PKG_VERSION from
# package.json so the image tag is truthful and the layer cache busts on bump.
# Local builds default to latest.
ARG PKG_VERSION=latest
RUN npm i @droneblocks/node-red-dexi@${PKG_VERSION}

# For displaying led on dashboard
RUN npm i node-red-contrib-ui-led

# For embedding camera stream
RUN npm i node-red-node-ui-iframe

# docker build --no-cache -t droneblocks/dexi-node-red:latest .