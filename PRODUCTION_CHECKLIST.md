# Production-Ready Checklist

## ✅ Already Completed
- [x] Web deployment to Vercel
- [x] PWA configuration with service worker
- [x] GitHub Actions for web deployment
- [x] Responsive design for mobile and desktop
- [x] Dark/light mode support
- [x] Local storage for offline support
- [x] Error boundaries and error handling

## 📱 Mobile App Setup

### 1. EAS (Expo Application Services) Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS project
eas init

# Configure builds
eas build:configure
```

### 2. First Test Build
```bash
# Build for iOS simulator (Mac required)
eas build --platform ios --profile preview

# Build Android APK for testing
eas build --platform android --profile preview

# Or build both
npm run build:preview
```

### 3. Production Build
```bash
# Production build for both platforms
npm run build:all

# Or individually
npm run build:ios
npm run build:android
```

## 🔐 Required Accounts & Credentials

### Apple Developer Account (iOS)
- [ ] Register at https://developer.apple.com ($99/year)
- [ ] Create App ID: `app.rork.save-it`
- [ ] Create App Store Connect app
- [ ] Generate App Store Connect API key
- [ ] Add API key to EAS: `eas credentials`

### Google Play Console (Android)
- [ ] Register at https://play.google.com/console ($25 one-time)
- [ ] Create app listing
- [ ] Generate upload key (handled by EAS)
- [ ] Create service account for API access
- [ ] Grant service account permissions

### Expo Account
- [ ] Create account at https://expo.dev (Free)
- [ ] Create organization (optional)
- [ ] Generate access token for CI/CD

## 🚀 CI/CD Pipeline Setup

### GitHub Secrets to Add
```bash
# Already set:
- VERCEL_TOKEN
- VERCEL_PROJECT_ID
- VERCEL_ORG_ID

# Need to add:
- EXPO_TOKEN (from https://expo.dev/settings/access-tokens)
- APPLE_API_KEY_ID (optional, for auto-submission)
- APPLE_API_ISSUER_ID (optional)
- APPLE_API_KEY (optional, base64 encoded .p8 file)
- GOOGLE_SERVICE_ACCOUNT_JSON (optional, for auto-submission)
```

## 📝 App Store Listing Requirements

### iOS App Store
- [ ] App name: "Save It"
- [ ] Bundle ID: `app.rork.save-it`
- [ ] Primary category: Productivity
- [ ] Age rating: 4+
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Screenshots (required sizes):
  - iPhone 6.7" display
  - iPhone 5.5" display
  - iPad Pro 12.9" display

### Google Play Store
- [ ] App name: "Save It"
- [ ] Package name: `app.rork.save-it`
- [ ] Category: Productivity
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Screenshots (minimum 2):
  - Phone: 16:9 or 9:16 ratio
  - Tablet (optional)
  - Feature graphic: 1024x500

## 🎨 Assets Needed

### App Icons
- [x] iOS icon: 1024x1024 (already in `assets/images/icon.png`)
- [x] Android adaptive icon (already configured)

### Splash Screens
- [x] Splash screen (already in `assets/images/splash-icon.png`)

### Store Screenshots
- [ ] Generate screenshots for all required sizes
- [ ] Create feature graphics
- [ ] Design promotional images

### Marketing Materials
- [ ] App description
- [ ] Keywords for ASO (App Store Optimization)
- [ ] Promotional text
- [ ] What's new in this version text

## 🔒 Security & Privacy

### Required Documents
- [ ] Privacy Policy
  - What data is collected
  - How data is stored (local only)
  - No third-party analytics (unless added)
  - No ads
  - GDPR compliance (if applicable)

- [ ] Terms of Service (optional but recommended)

### App Permissions
- [ ] Internet access (already configured)
- [ ] Storage access (for local data)
- [ ] No location, camera, or microphone needed

## 🧪 Testing Checklist

### Functionality Testing
- [ ] Add new links
- [ ] Edit existing links
- [ ] Delete links
- [ ] Tag management
- [ ] Category filtering
- [ ] Search functionality
- [ ] Dark/light mode toggle
- [ ] Offline support
- [ ] Share target (Android only)

### Platform Testing
- [ ] iOS Simulator
- [ ] Physical iPhone
- [ ] iPad
- [ ] Android Emulator
- [ ] Physical Android device
- [ ] Different screen sizes
- [ ] Different OS versions

### Performance Testing
- [ ] App launch time < 3 seconds
- [ ] Smooth scrolling with 1000+ links
- [ ] No memory leaks
- [ ] Battery usage acceptable
- [ ] Network usage minimal

## 📊 Analytics & Monitoring (Optional)

### Recommended Services
- [ ] Sentry for crash reporting
- [ ] Firebase Analytics (free)
- [ ] App Store Connect analytics
- [ ] Google Play Console analytics

### Setup
```bash
# Install Sentry
npm install --save @sentry/react-native

# Configure in app.config.js
```

## 🔄 Update Strategy

### OTA Updates (Expo Updates)
```bash
# Push JavaScript/asset updates without store review
npm run update
```

- Use for: Bug fixes, content changes, UI tweaks
- Limitations: Cannot add native dependencies
- Users get updates when app is reopened

### Store Updates
- Use for: New features, native dependencies, major changes
- Requires store review (1-2 days for iOS, hours for Android)
- Update version number in `app.json`

## 📈 Launch Preparation

### Pre-Launch
- [ ] Complete all testing
- [ ] Set up analytics
- [ ] Prepare customer support email
- [ ] Create social media accounts (optional)
- [ ] Prepare launch announcement

### App Store Review
- [ ] Submit iOS app for review (2-3 days typical)
- [ ] Submit Android app for review (few hours typical)
- [ ] Respond to review feedback if needed

### Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track download metrics
- [ ] Plan feature updates

## 💰 Cost Summary

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Account | $99 | Annual |
| Google Play Console | $25 | One-time |
| Expo EAS (Free tier) | $0 | Monthly |
| Expo EAS (Production) | $29 | Monthly |
| Vercel (Hobby) | $0 | Monthly |
| Domain (optional) | $10-15 | Annual |
| **Total First Year** | **~$150-200** | - |
| **Ongoing Annual** | **~$450-500** | - |

### Free Alternative
- Use free EAS tier (30 builds/month)
- Manual submissions
- No OTA updates in free tier
- Total: ~$125/year (just Apple + Google)

## 🎯 Next Steps

1. **Immediate** (This week)
   - [ ] Run `eas init` to create project
   - [ ] Create first preview build
   - [ ] Test on physical devices

2. **Short-term** (1-2 weeks)
   - [ ] Register Apple Developer account
   - [ ] Register Google Play Console
   - [ ] Create app listings
   - [ ] Prepare screenshots and descriptions

3. **Medium-term** (3-4 weeks)
   - [ ] Complete testing
   - [ ] Write privacy policy
   - [ ] Submit for review
   - [ ] Set up GitHub Actions secrets

4. **Launch** (1-2 months)
   - [ ] Both apps approved
   - [ ] Public release
   - [ ] Marketing/announcement
   - [ ] Monitor and iterate

## 📚 Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [Expo Forums](https://forums.expo.dev/)
