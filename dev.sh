#!/bin/bash

echo "Building dashboard..."
npm run build --prefix ./monitor-processes-dashboard

cargo run --release --manifest-path ./monitor-processes/Cargo.toml