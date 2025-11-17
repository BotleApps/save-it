#!/bin/bash

# Build Android AAB for Play Store locally (no EAS required)
# This is 100% free and runs on your computer

set -e

echo "📱 Building Android AAB for Play Store"
echo "======================================"
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
echo "🔨 Building release AAB (Android App Bundle)..."
cd android

# Clean previous builds
./gradlew clean

# Build release AAB
./gradlew bundleRelease

cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 AAB Location:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📤 Upload to Play Store:"
echo "   1. Go to https://play.google.com/console"
echo "   2. Select your app"
echo "   3. Go to Release > Production"
echo "   4. Upload app-release.aab"
echo ""
echo "🎉 Done!"
