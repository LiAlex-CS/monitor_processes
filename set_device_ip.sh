#!/bin/bash

if command -v ifconfig >/dev/null 2>&1; then
    DEVICE_IP=$(ifconfig | grep 'inet ' | awk '{print $2}' | grep -v '127.0.0.1' | head -n 1)
else
    echo "Neither 'ip' nor 'ifconfig' is available. Please install one of them."
    exit 1
fi
# Check if an IP was found
if [ -z "$DEVICE_IP" ]; then
    echo "Could not determine IP address. Ensure you are connected to a network."
    exit 1
fi

ENV_FILE="./monitor-processes-dashboard/.env"

# Update or add DEVICE_IP to the .env file
if grep -q "^VITE_DEVICE_IP=" "$ENV_FILE"; then
    # Update the existing entry
    sed -i "s/^VITE_DEVICE_IP=.*/VITE_DEVICE_IP=$DEVICE_IP/" "$ENV_FILE"
else
    # Add a new entry
    echo "VITE_DEVICE_IP=$DEVICE_IP" >> "$ENV_FILE"
fi

echo "VITE_DEVICE_IP set to $DEVICE_IP in $ENV_FILE"