# Capacitor Mobile Integration Guide

## Overview

BusinessPro has been integrated with Capacitor to enable easy iOS and Android app builds from a single Next.js codebase. All mobile builds are organized in a custom location for easy access.

## Directory Structure

```
our-app/
├── mobile-builds/          # Custom location for all mobile builds
│   ├── android/           # Android project files
│   └── ios/               # iOS project files
├── out/                   # Next.js static export (used by Capacitor)
├── capacitor.config.ts    # Capacitor configuration
└── package.json
```

## Initial Setup

### 1. Install Dependencies

From the **root directory**:

```bash
bun install
```

This will install all Capacitor dependencies including:
- `@capacitor/core` - Core runtime
- `@capacitor/cli` - Command line tools
- `@capacitor/android` - Android platform
- `@capacitor/ios` - iOS platform

### 2. Initialize Capacitor (First Time Only)

From the **root directory**:

```bash
bun run mobile:init
```

This initializes Capacitor with the configuration in `our-app/capacitor.config.ts`.

### 3. Add Platforms (First Time Only)

From the **root directory**:

```bash
# Add Android platform
bun run mobile:add:android

# Add iOS platform  
bun run mobile:add:ios

# Or add both
bun run mobile:add:android && bun run mobile:add:ios
```

This creates the native projects in `our-app/mobile-builds/android` and `our-app/mobile-builds/ios`.

## Building Your App

### Quick Build Commands (From Root)

These commands can be run from the **project root** directory:

```bash
# Build web + sync to both platforms
bun run build:mobile

# Build web + sync to Android only
bun run build:android

# Build web + sync to iOS only
bun run build:ios
```

### What Happens During Build

1. **Next.js Build**: Creates a static export in `our-app/out/`
2. **Capacitor Sync**: Copies the web build to native projects
3. **Native Dependencies**: Installs any new native plugins
4. **Asset Copy**: Updates all web assets in the mobile apps

## Opening Native IDEs

### Android Studio

From the **root directory**:

```bash
bun run mobile:open:android
```

Your Android project will be located at:
```
our-app/mobile-builds/android/
```

### Xcode (macOS only)

From the **root directory**:

```bash
bun run mobile:open:ios
```

Your iOS project will be located at:
```
our-app/mobile-builds/ios/
```

## Running on Devices/Emulators

### Android

```bash
# Run on connected device or emulator
bun run mobile:run:android
```

### iOS (macOS only)

```bash
# Run on connected device or simulator
bun run mobile:run:ios
```

## Development Workflow

### Standard Development Flow

1. **Develop in Browser**
   ```bash
   bun run dev:web
   ```
   
2. **Make Changes** - Edit your Next.js code as normal

3. **Build & Sync** - When ready to test on mobile:
   ```bash
   bun run build:mobile
   ```

4. **Open & Run** - Launch the native IDE:
   ```bash
   # For Android
   bun run mobile:open:android
   
   # For iOS
   bun run mobile:open:ios
   ```

### Live Reload (Advanced)

For live reload during mobile development, you can configure the `server.url` in `capacitor.config.ts` to point to your local dev server:

```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true
}
```

Then rebuild with `bun run mobile:sync`.

**Remember to remove this before production builds!**

## Available Commands Reference

### Root Level Commands

All these work from the **project root** directory:

| Command | Description |
|---------|-------------|
| `bun run build:mobile` | Build web + sync to all platforms |
| `bun run build:android` | Build web + sync to Android |
| `bun run build:ios` | Build web + sync to iOS |
| `bun run mobile:init` | Initialize Capacitor |
| `bun run mobile:add:android` | Add Android platform |
| `bun run mobile:add:ios` | Add iOS platform |
| `bun run mobile:sync` | Sync to all platforms |
| `bun run mobile:sync:android` | Sync to Android only |
| `bun run mobile:sync:ios` | Sync to iOS only |
| `bun run mobile:open:android` | Open Android Studio |
| `bun run mobile:open:ios` | Open Xcode |
| `bun run mobile:run:android` | Run on Android device |
| `bun run mobile:run:ios` | Run on iOS device |

### Our-App Level Commands

From within the `our-app` directory:

| Command | Description |
|---------|-------------|
| `bun run build:mobile` | Build + sync to all platforms |
| `bun run cap:sync` | Sync to all platforms |
| `bun run cap:sync:android` | Sync to Android |
| `bun run cap:sync:ios` | Sync to iOS |
| `bun run cap:open:android` | Open Android Studio |
| `bun run cap:open:ios` | Open Xcode |

## Configuration

### App Identity

Edit `our-app/capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.businesspro.app',        // Change to your bundle ID
  appName: 'BusinessPro',              // Change to your app name
  webDir: 'out',
  // ...
};
```

### Native Configuration

- **Android**: Edit `our-app/mobile-builds/android/app/build.gradle`
- **iOS**: Open Xcode and edit project settings

## Custom Output Location Benefits

✅ **Easy Navigation**: All mobile builds in one place: `our-app/mobile-builds/`

✅ **Clean Structure**: Separates mobile builds from web source code

✅ **Single Command**: Build from root with `bun run build:android` or `build:ios`

✅ **No Deep Nesting**: Direct access without digging through default folders

## Troubleshooting

### Build Fails

1. Ensure Next.js build completes successfully:
   ```bash
   cd our-app && bun run build
   ```

2. Check that `out` directory exists with `index.html`

3. Try syncing again:
   ```bash
   bun run mobile:sync
   ```

### Android Studio Can't Find Project

Make sure you're opening the correct directory:
```
our-app/mobile-builds/android
```

### iOS Build Issues (Mac only)

1. Ensure Xcode is installed
2. Install CocoaPods: `sudo gem install cocoapods`
3. Try running: `cd our-app/mobile-builds/ios/App && pod install`

### Changes Not Showing

Always run sync after web changes:
```bash
bun run mobile:sync
```

## Next Steps

- Add native plugins from [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- Configure app icons and splash screens
- Set up code signing for iOS
- Configure release builds for Google Play / App Store

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Android Developer Guide](https://developer.android.com)
- [iOS Developer Guide](https://developer.apple.com)
