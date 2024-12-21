#!/bin/bash
set -e

echo "Setting Device IP Address..."
npm run set_device_ip

echo "Building dashboard..."
npm run build --prefix ./monitor-processes-dashboard

echo "Building monitor-process..."
cargo build --release --manifest-path ./monitor-processes/Cargo.toml
