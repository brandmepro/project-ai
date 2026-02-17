import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.businesspro.app',
  appName: 'BusinessPro',
  webDir: 'out',
  
  // Custom paths for mobile builds
  android: {
    path: 'mobile-builds/android',
    // Configure Android build to use compatible Java version
    buildOptions: {}
  },
  
  ios: {
    path: 'mobile-builds/ios',
  },
  
  server: {
    // Use localhost for secure context APIs
    hostname: 'localhost',
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  
  plugins: {
    // Enable CapacitorHttp for better API handling
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
