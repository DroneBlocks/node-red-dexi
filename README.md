# Node RED flow development for DEXI

You want to make sure you don't lose any of your flow development. Make sure to map the host "flows" directory to the container directory as shown below. This will store the flow on your host machine if/when the container is destroyed.

## Running on Physical Hardware (default)

```docker run -it -p 1880:1880 -v ${PWD}/flows:/data --name dexi-node-red droneblocks/dexi-node-red:latest```

## Running in Simulation Environment

For simulation environments, override the websocket URL:

```docker run -it -p 1880:1880 -e ROS2_WEBSOCKET_URL=ws://ros2-dev:9090 -v ${PWD}/flows:/data --name dexi-node-red droneblocks/dexi-node-red:latest```

The default websocket URL is `ws://192.168.4.1:9090` (physical hardware). Set the `ROS2_WEBSOCKET_URL` environment variable to customize for different environments.

# Node RED custom node development for DEXI

1. Clone the repo:

```
git clone https://github.com/droneblocks/node-red-dexi

cd node-red-dexi
```

2. Launch the container from the base node-red image:

```
docker run -it -p 1880:1880 -v ${PWD}/flows:/data -v ${PWD}:/node-red-dexi --name dexi-node-red nodered/node-red:latest-debian
```

3. Connect to the container
```
docker exec -it dexi-node-red /bin/bash
```

4. First, install the package dependencies in the mapped directory
```
cd /node-red-dexi
npm install
```

5. Install the nodes for local development since we already mapped the host folder node-red-dexi to the container folder /node-red-dexi
```
cd /usr/src/node-red
npm install /node-red-dexi
```

6. Install other nodes

```
npm install node-red-contrib-ui-led
npm install node-red-node-ui-iframe
```

7. Stop and start container to pick up changes.
