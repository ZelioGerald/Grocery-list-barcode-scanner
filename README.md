# SmartCart - Smart Grocery List App

A mobile app for smart grocery list management with barcode scanning, product categorization, pantry stock tracking, and cloud sync.

## Features

- 📱 **Mobile-First Design** - Built with React Native + Expo
- 🔐 **Authentication** - Email/Password login with Firebase Auth
- 🛒 **Grocery Lists** - Create and manage multiple shopping lists
- 📷 **Barcode Scanner** - Scan products to auto-fill details
- 🏠 **Pantry Tracking** - Monitor home stock levels
- 🗂️ **Categories** - Organize items by customizable categories
- ☁️ **Cloud Sync** - Real-time sync with Firebase Firestore
- 📴 **Offline Support** - Works offline with local caching

## Tech Stack

- **Framework:** React Native + Expo (managed workflow)
- **Navigation:** Expo Router (file-based routing)
- **UI Library:** React Native Paper + NativeWind (Tailwind CSS)
- **State Management:** Zustand
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Image Storage:** Supabase Storage
- **Barcode Scanner:** expo-camera
- **Product API:** Open Food Facts

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase project
- Supabase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smartcart
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config

4. **Set up Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Create a storage bucket named `smartcart-product-images`
   - Set bucket to public read, authenticated write
   - Copy your Supabase URL and anon key

5. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase and Supabase credentials:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

6. **Start the development server:**
   ```bash
   npm start
   ```

7. **Run on a device:**
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code from the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## Troubleshooting

### Cannot find module 'babel-preset-expo'
If you encounter this error, make sure all dependencies are installed:
```bash
npm install --legacy-peer-deps
```

### Metro bundler cache issues
If you experience strange errors, try clearing the cache:
```bash
npm start -- --clear
```

### Environment variables not loading
Make sure your `.env` file is in the root directory and properly formatted. Restart the Metro bundler after changing environment variables.

## Development Status

### ✅ Phase 1 - Project Setup & Authentication (COMPLETED)
- ✅ Expo project initialized with blank template
- ✅ All dependencies installed
- ✅ Firebase and Supabase configured
- ✅ Login screen with email/password
- ✅ Register screen with account creation
- ✅ Auth state management with Zustand
- ✅ Default categories seeding
- ✅ Logout functionality
- ✅ Expo Router navigation setup

### 🔄 Phase 2 - Core Grocery List (In Progress)
- Manual item entry
- List management
- Item CRUD operations
- Category filtering

### ⏳ Phase 3 - Barcode Scanner Integration (Pending)
- Camera permissions
- Barcode scanning
- Open Food Facts API integration

### ⏳ Phase 4 - Stock Tracking & Pantry (Pending)
- Pantry management
- Stock status tracking
- List-to-pantry sync

### ⏳ Phase 5 - Image Upload & Item Detail (Pending)
- Supabase image upload
- Item detail screen
- Image compression

### ⏳ Phase 6 - Search, Sorting & Settings (Pending)
- Global search
- Sort options
- User preferences
- Custom categories

### ⏳ Phase 7 - Polish & UX (Pending)
- Empty states
- Loading skeletons
- Haptic feedback
- Offline support
- Onboarding

## Project Structure

```
smartcart/
├── app/
│   ├── (auth)/          # Authentication screens
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── (tabs)/          # Main tab screens
│   │   ├── index.jsx    # Home/Active List
│   │   ├── lists.jsx    # All Lists
│   │   ├── scanner.jsx  # Barcode Scanner
│   │   ├── pantry.jsx   # Pantry Management
│   │   └── settings.jsx # Settings
│   ├── item/            # Item screens
│   ├── list/            # List screens
│   └── _layout.jsx      # Root layout
├── lib/
│   ├── firebase.js      # Firebase config
│   ├── supabase.js      # Supabase config
│   └── constants.js     # App constants
├── store/
│   └── authStore.js     # Auth state management
├── components/          # Reusable components
├── .env                 # Environment variables
└── app.json            # Expo config
```

## Firebase Data Models

### Users Collection
```javascript
users/{userId}
  - uid: string
  - displayName: string
  - email: string
  - photoURL: string | null
  - createdAt: timestamp
  - settings: object
```

### Lists Subcollection
```javascript
users/{userId}/lists/{listId}
  - listId: string
  - name: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - itemCount: number
  - isActive: boolean
```

### Items Subcollection
```javascript
users/{userId}/lists/{listId}/items/{itemId}
  - itemId: string
  - name: string
  - brand: string | null
  - barcode: string | null
  - category: string
  - quantity: number
  - unit: string
  - status: string
  - imageURL: string | null
  - notes: string | null
  - addedAt: timestamp
  - updatedAt: timestamp
```

### Pantry Collection
```javascript
users/{userId}/pantry/{itemId}
  - itemId: string
  - name: string
  - brand: string | null
  - category: string
  - quantity: number
  - unit: string
  - status: string
  - imageURL: string | null
  - lastUpdated: timestamp
```

### Categories Subcollection
```javascript
users/{userId}/categories/{categoryId}
  - categoryId: string
  - name: string
  - icon: string (Ionicon name)
  - color: string (hex)
  - isDefault: boolean
```

## Contributing

This project follows a phased development approach. Each phase must be completed and tested before moving to the next.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
