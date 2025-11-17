#!/bin/bash

# Build Android APK locally (no EAS required)
# This is 100% free and runs on your computer

set -e

echo "📱 Building Android APK Locally"
echo "================================"
echo ""

# Check if Android SDK is installed
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set"
    echo ""
    echo "Please install Android Studio and set ANDROID_HOME:"
    echo "  export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo ""
    echo "Or download from: https://developer.android.com/studio"
    exit 1
fi

echo "✅ Android SDK found: $ANDROID_HOME"
echo ""

# Generate native Android project if not exists
if [ ! -d "android" ]; then
    echo "📦 Generating native Android project..."
    npx expo prebuild --platform android --clean
    echo "✅ Android project generated"
else
    echo "✅ Android project already exists"
fi

echo ""
echo "🔨 Building release APK..."
cd android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease

cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 APK Location:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📲 Install on device:"
echo "   adb install android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "🎉 Done!"
