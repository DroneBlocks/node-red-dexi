# Node RED flow development for DEXI
docker run -it -p 1880:1880 -v ${PWD}/flows:/data --name dexi-node-red droneblocks/dexi-node-red:latest

# Node RED custom node development for DEXI
docker run --rm -it -p 1880:1880 -v ${PWD}/flows:/data -v ${PWD}/node-red-dexi:/node-red-dexi --name dexi-node-red2 droneblocks/dexi-node-red:latest
