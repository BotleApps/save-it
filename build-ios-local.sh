#!/bin/bash

# Build iOS app locally (no EAS required)
# Requires Mac with Xcode
# This is 100% free

set -e

echo "🍎 Building iOS App Locally"
echo "==========================="
echo ""

# Check if running on Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ iOS builds require macOS"
    echo ""
    echo "Options:"
    echo "  1. Use EAS Build (no Mac needed): npm run build:ios"
    echo "  2. Use a Mac or Mac VM"
    echo "  3. Use GitHub Actions with macos-latest runner"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found"
    echo ""
    echo "Please install Xcode from the App Store"
    echo "Then run: xcode-select --install"
    exit 1
fi

echo "✅ Xcode found: $(xcodebuild -version | head -n 1)"
echo ""

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "📦 Installing CocoaPods..."
    sudo gem install cocoapods
fi

echo "✅ CocoaPods found: $(pod --version)"
echo ""

# Generate native iOS project if not exists
if [ ! -d "ios" ]; then
    echo "📦 Generating native iOS project..."
    npx expo prebuild --platform ios --clean
    echo "✅ iOS project generated"
else
    echo "✅ iOS project already exists"
fi

echo ""
echo "📦 Installing iOS dependencies..."
cd ios
pod install
cd ..

echo ""
echo "🔨 Building iOS app..."
echo ""
echo "Opening Xcode..."
echo ""
echo "To build from Xcode:"
echo "  1. Select 'Any iOS Device' or your connected iPhone"
echo "  2. Product > Archive"
echo "  3. Distribute App > App Store Connect"
echo ""

# Open Xcode
open ios/*.xcworkspace

echo "✅ Xcode opened!"
echo ""
echo "Alternative - Build from command line:"
echo "  cd ios"
echo "  xcodebuild -workspace *.xcworkspace -scheme SaveIt archive"
