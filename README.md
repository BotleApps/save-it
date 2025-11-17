# Save It 📌

A modern, cross-platform application to save and organize your links, articles, and resources. Built with Expo and React Native.

[![Deploy Web](https://github.com/BotleApps/save-it/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/BotleApps/save-it/actions/workflows/deploy-web.yml)
[![Build Mobile](https://github.com/BotleApps/save-it/actions/workflows/build-mobile.yml/badge.svg)](https://github.com/BotleApps/save-it/actions/workflows/build-mobile.yml)

## ✨ Features

- 🔖 **Save Links**: Quickly save URLs with automatic preview fetching
- 🏷️ **Tag System**: Organize links with custom tags
- 📁 **Categories**: Filter and categorize your saved content
- 🔍 **Search**: Fast search across all your saved links
- 🌓 **Dark Mode**: Automatic theme switching
- 📱 **Cross-Platform**: Works on Web, iOS, and Android
- 💾 **Offline First**: All data stored locally with AsyncStorage
- 🔄 **PWA Support**: Install as a web app with offline capabilities
- 🎯 **Share Target**: Receive shares from other apps (Android/Web)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI (for mobile development)

### Installation

```bash
# Clone the repository
git clone https://github.com/BotleApps/save-it.git
cd save-it

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

### Run on Different Platforms

#### Web
```bash
npm run start-web
# or for local testing
./run-local.sh
```
Visit: http://localhost:3005

#### iOS (Mac required)
```bash
# Press 'i' in the terminal
# or
npm run ios
```

#### Android
```bash
# Press 'a' in the terminal
# or
npm run android
```

## 📱 Production Builds

### Web (Already Deployed)
- Production: https://save-it-chi.vercel.app
- Auto-deploys on push to `main`

### Mobile Apps

First-time setup:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project
eas init
```

Build commands:
```bash
# Preview builds (for testing)
npm run build:preview

# Production builds
npm run build:ios      # iOS only
npm run build:android  # Android only
npm run build:all      # Both platforms
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🏗️ Project Structure

```
save-it/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── link/              # Link detail pages
│   ├── index.tsx          # Home screen
│   ├── new-link.tsx       # Add link screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable React components
├── stores/               # Zustand state management
├── hooks/                # Custom React hooks
├── constants/            # App constants and theme
├── assets/               # Images and static files
├── public/               # PWA assets (manifest, icons, service worker)
└── .github/workflows/    # CI/CD pipelines
```

## 🛠️ Tech Stack

- **Framework**: Expo SDK 53 + React Native 0.79
- **Navigation**: Expo Router 5
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Build**: EAS Build
- **Deployment**: 
  - Web: Vercel
  - Mobile: Apple App Store + Google Play Store

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run start-web` | Start web development server |
| `npm run build` | Build web for production |
| `npm run build:ios` | Build iOS production app |
| `npm run build:android` | Build Android production app |
| `npm run build:preview` | Build preview version (both platforms) |
| `npm test` | Run Jest tests |

### Environment Variables

Create `.env` file for local development:
```env
EXPO_PUBLIC_API_URL=https://save-it-chi.vercel.app
APP_ENV=development
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 📦 Building for Production

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for a complete guide to preparing your app for production.

### Key Requirements:
- Apple Developer Account ($99/year)
- Google Play Console ($25 one-time)
- Expo account (free)
- App Store assets (screenshots, descriptions, etc.)

## 🔄 CI/CD

The project includes GitHub Actions workflows:

- **deploy-web.yml**: Auto-deploys web app to Vercel on push to `main`
- **build-mobile.yml**: Builds mobile apps via EAS (manual trigger or on release)

### Required Secrets:
- `EXPO_TOKEN`: From Expo dashboard
- `VERCEL_TOKEN`: From Vercel settings
- `VERCEL_PROJECT_ID`: From Vercel project
- `VERCEL_ORG_ID`: From Vercel organization

## 🌐 PWA Features

The web version is a full Progressive Web App:
- ✅ Installable on desktop and mobile
- ✅ Offline support with service worker
- ✅ App-like experience
- ✅ Fast loading with caching
- ⚠️ Share Target API (Android/Desktop only, not iOS)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/BotleApps/save-it/issues)
- **Discussions**: [GitHub Discussions](https://github.com/BotleApps/save-it/discussions)
- **Email**: support@rork.app

## 🗺️ Roadmap

- [ ] Backend sync service
- [ ] Browser extension
- [ ] AI-powered summaries
- [ ] Collections/folders
- [ ] Sharing and collaboration
- [ ] Import/export functionality
- [ ] Reading mode
- [ ] Full-text search
- [ ] Archive.org integration

## 📸 Screenshots

### Web/PWA
![Web Screenshot](./docs/screenshots/web.png)

### iOS
![iOS Screenshot](./docs/screenshots/ios.png)

### Android
![Android Screenshot](./docs/screenshots/android.png)

---

Made with ❤️ by [BotleApps](https://github.com/BotleApps)
