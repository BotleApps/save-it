#!/usr/bin/env bash
set -euo pipefail

echo "Starting Expo dev server in background..."
# start expo in background; logs will show in terminal
npx expo start --tunnel &
EXPO_PID=$!

echo "Waiting 5s for Expo to bootstrap..."
sleep 5

echo "Running sentry demo script..."
node scripts/sentry-demo.js || true

echo "You can stop Expo with: kill $EXPO_PID"
