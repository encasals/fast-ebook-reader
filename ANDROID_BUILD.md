# Building Android APK for Fast Ebook Reader

## 🚀 Easiest Option: PWABuilder (No Android Studio Required!)

Since you don't have Android Studio installed, use PWABuilder's free online service:

### Steps:

1. **Deploy your PWA to Firebase** (or any public URL):
   ```bash
   npm run build
   firebase deploy
   ```

2. **Visit PWABuilder**: https://www.pwabuilder.com/

3. **Enter your deployed URL** (e.g., `https://fast-ebook-reader.web.app`)

4. **Click "Start"** and wait for analysis

5. **Click "Package for stores"** → Select **"Android"**

6. **Download the APK/AAB** package

7. **The download includes**:
   - Signed APK ready for testing
   - AAB (Android App Bundle) for Play Store
   - Signing keys
   - Asset links file for verification

---

## Prerequisites (For Local Build)

1. **Java JDK 17** (required for Android Gradle)
2. **Android Studio** with Android SDK installed
3. **Node.js 18+**

## Quick Build Steps

### Option A: Using Android Studio (Recommended)

1. **Sync the project**:
   ```bash
   npm run android:sync
   ```

2. **Open in Android Studio**:
   ```bash
   npm run android:open
   ```
   Or manually open `android/` folder in Android Studio.

3. **Build in Android Studio**:
   - Click **Build → Generate Signed Bundle / APK**
   - Choose **APK**
   - Create a new keystore or use existing one
   - Choose **release** build variant
   - Wait for build to complete

4. **Find your APK** at:
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release.apk`

### Option B: Command Line Build

1. **Set up Android SDK environment**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

2. **Build debug APK**:
   ```bash
   npm run android:build-debug
   ```

3. **Build release APK** (requires signing):
   ```bash
   npm run android:build
   ```

## Creating a Signing Key for Play Store

```bash
keytool -genkey -v -keystore fast-ebook-reader.keystore \
  -alias fast-ebook-reader \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD
```

Save the keystore file securely - you'll need it for all future updates!

## Configure Signing in Gradle

Edit `android/app/build.gradle` and add before `buildTypes`:

```gradle
signingConfigs {
    release {
        storeFile file('../../fast-ebook-reader.keystore')
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'fast-ebook-reader'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

Then update `buildTypes.release`:
```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

## Play Store Upload Checklist

- [ ] Signed APK or AAB (App Bundle preferred)
- [ ] App icon: 512x512 PNG ✅ (in `public/icons/`)
- [ ] Feature graphic: 1024x500 PNG
- [ ] Phone screenshots: At least 2
- [ ] Tablet screenshots (optional): At least 1
- [ ] Privacy Policy URL
- [ ] Content rating questionnaire completed
- [ ] App description (short and full)
- [ ] App category: Books & Reference

## App Details for Play Store

- **Package Name**: `com.fastebookreader.app`
- **App Name**: Fast Ebook Reader
- **Category**: Books & Reference
- **Short Description**: Speed read ebooks with RSVP technology
- **Full Description**: 
  Fast Ebook Reader is a powerful speed reading app that uses RSVP 
  (Rapid Serial Visual Presentation) technology to help you read 
  ebooks faster. Import EPUB files and read at speeds up to 1000+ WPM!

## Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```
sdk.dir=/path/to/Android/Sdk
```

### Gradle build fails
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Missing dependencies
```bash
npm run android:sync
```
