#!/bin/bash

# e.g. to run this script:
# HA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlOWEwMjI4ODhlZTg0NTI1OGYwNGIyMTcxMjVkMTgyMyIsImlhdCI6MTc1MDUwMzM4NiwiZXhwIjoyMDY1ODYzMzg2fQ.ISXES8h7omKiHAHgm9478wRcZPog-AgKCgNv9L3e1B0" \
# SSH_USER_NAME="ssh" \
# SSH_USER_PASSWORD="pwd" \
# HOSTNAME="automation.wojcik.com.au" \
# REQUIRE_STARTTLS="false" \
# TIMEZONE="Australia/Sydney" \
# ./create.sh

if [ -z "$HOSTNAME" ]; then
    echo "Error: HOSTNAME must be defined!"
    exit 1
fi

if [ -z "$TIMEZONE" ]; then
    echo "Error: TIMEZONE must be defined!"
    exit 1
fi

if [ -z "$SSH_USER_NAME" ]; then
    echo "Error: SSH_USER_NAME must be defined!"
    exit 1
fi

if [ -z "$SSH_USER_PASSWORD" ]; then
    echo "Error: SSH_USER_PASSWORD must be defined!"
    exit 1
fi

if [ -z "$HA_TOKEN" ]; then
    echo "Error: HA_TOKEN must be defined!"
    exit 1
fi

# The name of the image that will be created with 'docker build'
IMAGE_NAME="home-automation-ui-server"

# The name of the container that will be created with docker run
CONTAINER_NAME="home-automation-ui-server"

# The name of the network the mail server will use
NETWORK_NAME="docker-network"

# The driver method used when creting the network if it does not already exist
NETWORK_DRIVER="ipvlan"

# The network interface card used for the network
NETWORK_PARENT="br0"

# The network subnet
NETWORK_SUBNET="10.2.2.0/24"

# The network gateway
NETWORK_GATEWAY="10.2.2.1"

# Static IP address for the host
CONTAINER_IP_ADDR="10.2.2.230"

# Host name
CONTAINER_HOST_NAME="$HOSTNAME"

# The lets encrypt volume
LETS_ENCRYPT_VOLUME="/mnt/disk1/NAS/etc-letsencrypt:/etc/letsencrypt"

# Check if the network exists
if ! docker network ls --format '{{.Name}}' | grep -q "^$NETWORK_NAME$"; then
    echo "Network '$NETWORK_NAME' does not exist. Creating it..."
    docker network create --driver="$NETWORK_DRIVER" --subnet="$NETWORK_SUBNET" --gateway="$NETWORK_GATEWAY" -o parent="$NETWORK_PARENT" "$NETWORK_NAME"
else
    echo "Network '$NETWORK_NAME' already exists."
fi

if ! docker image ls --format '{{.Tag}}' | grep -q "^$IMAGE_NAME$"; then
    echo "Image '$IMAGE_NAME' does not exist. Creating it..."
    docker build -t "$IMAGE_NAME" \
        --build-arg SSH_USER_NAME="$SSH_USER_NAME" \
        --build-arg SSH_USER_PASSWORD="$SSH_USER_PASSWORD" \
        --build-arg HOSTNAME="$HOSTNAME" \
        --build-arg TIMEZONE="$TIMEZONE" \
        --build-arg HA_TOKEN="$HA_TOKEN" \
        .
else
    echo "Image '$IMAGE_NAME' already exists."
fi

docker run \
    -itd --network="$NETWORK_NAME" \
    --ip="$CONTAINER_IP_ADDR" \
    --name="$CONTAINER_NAME" \
    --hostname="$CONTAINER_HOST_NAME" \
    --volume="$LETS_ENCRYPT_VOLUME" \
    "$IMAGE_NAME"
