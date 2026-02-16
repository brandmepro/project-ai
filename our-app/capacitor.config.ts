import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.businesspro.app',
  appName: 'BusinessPro',
  webDir: 'out',
  
  // Custom paths for mobile builds
  android: {
    path: 'mobile-builds/android',
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
