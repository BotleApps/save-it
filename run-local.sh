#!/bin/bash

# Save It - Local Development Script
# This script exports the Expo web bundle and serves it locally to test PWA features

set -e

echo "🚀 Save It - Local Development"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install --legacy-peer-deps
    echo ""
fi

# Clean previous build
if [ -d "dist" ]; then
    echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
    rm -rf dist
fi

# Export web bundle
echo -e "${BLUE}📦 Exporting Expo web bundle...${NC}"
EXPO_ROUTER_APP_ROOT=app npx expo export --platform web --output-dir dist

# Copy PWA assets
echo -e "${BLUE}📱 Copying PWA assets...${NC}"
cp -r public/* dist/

# Run web transform script
echo -e "${BLUE}🔧 Applying PWA transformations...${NC}"
node web-transform.js

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo -e "${BLUE}Starting local server...${NC}"
echo ""

# Check if serve is installed globally
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}Installing 'serve' locally...${NC}"
    npx serve dist -p 3005
else
    serve dist -p 3005
fi
