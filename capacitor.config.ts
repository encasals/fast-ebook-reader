import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fastebookreader.app',
  appName: 'Fast Ebook Reader',
  webDir: 'dist',
  android: {
    backgroundColor: '#1a1a2e',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
