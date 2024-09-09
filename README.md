# Node RED flow development for DEXI
 
You want to make sure you don't lose any of your flow development. Make sure to map the host "flows" directory to the container directory as shown below. This will store the flow on your host machine if/when the container is destroyed.

```docker run -it -p 1880:1880 -v ${PWD}/flows:/data --name dexi-node-red droneblocks/dexi-node-red:latest````

# Node RED custom node development for DEXI
docker run --rm -it -p 1880:1880 -v ${PWD}/flows:/data -v ${PWD}/node-red-dexi:/node-red-dexi --name dexi-node-red droneblocks/dexi-node-red:latest
