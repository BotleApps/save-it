#!/bin/bash

# =============================================================================
# App Icon Generator for Save It
# Generates all required icons for iOS, Android, and Web/PWA from a single source
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default source icon (should be at least 1024x1024)
SOURCE_ICON="${1:-assets/images/icon-source.png}"
ASSETS_DIR="assets/images"
PUBLIC_DIR="public"

# Print colored message
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if source icon exists
check_source() {
    if [ ! -f "$SOURCE_ICON" ]; then
        print_error "Source icon not found: $SOURCE_ICON"
        echo ""
        echo "Usage: ./generate-icons.sh [source-icon-path]"
        echo ""
        echo "Please provide a source icon (PNG, at least 1024x1024 pixels)."
        echo "Example: ./generate-icons.sh my-app-icon.png"
        echo ""
        echo "If no source is provided, it looks for: assets/images/icon-source.png"
        exit 1
    fi

    # Check dimensions
    WIDTH=$(sips -g pixelWidth "$SOURCE_ICON" | grep pixelWidth | awk '{print $2}')
    HEIGHT=$(sips -g pixelHeight "$SOURCE_ICON" | grep pixelHeight | awk '{print $2}')

    print_status "Source icon: $SOURCE_ICON (${WIDTH}x${HEIGHT})"

    if [ "$WIDTH" -lt 1024 ] || [ "$HEIGHT" -lt 1024 ]; then
        print_warning "Source icon is smaller than 1024x1024. Quality may be reduced."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Create directories if they don't exist
setup_directories() {
    mkdir -p "$ASSETS_DIR"
    mkdir -p "$PUBLIC_DIR"
    print_status "Directories ready"
}

# Generate a single icon
generate_icon() {
    local size=$1
    local output=$2
    local source=${3:-$SOURCE_ICON}
    
    sips -z $size $size "$source" --out "$output" > /dev/null 2>&1
    echo "  ✓ Generated: $output (${size}x${size})"
}

# Generate icons with padding (for adaptive icons)
generate_padded_icon() {
    local size=$1
    local output=$2
    local padding_percent=$3
    
    # Calculate inner size (icon without padding)
    local inner_size=$(echo "$size * (100 - $padding_percent * 2) / 100" | bc)
    
    # Create temporary resized icon
    local temp_icon="/tmp/temp_icon_$$.png"
    sips -z $inner_size $inner_size "$SOURCE_ICON" --out "$temp_icon" > /dev/null 2>&1
    
    # Create canvas with padding using sips and imagemagick alternative
    # Since we're using macOS, we'll use a simpler approach
    sips -z $size $size "$SOURCE_ICON" --out "$output" > /dev/null 2>&1
    
    rm -f "$temp_icon"
    echo "  ✓ Generated: $output (${size}x${size})"
}

# =============================================================================
# iOS Icons
# =============================================================================
generate_ios_icons() {
    echo ""
    print_status "Generating iOS icons..."
    
    # Main app icon (required: 1024x1024)
    generate_icon 1024 "$ASSETS_DIR/icon.png"
    
    # iOS specific sizes (Expo handles most of these automatically from 1024x1024)
    # But we'll generate the key ones for reference
    
    print_success "iOS icons generated!"
}

# =============================================================================
# Android Icons
# =============================================================================
generate_android_icons() {
    echo ""
    print_status "Generating Android icons..."
    
    # Adaptive icon foreground (recommended: 1024x1024 with safe zone)
    # The safe zone is the center 66%, so we generate at 1024x1024
    generate_icon 1024 "$ASSETS_DIR/adaptive-icon.png"
    
    # Legacy icon sizes for older Android (optional, Expo handles these)
    # mdpi: 48x48, hdpi: 72x72, xhdpi: 96x96, xxhdpi: 144x144, xxxhdpi: 192x192
    
    print_success "Android icons generated!"
}

# =============================================================================
# Web/PWA Icons
# =============================================================================
generate_web_icons() {
    echo ""
    print_status "Generating Web/PWA icons..."
    
    # PWA icons (referenced in manifest.json)
    generate_icon 180 "$PUBLIC_DIR/icon-180.png"
    generate_icon 192 "$PUBLIC_DIR/icon-192.png"
    generate_icon 512 "$PUBLIC_DIR/icon-512.png"
    
    # Additional PWA sizes (good to have)
    generate_icon 72 "$PUBLIC_DIR/icon-72.png"
    generate_icon 96 "$PUBLIC_DIR/icon-96.png"
    generate_icon 128 "$PUBLIC_DIR/icon-128.png"
    generate_icon 144 "$PUBLIC_DIR/icon-144.png"
    generate_icon 256 "$PUBLIC_DIR/icon-256.png"
    generate_icon 384 "$PUBLIC_DIR/icon-384.png"
    
    # Apple touch icons
    generate_icon 180 "$PUBLIC_DIR/apple-touch-icon.png"
    generate_icon 152 "$PUBLIC_DIR/apple-touch-icon-152x152.png"
    generate_icon 167 "$PUBLIC_DIR/apple-touch-icon-167x167.png"
    
    print_success "Web/PWA icons generated!"
}

# =============================================================================
# Favicons
# =============================================================================
generate_favicons() {
    echo ""
    print_status "Generating favicons..."
    
    # Standard favicon sizes
    generate_icon 16 "$PUBLIC_DIR/favicon-16x16.png"
    generate_icon 32 "$PUBLIC_DIR/favicon-32x32.png"
    generate_icon 48 "$PUBLIC_DIR/favicon-48x48.png"
    
    # Copy 48x48 as main favicon.png
    cp "$PUBLIC_DIR/favicon-48x48.png" "$ASSETS_DIR/favicon.png"
    echo "  ✓ Copied: $ASSETS_DIR/favicon.png (48x48)"
    
    # Generate ICO file (multi-resolution)
    # macOS doesn't have native ICO support, so we'll create a simple one
    # or use the 32x32 PNG as the base
    if command -v convert &> /dev/null; then
        # ImageMagick is available
        convert "$PUBLIC_DIR/favicon-16x16.png" "$PUBLIC_DIR/favicon-32x32.png" "$PUBLIC_DIR/favicon-48x48.png" "$PUBLIC_DIR/favicon.ico"
        echo "  ✓ Generated: $PUBLIC_DIR/favicon.ico (multi-resolution)"
    else
        # Fallback: just copy 32x32 as ico (browsers handle PNG favicons)
        cp "$PUBLIC_DIR/favicon-32x32.png" "$PUBLIC_DIR/favicon.ico"
        print_warning "ImageMagick not found. Created simple favicon.ico from 32x32 PNG"
        echo "  Install ImageMagick for multi-resolution ICO: brew install imagemagick"
    fi
    
    print_success "Favicons generated!"
}

# =============================================================================
# Splash Screen Icons
# =============================================================================
generate_splash_icons() {
    echo ""
    print_status "Generating splash screen icons..."
    
    # Splash icon (centered logo on splash screen)
    generate_icon 512 "$ASSETS_DIR/splash-icon.png"
    
    # Larger splash for high-res devices
    generate_icon 1024 "$ASSETS_DIR/splash-icon@2x.png"
    
    print_success "Splash icons generated!"
}

# =============================================================================
# Notification Icons (Android)
# =============================================================================
generate_notification_icons() {
    echo ""
    print_status "Generating notification icons..."
    
    # Android notification icon (should be simple, single color works best)
    generate_icon 96 "$ASSETS_DIR/notification-icon.png"
    
    print_success "Notification icons generated!"
}

# =============================================================================
# Summary
# =============================================================================
print_summary() {
    echo ""
    echo "============================================================================="
    print_success "All icons generated successfully!"
    echo "============================================================================="
    echo ""
    echo "Generated icons:"
    echo ""
    echo "📱 iOS:"
    echo "   • $ASSETS_DIR/icon.png (1024x1024) - Main app icon"
    echo ""
    echo "🤖 Android:"
    echo "   • $ASSETS_DIR/adaptive-icon.png (1024x1024) - Adaptive icon foreground"
    echo ""
    echo "🌐 Web/PWA:"
    echo "   • $PUBLIC_DIR/icon-72.png through icon-512.png"
    echo "   • $PUBLIC_DIR/apple-touch-icon*.png"
    echo ""
    echo "🔖 Favicons:"
    echo "   • $PUBLIC_DIR/favicon-16x16.png, favicon-32x32.png, favicon-48x48.png"
    echo "   • $PUBLIC_DIR/favicon.ico"
    echo "   • $ASSETS_DIR/favicon.png"
    echo ""
    echo "🎨 Splash:"
    echo "   • $ASSETS_DIR/splash-icon.png (512x512)"
    echo "   • $ASSETS_DIR/splash-icon@2x.png (1024x1024)"
    echo ""
    echo "🔔 Notifications:"
    echo "   • $ASSETS_DIR/notification-icon.png (96x96)"
    echo ""
    echo "============================================================================="
    echo ""
    print_status "Next steps:"
    echo "  1. Review generated icons for quality"
    echo "  2. Run 'npx expo start' to test"
    echo "  3. Run 'npx expo build' for production"
    echo ""
}

# =============================================================================
# Update manifest.json with all icon sizes
# =============================================================================
update_manifest() {
    echo ""
    print_status "Updating public/manifest.json with all icon sizes..."
    
    # Create updated manifest with all icons
    cat > "$PUBLIC_DIR/manifest.json" << 'EOF'
{
  "name": "Save It - Link Manager",
  "short_name": "Save It",
  "description": "Save and organize your links, articles, and resources. Works offline with full local storage.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
  "orientation": "portrait-primary",
  "theme_color": "#5B5FC7",
  "background_color": "#FFFFFF",
  "lang": "en-US",
  "dir": "ltr",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/favicon-48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icon-128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icon-180.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-256.png",
      "sizes": "256x256",
      "type": "image/png"
    },
    {
      "src": "/icon-384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "utilities"],
  "shortcuts": [
    {
      "name": "Add New Link",
      "short_name": "New Link",
      "description": "Quick add a new link",
      "url": "/new-link",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192",
          "purpose": "any"
        }
      ]
    },
    {
      "name": "View All Links",
      "short_name": "All Links",
      "description": "View all saved links",
      "url": "/",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192",
          "purpose": "any"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
EOF
    
    print_success "manifest.json updated!"
}

# =============================================================================
# Main
# =============================================================================
main() {
    echo ""
    echo "============================================================================="
    echo "                    Save It - App Icon Generator"
    echo "============================================================================="
    echo ""
    
    check_source
    setup_directories
    
    generate_ios_icons
    generate_android_icons
    generate_web_icons
    generate_favicons
    generate_splash_icons
    generate_notification_icons
    update_manifest
    
    print_summary
}

# Run main function
main
