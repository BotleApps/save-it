# App Icons Guide for Save It

This document outlines the required app icons for iOS, Android, and Web platforms.

## Current Status

| Icon | Current Size | Required Size | Status |
|------|--------------|---------------|--------|
| `icon.png` | 600x600 | 1024x1024 | ⚠️ Needs update |
| `adaptive-icon.png` | 1408x1408 | 1024x1024 | ✅ Good |
| `splash-icon.png` | 512x512 | 512x512+ | ✅ OK (optional: larger) |
| `favicon.png` | 16x16 | 48x48 | ⚠️ Needs update |

## Required Icons

### 1. Main App Icon (`icon.png`)
- **Location:** `assets/images/icon.png`
- **Required Size:** 1024x1024 pixels
- **Format:** PNG (no transparency for iOS)
- **Usage:** iOS app icon, fallback for Android

**Important for iOS:**
- Must be exactly 1024x1024 pixels
- No transparency (use solid background)
- No rounded corners (iOS applies them automatically)
- Expo will automatically generate all required sizes:
  - 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

### 2. Android Adaptive Icon (`adaptive-icon.png`)
- **Location:** `assets/images/adaptive-icon.png`
- **Required Size:** 1024x1024 pixels (current 1408x1408 is fine)
- **Format:** PNG with transparency allowed
- **Usage:** Android 8.0+ adaptive icons

**Important for Android:**
- The icon should have a "safe zone" - keep important content within the center 66% (about 672x672 in a 1024x1024 image)
- The edges may be cropped into different shapes (circle, squircle, rounded square)
- Background color is set in `app.json` → `android.adaptiveIcon.backgroundColor`

### 3. Splash Screen Icon (`splash-icon.png`)
- **Location:** `assets/images/splash-icon.png`
- **Current Size:** 512x512 pixels
- **Recommended Size:** 512x512 to 1024x1024 pixels
- **Format:** PNG with transparency allowed
- **Usage:** Displayed on splash screen during app load

### 4. Web Favicon (`favicon.png`)
- **Location:** `assets/images/favicon.png`
- **Required Size:** 48x48 pixels (minimum, current 16x16 is too small)
- **Format:** PNG
- **Usage:** Browser tab icon

**For PWA, also consider:**
- 192x192 icon for Android PWA
- 512x512 icon for PWA splash screens
- These should be added to `public/manifest.json`

## How to Update Icons

### Option 1: Manual Creation
1. Create a master icon at 1024x1024 pixels
2. Export as PNG without transparency for iOS (`icon.png`)
3. Export as PNG (transparency OK) for Android (`adaptive-icon.png`)
4. Create smaller versions for favicon (48x48)

### Option 2: Using Online Tools
- [MakeAppIcon](https://makeappicon.com/) - Generates all sizes automatically
- [App Icon Generator](https://appicon.co/) - Free online generator
- [Figma App Icon Template](https://www.figma.com/community/file/824894885635013536) - Design template

### Option 3: Using Expo CLI
After updating your master icon to 1024x1024:
```bash
# Expo will automatically resize icons during build
npx expo prebuild
```

## PWA Icons (Web)

Update `public/manifest.json` with proper icon sizes:

```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Icon Design Guidelines

### iOS Guidelines
- Use simple, recognizable imagery
- Avoid text (it won't be readable at small sizes)
- Use a unique silhouette
- Design for a solid background (no transparency)

### Android Guidelines  
- Design within the safe zone (center 66%)
- Test with different mask shapes (circle, square, squircle)
- Adaptive icons can have separate foreground and background layers

### General Tips
- Test at small sizes (29x29) to ensure recognizability
- Use bold, simple shapes
- Maintain consistent branding with app theme color (#5B5FC7)
- Export at the highest quality PNG settings

## Action Items

1. ⚠️ **Update `icon.png`** to 1024x1024 pixels
2. ⚠️ **Update `favicon.png`** to at least 48x48 pixels  
3. ✅ `adaptive-icon.png` is already good (1408x1408)
4. 📝 Consider adding PWA icons to `public/` folder
5. 📝 Update `public/manifest.json` with proper icon references

## Testing

After updating icons:
1. Run `npx expo start` and check the app icon on simulators
2. Build with `npx expo build` or EAS Build to test production icons
3. Test PWA installation on mobile browsers
