FROM nodered/node-red:latest-minimal

RUN npm install @droneblocks/node-red-dexi

RUN npm install node-red-contrib-ui-led