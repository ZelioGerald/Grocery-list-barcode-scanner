# SmartCart Setup Guide

This guide will help you set up SmartCart from scratch.

## Prerequisites

Before you begin, make sure you have:
- ✅ Node.js (v14 or higher) installed
- ✅ npm or yarn package manager
- ✅ A code editor (VS Code recommended)
- ✅ Expo Go app on your mobile device (for testing)

## Step 1: Install Dependencies

From the project root, run:

```bash
npm install --legacy-peer-deps
```

**Note:** We use `--legacy-peer-deps` because some dependencies have peer dependency conflicts that don't affect functionality.

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it "SmartCart" (or any name you prefer)
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Enable Firestore Database

1. In your Firebase project, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Start in **Test mode** (we'll secure it later)
4. Choose a location closest to your users
5. Click **"Enable"**

### Enable Authentication

1. Go to **Build → Authentication**
2. Click **"Get started"**
3. Click on **"Email/Password"** provider
4. Toggle **"Enable"**
5. Click **"Save"**

### Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click the **Web** icon (`</>`)
4. Register your app with nickname "SmartCart Web"
5. Copy the `firebaseConfig` object

## Step 3: Create Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"New project"**
3. Name it "smartcart"
4. Create a strong database password (save it somewhere safe)
5. Choose a region close to your users
6. Click **"Create new project"** (this takes ~2 minutes)

### Create Storage Bucket

1. In your Supabase project, go to **Storage**
2. Click **"New bucket"**
3. Name it: `smartcart-product-images`
4. Make it **Public**
5. Click **"Create bucket"**

### Get Supabase Config

1. Go to **Project Settings** (gear icon)
2. Go to **API** section
3. Copy:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 4: Configure Environment Variables

1. In the project root, you'll find a `.env.example` file
2. Create a new file called `.env` (without the .example)
3. Copy this template and fill in your values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example with real (dummy) values:**
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=smartcart-abc123.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=smartcart-abc123
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=smartcart-abc123.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Start the Development Server

```bash
npm start
```

You should see:
```
Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## Step 6: Test on Your Device

### Android
1. Install **Expo Go** from Google Play Store
2. Open Expo Go app
3. Tap **"Scan QR Code"**
4. Scan the QR code from your terminal

### iOS
1. Install **Expo Go** from App Store
2. Open the Camera app
3. Point it at the QR code from your terminal
4. Tap the notification to open in Expo Go

## Step 7: Test the App

### Test Registration
1. On the login screen, tap **"Sign Up"**
2. Fill in:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** test123456
   - **Confirm Password:** test123456
3. Tap **"Create Account"**
4. You should see a success message and be redirected to the home screen

### Verify in Firebase
1. Go to your Firebase Console
2. Click **Authentication** → **Users**
3. You should see your test user listed
4. Click **Firestore Database**
5. You should see a `users` collection with your user document
6. Expand your user → `categories` subcollection
7. You should see 10 default categories

### Test Logout
1. In the app, tap the **"Settings"** tab
2. Tap **"Logout"**
3. Confirm logout
4. You should be redirected to the login screen

### Test Login
1. Enter your test credentials
2. Tap **"Login"**
3. You should be redirected back to the home screen

## Common Issues

### "Cannot connect to Metro"
- Make sure your phone and computer are on the same WiFi network
- Try restarting the Metro bundler: press `Ctrl+C` then `npm start`

### "Network request failed" when registering
- Check your `.env` file has correct Firebase credentials
- Make sure there are no spaces or quotes around the values
- Restart Metro bundler after changing `.env`

### "Permission denied" errors
- Check Firebase Firestore rules are set to test mode
- Check Firebase Authentication is enabled for Email/Password

### App shows white screen
- Check Metro bundler terminal for errors
- Try clearing cache: `npm start -- --clear`
- Make sure all dependencies installed: `npm install --legacy-peer-deps`

## Next Steps

Once Phase 1 is working:
- ✅ You can register and login
- ✅ You can see the tabs (Home, Lists, Scanner, Pantry, Settings)
- ✅ You can logout
- ✅ Firebase shows your user and categories

You're ready for **Phase 2: Core Grocery List** development!

## Need Help?

If you encounter issues:
1. Check the error message in the Metro bundler terminal
2. Check the browser console (if running on web)
3. Review the troubleshooting section in README.md
4. Check Firebase/Supabase dashboards for configuration issues

## Security Notes

⚠️ **Important for Production:**
- The `.env` file is git-ignored (never commit it)
- Change Firestore rules from test mode to proper security rules
- Use Firebase Security Rules to restrict data access
- Never expose your API keys in public repositories
- Consider using Firebase App Check for additional security

For now (development), test mode is fine for learning and building.
