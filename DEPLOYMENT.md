# Deployment Guide

## Overview

This application can be deployed to:
- **Web**: Vercel (already configured)
- **iOS**: Apple App Store via EAS Build
- **Android**: Google Play Store via EAS Build

## Prerequisites

### 1. Expo Account
```bash
npm install -g eas-cli
eas login
```

### 2. Initialize EAS Project
```bash
eas init
eas build:configure
```

This will create an EAS project and add the project ID to your `app.config.js`.

### 3. Apple Developer Account (for iOS)
- Enroll at https://developer.apple.com
- Cost: $99/year
- Required for:
  - App Store distribution
  - Push notifications
  - In-app purchases

### 4. Google Play Console Account (for Android)
- Register at https://play.google.com/console
- One-time fee: $25
- Required for Play Store distribution

## Local Development Builds

### iOS Simulator Build
```bash
eas build --platform ios --profile preview
```

### Android APK Build
```bash
eas build --platform android --profile preview
```

### Development Build (with hot reload)
```bash
eas build --platform all --profile development
```

## Production Builds

### Build for Both Platforms
```bash
eas build --platform all --profile production
```

### Build iOS Only
```bash
eas build --platform ios --profile production
```

### Build Android Only
```bash
eas build --platform android --profile production
```

## Automated CI/CD Pipeline

### Setup GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

1. **EXPO_TOKEN**
   ```bash
   eas whoami
   # Get your access token from: https://expo.dev/accounts/[username]/settings/access-tokens
   ```

2. **VERCEL_TOKEN** (already set)
3. **VERCEL_PROJECT_ID** (already set)
4. **VERCEL_ORG_ID** (already set)

### iOS App Store Submission Setup

1. **App Store Connect API Key**
   - Go to https://appstoreconnect.apple.com/access/api
   - Create a new key with App Manager role
   - Download the .p8 key file
   - Add to GitHub Secrets:
     - `APPLE_API_KEY_ID`: Key ID
     - `APPLE_API_ISSUER_ID`: Issuer ID
     - `APPLE_API_KEY`: Contents of .p8 file (base64 encoded)

2. **Update eas.json**
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "1234567890",
         "appleTeamId": "ABCD123456"
       }
     }
   }
   ```

### Android Play Store Submission Setup

1. **Create Service Account**
   - Go to Google Cloud Console
   - Create a service account with Play Store access
   - Download JSON key file
   - Add to GitHub Secrets as `GOOGLE_SERVICE_ACCOUNT_JSON`

2. **Update eas.json**
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./google-service-account.json",
         "track": "internal"
       }
     }
   }
   ```

## Manual Deployment

### Web Deployment (Vercel)
```bash
# Already automated via GitHub Actions
git push origin main
```

### iOS Deployment
```bash
# Build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

### Android Deployment
```bash
# Build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest
```

## Environment Configuration

### Development
- Local testing with Expo Go
- Web: http://localhost:3005
- Mobile: Scan QR code with Expo Go app

### Preview
- Internal distribution builds
- TestFlight (iOS) / Internal testing (Android)
- Not published to stores

### Production
- App Store / Play Store builds
- Public distribution
- Versioned releases

## Build Profiles

| Profile | Use Case | iOS Output | Android Output |
|---------|----------|------------|----------------|
| `development` | Development builds with hot reload | Simulator build | APK (debug) |
| `preview` | Internal testing | Simulator/Device build | APK (release) |
| `production` | Store submission | Archive (.ipa) | AAB (release) |

## App Store Assets

### Required Assets

1. **App Icon**
   - Already configured: `assets/images/icon.png` (1024×1024)
   - Auto-generated for all sizes

2. **Splash Screen**
   - Already configured: `assets/images/splash-icon.png`

3. **Screenshots** (Required for submission)
   - iPhone 6.7" (1290×2796 or 1242×2688)
   - iPhone 5.5" (1242×2208)
   - iPad Pro 12.9" (2048×2732)
   - Android Phone (1080×1920 or higher)
   - Android Tablet (1920×1200 or higher)

4. **App Store Listing**
   - App Name: "Save It"
   - Subtitle: "Save and organize your links"
   - Description: [Write compelling description]
   - Keywords: bookmarks, links, save, organize, read later
   - Category: Productivity
   - Age Rating: 4+

## Over-the-Air (OTA) Updates

EAS Update allows you to push updates without store review:

```bash
# Publish update
eas update --branch production --message "Fix critical bug"
```

Users get updates automatically when they open the app (for JS/asset changes only).

## Testing

### TestFlight (iOS)
```bash
# Build and submit to TestFlight
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Google Play Internal Testing (Android)
```bash
# Build and submit to internal track
eas build --platform android --profile production
eas submit --platform android --track internal
```

## Monitoring

- **EAS Dashboard**: https://expo.dev/accounts/[username]/projects/save-it
- **Build Status**: Monitor builds in real-time
- **Crash Reports**: Integrated with Sentry (optional)
- **Analytics**: Can integrate with Firebase/Amplitude

## Version Management

1. **Update version in app.json**
   ```json
   {
     "expo": {
       "version": "1.0.1"
     }
   }
   ```

2. **Build and submit**
   ```bash
   eas build --platform all --profile production --auto-submit
   ```

3. **Tag release**
   ```bash
   git tag v1.0.1
   git push --tags
   ```

## Troubleshooting

### Build Fails
- Check EAS build logs: `eas build:list`
- View specific build: `eas build:view [build-id]`

### Submission Fails
- iOS: Check App Store Connect for review status
- Android: Check Play Console for review status

### OTA Updates Not Working
- Ensure runtime version matches
- Check network connectivity
- Clear app cache and restart

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| EAS Build | 30 builds/month | $29/month (unlimited) |
| EAS Update | Unlimited | Included |
| Vercel | 100GB bandwidth | $20/month |
| Apple Developer | - | $99/year |
| Google Play | - | $25 one-time |

## Next Steps

1. ✅ Web deployment (already done)
2. ⬜ Initialize EAS project: `eas init`
3. ⬜ Create first build: `eas build --platform all --profile preview`
4. ⬜ Test on physical devices
5. ⬜ Set up GitHub Actions secrets
6. ⬜ Create App Store / Play Store listings
7. ⬜ Submit for review
8. ⬜ Launch! 🚀

## Support

- EAS Documentation: https://docs.expo.dev/eas/
- Community: https://forums.expo.dev/
- Discord: https://chat.expo.dev/
