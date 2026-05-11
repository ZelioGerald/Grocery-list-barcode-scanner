markdown
# Smart Grocery List with Barcode Scanner — Claude Code Build Prompt

## ROLE
You are an expert React Native / Expo developer with deep knowledge of Firebase,
Supabase, REST APIs, and mobile UX design. You will act as the lead developer
building a production-ready mobile application from scratch, step by step,
explaining every decision clearly.

## TASK
Build a mobile app called **"SmartCart"** — a smart grocery list manager with
barcode scanning, product categorization, pantry stock tracking, and cloud sync.
The app must be built with React Native + Expo (managed workflow), Firebase as
the primary database and auth backend, and Supabase Storage for any media/image
uploads. Development must follow the phased plan below strictly, completing and
testing each phase before moving to the next.

## CONTENT

---

### PROJECT OVERVIEW
- **App Name:** SmartCart
- **Platform:** iOS & Android (via Expo managed workflow)
- **Language:** JavaScript (or TypeScript if preferred)
- **Navigation:** Expo Router (file-based routing)
- **UI Library:** React Native Paper + NativeWind (Tailwind CSS for RN)
- **State Management:** Zustand
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Email/Password + Google Sign-In)
- **Media/Image Storage:** Supabase Storage Bucket
- **Product Lookup API:** Open Food Facts (https://world.openfoodfacts.org/api/v0/product/{barcode}.json)
- **Barcode Scanner:** expo-camera (with barcode scanning enabled)
- **Local Offline Storage:** AsyncStorage (for offline-first caching)
- **Icons:** @expo/vector-icons (Ionicons)

---

### FIREBASE DATA MODELS

#### Collection: `users/{userId}`
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "photoURL": "string | null",
  "createdAt": "timestamp",
  "settings": {
    "theme": "light | dark",
    "defaultUnit": "pcs | kg | g | liters | ml",
    "sortByCategory": true
  }
}
```

#### Collection: `users/{userId}/lists/{listId}`
```json
{
  "listId": "string",
  "name": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "itemCount": "number",
  "isActive": "boolean"
}
```

#### Collection: `users/{userId}/lists/{listId}/items/{itemId}`
```json
{
  "itemId": "string",
  "name": "string",
  "brand": "string | null",
  "barcode": "string | null",
  "category": "string",
  "quantity": "number",
  "unit": "pcs | kg | g | liters | ml",
  "status": "out-of-stock | in-stock | in-cart",
  "imageURL": "string | null",
  "notes": "string | null",
  "addedAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Collection: `users/{userId}/pantry/{itemId}`
```json
{
  "itemId": "string",
  "name": "string",
  "brand": "string | null",
  "barcode": "string | null",
  "category": "string",
  "quantity": "number",
  "unit": "pcs | kg | g | liters | ml",
  "status": "in-stock | low-stock | out-of-stock",
  "imageURL": "string | null",
  "notes": "string | null",
  "lastUpdated": "timestamp"
}
```

#### Collection: `users/{userId}/categories`
```json
{
  "categoryId": "string",
  "name": "string",
  "icon": "string (Ionicon name)",
  "color": "string (hex)",
  "isDefault": "boolean"
}
```

---

### DEFAULT CATEGORIES (seed on first login)
| Name | Icon (Ionicons) | Color |
|---|---|---|
| Produce | leaf-outline | #4CAF50 |
| Dairy | water-outline | #2196F3 |
| Meat & Seafood | fish-outline | #F44336 |
| Bakery | pizza-outline | #FF9800 |
| Frozen | snow-outline | #00BCD4 |
| Beverages | cafe-outline | #795548 |
| Snacks | fast-food-outline | #FF5722 |
| Household | home-outline | #9E9E9E |
| Personal Care | heart-outline | #E91E63 |
| Other | grid-outline | #607D8B |

---

### SUPABASE STORAGE
- **Bucket name:** `smartcart-product-images`
- **Access:** Public read, authenticated write
- **Upload path:** `{userId}/products/{itemId}.jpg`
- Used when: user manually captures or uploads a photo of a product
- After upload, store the public URL in Firestore under `imageURL` field

---

### SCREENS & NAVIGATION STRUCTURE
app/
├── (auth)/
│   ├── login.jsx
│   └── register.jsx
├── (tabs)/
│   ├── index.jsx          → Home / Active List
│   ├── pantry.jsx         → Pantry / Stock Manager
│   ├── scanner.jsx        → Barcode Scanner
│   ├── lists.jsx          → All Lists
│   └── settings.jsx       → Settings
├── item/
│   ├── [id].jsx           → Item Detail / Edit
│   └── new.jsx            → Manual Item Entry
├── list/
│   └── [id].jsx           → Individual List View
└── _layout.jsx

---

### PHASE 1 — Project Setup & Authentication
**Goal:** Working app shell with login, registration, and Firebase connected.

**Steps:**
1. Initialize Expo project: `npx create-expo-app smartcart --template blank`
2. Install all dependencies:
   - `firebase`
   - `@react-native-async-storage/async-storage`
   - `expo-router`
   - `react-native-paper`
   - `nativewind` + `tailwindcss`
   - `zustand`
   - `@expo/vector-icons`
   - `expo-camera`
   - `expo-image-picker`
   - `@supabase/supabase-js`
3. Set up Firebase project (Firestore + Auth) and paste config in `lib/firebase.js`
4. Set up Supabase project and paste config in `lib/supabase.js`
5. Build Login screen (email/password + Google Sign-In button)
6. Build Register screen (name, email, password)
7. Create Zustand `authStore` to hold user session globally
8. Add auth state listener — redirect to tabs if logged in, auth screens if not
9. On first login: seed default categories into Firestore for the user
10. Add logout button placeholder in settings tab

**Deliverable:** User can register, log in, log out. Firebase Auth working.

---

### PHASE 2 — Core Grocery List (Manual Entry)
**Goal:** Users can create lists, add items manually, and manage them.

**Steps:**
1. Build `(tabs)/lists.jsx` — shows all user lists from Firestore with create button
2. Build `list/[id].jsx` — individual list view, items grouped by category
3. Build `item/new.jsx` — manual entry form:
   - Fields: name (required), brand, category (dropdown), quantity, unit, notes
   - On submit: write to Firestore `items` subcollection
4. Build item card component:
   - Shows: name, brand, category badge, quantity + unit
   - Shows status badge: Out of Stock (red) / In Stock (green) / In Cart (blue)
   - Checkbox to toggle "In Cart" while shopping
5. Add swipe-to-delete on item cards (react-native-gesture-handler)
6. Add category filter bar at top of list view (horizontal scroll)
7. Set `(tabs)/index.jsx` (Home) to show the most recently active list
8. Persist active list ID in AsyncStorage for offline-first access
9. Create Zustand `listStore` for list and item state

**Deliverable:** Full manual grocery list — create, read, update, delete items.

---

### PHASE 3 — Barcode Scanner Integration
**Goal:** Scanning a barcode auto-fills an item using Open Food Facts API.

**Steps:**
1. Build `(tabs)/scanner.jsx`:
   - Request camera permission using `expo-camera`
   - Show camera viewfinder with a scanning frame overlay (custom UI)
   - Listen for barcode scan events using `onBarcodeScanned`
   - Add a torch/flashlight toggle button
   - Add a "Type manually instead" fallback link
2. On barcode detected:
   - Call `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
   - Extract: `product_name`, `brands`, `categories_tags`, `image_url`
   - Map `categories_tags` to the app's default category list
   - Show a bottom sheet preview card with auto-filled data
3. User confirms → navigated to `item/new.jsx` pre-filled with product data
4. If product not found in API → navigate to `item/new.jsx` with only barcode pre-filled
5. Add "Recently Scanned" section on the scanner screen (last 5 scans from AsyncStorage)
6. Handle camera permission denied state gracefully with a settings redirect prompt

**Deliverable:** Scan a barcode → product data auto-fills → user confirms → item added to list.

---

### PHASE 4 — In-Stock / Out-of-Stock & Pantry
**Goal:** Full stock tracking system linking shopping list to home pantry.

**Steps:**
1. Build `(tabs)/pantry.jsx`:
   - Fetch all items from `users/{userId}/pantry` Firestore collection
   - Group by category, same layout as list view
   - Status badges: In Stock (green), Low Stock (yellow), Out of Stock (red)
2. Add "Move to Pantry" button on each shopping list item (marks as In Stock)
   - This writes the item to the `pantry` collection in Firestore
   - Updates status to `in-stock`
3. Add "Add to Shopping List" button on pantry items with `out-of-stock` or `low-stock` status
   - Copies item to the active grocery list
4. Add stock status toggle directly on pantry item cards (In Stock → Low Stock → Out of Stock)
5. Add pantry item count badge on the Pantry tab icon
6. Add a "Low Stock" filter view on pantry screen showing only items needing restock
7. Summary card at top of pantry screen:
   - Total items | In Stock count | Low Stock count | Out of Stock count

**Deliverable:** Full pantry management with two-way sync between list and pantry.

---

### PHASE 5 — Image Upload (Supabase) & Item Detail
**Goal:** Users can attach photos to items; full item detail/edit screen.

**Steps:**
1. Build `item/[id].jsx` — full detail screen:
   - Display all item fields in editable mode
   - Show product image (from API URL or Supabase upload)
   - Editable: name, brand, category, quantity, unit, notes, status
   - "Save Changes" button → updates Firestore document
2. Add image section to item detail:
   - If `imageURL` exists: display it with an "Change Photo" option
   - If no image: show "Add Photo" placeholder
3. On "Add/Change Photo":
   - Show action sheet: "Take Photo" or "Choose from Library"
   - Use `expo-image-picker` to get image
   - Compress image to max 800px width before upload
   - Upload to Supabase bucket at path `{userId}/products/{itemId}.jpg`
   - Get public URL → save to Firestore `imageURL` field
4. Show upload progress indicator during Supabase upload
5. Handle upload errors with retry option

**Deliverable:** Items can have photos; full edit screen with Supabase image upload working.

---

### PHASE 6 — Search, Sorting & Settings
**Goal:** Search across lists/pantry; user preferences; custom categories.

**Steps:**
1. Add global search bar on Home screen:
   - Searches item names and brands across the active list
   - Shows results grouped by category
2. Add sort options on list screen:
   - Sort by category (default) | Sort by date added | Sort by name (A–Z)
3. Build `(tabs)/settings.jsx`:
   - Display Name edit
   - Profile photo upload (to Supabase)
   - Default unit preference
   - Theme toggle (Light / Dark)
   - Custom category manager: create, rename, delete categories
   - "Clear all data" option (with confirmation dialog)
   - App version display
   - Logout button
4. Apply theme globally using React Native Paper's `PaperProvider` with dynamic theme
5. Persist theme preference in Firestore `settings` field and AsyncStorage

**Deliverable:** Full settings, search, sort, custom categories, and theme support.

---

### PHASE 7 — Polish, UX & Offline Support
**Goal:** Production-ready feel with animations, empty states, and offline resilience.

**Steps:**
1. Add empty state illustrations for:
   - Empty grocery list ("Your list is empty — scan or add an item")
   - Empty pantry ("Nothing tracked yet — move items here from your list")
   - No search results
2. Add loading skeletons on all list screens (instead of spinners)
3. Add haptic feedback on:
   - Barcode scan success (`expo-haptics`)
   - Item checked off list
   - Delete confirmation
4. Enable Firestore offline persistence:
   - `enableIndexedDbPersistence(db)` for web or `initializeFirestore` with cache settings
   - Items readable/writable offline; sync when back online
5. Add pull-to-refresh on all list and pantry screens
6. Add an onboarding screen (3 slides) shown only on first launch:
   - Slide 1: "Scan to add instantly"
   - Slide 2: "Organize by category"
   - Slide 3: "Track your pantry stock"
7. Add a floating "Shopping Mode" button on list screen:
   - Hides all "In Cart" items to declutter view while actively shopping
8. Final QA: test all flows on both iOS simulator and Android emulator

**Deliverable:** Polished, production-ready app ready for Expo Go testing and store submission prep.

---

### ENVIRONMENT VARIABLES (`.env`)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

---

## CONSTRAINTS
- Build **one phase at a time**. Do not proceed to the next phase until the current
  phase is complete and tested.
- Every new screen must handle **loading**, **error**, and **empty** states.
- All Firestore reads must have **offline caching** enabled from Phase 1.
- Never hardcode credentials — always use `.env` variables via `EXPO_PUBLIC_` prefix.
- All API calls (Open Food Facts, Supabase) must be wrapped in try/catch with
  user-facing error messages.
- Barcode scanner must **always** have a manual entry fallback.
- Images must be **compressed before upload** to Supabase (max 800px, quality 0.7).
- The app must be fully usable **without an internet connection** for list reading
  and editing (offline-first).
- Follow **React Native best practices**: FlatList for all lists, avoid ScrollView
  for long dynamic content, memoize components where appropriate.
- At the end of each phase, provide a **summary of what was built** and a
  **checklist** of things to verify before proceeding.