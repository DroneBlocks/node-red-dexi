# Node RED flow development for DEXI
 
You want to make sure you don't lose any of your flow development. Make sure to map the host "flows" directory to the container directory as shown below. This will store the flow on your host machine if/when the container is destroyed.

```docker run -it -p 1880:1880 -v ${PWD}/flows:/data --name dexi-node-red droneblocks/dexi-node-red:latest```

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

4. Install the nodes for local development since we already mapped the host folder node-red-dexi to the container folder /node-red-dexi
```
npm install /node-red-dexi
```

5. Install other nodes

```
npm install node-red-contrib-ui-led
npm install node-red-node-ui-iframe
```

6. Stop and start container to pick up changes.
