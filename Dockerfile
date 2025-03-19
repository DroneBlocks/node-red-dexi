FROM nodered/node-red:latest-debian

# Install TensorFlow.js with native acceleration
RUN npm install --unsafe-perm \
    @tensorflow/tfjs-node \
    @tensorflow-models/coco-ssd \
    @tensorflow-models/handpose \
    jpeg-js

# Was necessary to overcome a binding error
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

RUN npm i @droneblocks/node-red-dexi

# For displaying led on dashboard
RUN npm i node-red-contrib-ui-led

# For embedding camera stream
RUN npm i node-red-node-ui-iframe

# docker build --no-cache -t droneblocks/dexi-node-red:latest .