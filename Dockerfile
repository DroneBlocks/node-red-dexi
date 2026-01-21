FROM nodered/node-red:latest-minimal

# Set default websocket URL for physical hardware (can be overridden)
ENV ROS2_WEBSOCKET_URL=ws://192.168.4.1:9090

RUN npm i @droneblocks/node-red-dexi

# For displaying led on dashboard
RUN npm i node-red-contrib-ui-led

# For embedding camera stream
RUN npm i node-red-node-ui-iframe

# docker build --no-cache -t droneblocks/dexi-node-red:latest .