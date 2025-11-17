#!/bin/bash

# Save It - EAS Setup Script
# This script helps you set up EAS Build for mobile app deployment

set -e

echo "🚀 Save It - EAS Setup"
echo "====================="
echo ""

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI already installed"
fi

echo ""
echo "🔐 Logging in to Expo..."
eas whoami 2>/dev/null || eas login

echo ""
echo "📋 Project Information:"
eas whoami

echo ""
echo "🎯 Initializing EAS project..."
if [ ! -f "eas.json" ]; then
    echo "eas.json not found, creating from template..."
fi

eas init --id $(uuidgen | tr '[:upper:]' '[:lower:]')

echo ""
echo "📱 Configuring builds..."
eas build:configure

echo ""
echo "✅ EAS Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Review eas.json configuration"
echo "2. Run 'npm run build:preview' to create test builds"
echo "3. Run 'npm run build:ios' or 'npm run build:android' for production"
echo ""
echo "For store submission:"
echo "1. Create Apple Developer account: https://developer.apple.com"
echo "2. Create Google Play Console account: https://play.google.com/console"
echo "3. Run 'eas submit --platform ios' or 'eas submit --platform android'"
echo ""
echo "📚 Full documentation: ./DEPLOYMENT.md"
