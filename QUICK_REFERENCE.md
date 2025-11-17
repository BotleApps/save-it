# 🚀 Quick Reference

## Local Development

```bash
# Start all platforms
npm start

# Web only
npm run start-web
# or
./run-local.sh

# iOS
Press 'i' or npm run ios

# Android  
Press 'a' or npm run android
```

## Build Commands

```bash
# Test builds (APK/Simulator)
npm run build:preview

# Production builds
npm run build:ios           # iOS App Store
npm run build:android       # Google Play
npm run build:all          # Both platforms

# Web build (automatic via GitHub Actions)
git push origin main
```

## Submit to Stores

```bash
npm run submit:ios
npm run submit:android
```

## Over-the-Air Updates

```bash
npm run update
```

## EAS Commands

```bash
# View build status
eas build:list

# View specific build
eas build:view [build-id]

# Manage credentials
eas credentials

# View project info
eas project:info

# Create update
eas update --branch production --message "Update description"
```

## Testing URLs

- **Local Web**: http://localhost:3005
- **Production Web**: https://save-it-chi.vercel.app
- **Expo Dev**: Scan QR code with Expo Go app

## Cost Breakdown

| Service | Cost | When |
|---------|------|------|
| Development | FREE | Always |
| Web Hosting (Vercel) | FREE | Always |
| EAS Build (30/month) | FREE | While testing |
| Apple Developer | $99 | Annual |
| Google Play | $25 | One-time |
| EAS Production | $29 | Monthly (optional) |

## First-Time Setup

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Run setup script
./setup-eas.sh

# 3. Create first build
npm run build:preview

# 4. Test on device
# iOS: Download from EAS build link
# Android: Install APK from EAS build link
```

## GitHub Secrets Needed

```
Already set:
✅ VERCEL_TOKEN
✅ VERCEL_PROJECT_ID  
✅ VERCEL_ORG_ID

Need to add:
⬜ EXPO_TOKEN (get from: https://expo.dev/settings/access-tokens)
```

## Store Submission Checklist

### Before Submitting
- [ ] Test on real devices
- [ ] App icon ready (1024×1024)
- [ ] Screenshots prepared (all required sizes)
- [ ] Privacy policy written and hosted
- [ ] App description written
- [ ] Keywords researched

### iOS
- [ ] Apple Developer account ($99)
- [ ] App Store Connect app created
- [ ] Bundle ID: app.rork.save-it
- [ ] TestFlight testing completed

### Android
- [ ] Google Play Console account ($25)
- [ ] Package name: app.rork.save-it
- [ ] Internal testing completed
- [ ] Content rating completed

## Common Issues

### "EXPO_TOKEN not found"
```bash
eas login
# Then go to: https://expo.dev/settings/access-tokens
# Create token and add to GitHub Secrets
```

### "Bundle identifier already in use"
Change in `app.json`:
```json
"ios": {
  "bundleIdentifier": "your.unique.id"
}
```

### "Build failed"
```bash
# View logs
eas build:list
eas build:view [build-id]
```

### Preview not working on iOS
This is a browser limitation. Use the Vercel proxy solution in DEPLOYMENT.md

## Support & Resources

- 📚 Full Docs: `./DEPLOYMENT.md`
- ✅ Checklist: `./PRODUCTION_CHECKLIST.md`
- 🐛 Issues: https://github.com/BotleApps/save-it/issues
- 💬 Expo Forums: https://forums.expo.dev
- 📖 EAS Docs: https://docs.expo.dev/eas
