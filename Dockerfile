FROM nodered/node-red:latest-minimal

RUN npm install @droneblocks/node-red-dexi

# For displaying led on dashboard
RUN npm i node-red-contrib-ui-led

# For embedding camera stream
RUN npm i node-red-node-ui-iframe