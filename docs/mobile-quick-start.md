# Mobile Build Quick Start

## 🚀 Single Command Setup

Run these commands from the **project root** directory:

### First Time Setup (Do Once)

```bash
# 1. Install dependencies
bun install

# 2. Initialize Capacitor  
bun run mobile:init

# 3. Add platforms
bun run mobile:add:android
bun run mobile:add:ios
```

## 📱 Daily Development

### Build for Android

```bash
# From root directory
bun run build:android
```

Your Android app will be at:
```
our-app/mobile-builds/android/
```

### Build for iOS

```bash
# From root directory  
bun run build:ios
```

Your iOS app will be at:
```
our-app/mobile-builds/ios/
```

### Open in IDE

```bash
# Android Studio
bun run mobile:open:android

# Xcode (macOS)
bun run mobile:open:ios
```

### Run on Device

```bash
# Android
bun run mobile:run:android

# iOS (macOS)
bun run mobile:run:ios
```

## 🎯 Most Used Commands

```bash
# Build everything
bun run build:mobile

# Just sync (no rebuild)
bun run mobile:sync

# Open Android Studio
bun run mobile:open:android

# Open Xcode
bun run mobile:open:ios
```

## 📍 Where Are My Apps?

All mobile builds are in one place:

```
our-app/
└── mobile-builds/
    ├── android/     ← Open this in Android Studio
    └── ios/         ← Open this in Xcode
```

## ⚡ Pro Tips

1. **Always build from root**: All `bun run build:*` and `mobile:*` commands work from the project root

2. **After code changes**: Run `bun run build:android` or `build:ios` to update the mobile app

3. **No digging required**: Your apps are directly in `our-app/mobile-builds/` - easy to find!

4. **Single platform**: Use `build:android` or `build:ios` instead of `build:mobile` if you only need one platform

## 🔧 Prerequisites

### For Android Development
- Android Studio
- Android SDK (API 21+)
- Java JDK 17+

### For iOS Development (macOS only)
- Xcode 14.1+
- CocoaPods
- macOS 12.0+

## 📚 Full Documentation

See `docs/capacitor-integration-guide.md` for complete details.
