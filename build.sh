#!/bin/bash

npm run build --prefix ./monitor-processes-dashboard

cargo build --release --manifest-path ./monitor-processes/Cargo.toml