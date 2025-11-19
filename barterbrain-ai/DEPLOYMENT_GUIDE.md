# Firebase Deployment Guide - BarterBrain Cloud Functions

## ✅ What's Merged
The final `functions/index.js` now contains ALL features:
1. **AI Valuation** (`/ai/metadataValuation`) - Your original feature
2. **Chat Negotiation Coach** (`/ai/negotiationCoach`) - Your friend's feature
3. **Sustainability Impact** (`/swaps/confirm`) - Your new feature

**Supporting file:**
- `functions/sustainability.js` - Separate module for sustainability calculations

---

## 🚀 Deployment Steps

### Step 1: Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
Follow the browser prompt to authenticate.

### Step 3: Set Environment Variables
```bash
cd /Users/anaswara/Documents/BarterBrAIn/BarterBr-AI-n

# Set your Gemini API key
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"

# Optional: Set the model
firebase functions:config:set gemini.model="gemini-2.5-flash"

# Verify settings
firebase functions:config:get
```

**Update code to use Firebase config:**
In both `functions/index.js` and `functions/sustainability.js`, update the `getEnv` lines:

```javascript
const GEMINI_API_KEY = getEnv('GEMINI_API_KEY') || functions.config().gemini?.api_key;
const GEMINI_MODEL = getEnv('GEMINI_MODEL', 'gemini-2.5-flash') || functions.config().gemini?.model;
```

### Step 4: Initialize Firebase (if not already done)
```bash
firebase init functions
```
- Choose: Use existing project
- Select your project from the list
- Language: JavaScript
- ESLint: Your choice
- Install dependencies: Yes

### Step 5: Deploy Functions
```bash
cd /Users/anaswara/Documents/BarterBrAIn/BarterBr-AI-n

# Deploy all functions
firebase deploy --only functions

# Output will show your function URL, like:
# Function URL (BarterBrainAPI): https://us-central1-YOUR-PROJECT.cloudfunctions.net/BarterBrainAPI
```

### Step 6: Note the Function URL
After deployment, Firebase will show:
```
✔  functions[us-central1-BarterBrainAPI]: Successful create operation.
Function URL (BarterBrainAPI): https://us-central1-YOUR-PROJECT.cloudfunctions.net/BarterBrainAPI
```

**Copy this URL** — you'll share it with the Flutter dev.

---

## 📱 API Endpoints for Flutter Integration

Share these with your Flutter/mobile developer:

### Base URL
```
https://us-central1-YOUR-PROJECT.cloudfunctions.net/BarterBrainAPI
```

### 1. AI Valuation
**Endpoint:** `POST /ai/metadataValuation`

**Request:**
```json
{
  "title": "Used Laptop",
  "description": "MacBook Pro 2019",
  "brand": "Apple",
  "year": 2019,
  "condition": "good",
  "accessories": ["charger", "case"],
  "images": ["https://example.com/image1.jpg"],
  "productLink": "https://example.com/product"
}
```

**Response:**
```json
{
  "value": 850.5,
  "confidence": 0.85,
  "breakdown": {
    "basePrice": 700,
    "ageFactor": 0.85,
    "conditionFactor": 0.85,
    "brandFactor": 1.1,
    "accessoryValue": 22
  },
  "explanation": "MacBook Pro estimated at $850.50..."
}
```

### 2. Chat Negotiation Coach
**Endpoint:** `POST /ai/negotiationCoach`

**Request:**
```json
{
  "chatTranscript": [
    {
      "message": "Hi, interested in your laptop",
      "isCurrentUser": false
    },
    {
      "message": "Sure! It's in great condition",
      "isCurrentUser": true
    }
  ],
  "userItem": {
    "title": "Desk Lamp",
    "estimatedValue": 30,
    "condition": "good"
  },
  "otherUserItem": {
    "title": "Office Chair",
    "estimatedValue": 80,
    "condition": "excellent"
  },
  "currentOffer": {
    "cashAdjustment": 50,
    "status": "pending"
  }
}
```

**Response:**
```json
{
  "suggestionPhrase": "That sounds fair! Would you consider $45 to balance the values?",
  "suggestedCashAdjustment": 45,
  "explanation": "The chair is valued higher, so a small cash adjustment helps balance the trade.",
  "negotiationTips": [
    "Emphasize the excellent condition of your lamp",
    "Be friendly and flexible",
    "Consider meeting in person to finalize"
  ]
}
```

### 3. Sustainability Impact (NEW!)
**Endpoint:** `POST /swaps/confirm`

**Request:**
```json
{
  "swapId": "firestore-swap-doc-id",
  "swap": {
    "estimatedNewCost": 120,
    "proposerItemValue": 40,
    "proposerCash": 20,
    "itemName": "laptop"
  }
}
```

**Response:**
```json
{
  "success": true,
  "swapId": "firestore-swap-doc-id",
  "sustainabilityImpact": "You saved about 85 kg CO₂ and $60 by swapping instead of buying new."
}
```

Or if data is missing:
```json
{
  "success": true,
  "swapId": null,
  "sustainabilityImpact": null
}
```

---

## 🧪 Testing Before Flutter Integration

### Test Locally (Optional)
```bash
cd /Users/anaswara/Documents/BarterBrAIn/BarterBr-AI-n

# Start Firebase emulator
firebase emulators:start --only functions

# In another terminal, test:
curl -X POST http://localhost:5001/YOUR-PROJECT/us-central1/BarterBrainAPI/swaps/confirm \
  -H "Content-Type: application/json" \
  -d '{"swap":{"estimatedNewCost":120,"proposerItemValue":40,"proposerCash":20,"itemName":"laptop"}}'
```

### Test Deployed Function
```bash
# Replace YOUR_FUNCTION_URL with your actual URL
curl -X POST https://us-central1-YOUR-PROJECT.cloudfunctions.net/BarterBrainAPI/swaps/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "swap": {
      "estimatedNewCost": 120,
      "proposerItemValue": 40,
      "proposerCash": 20,
      "itemName": "laptop"
    }
  }'
```

---

## 📋 Checklist for Mobile Developer

Share this with your Flutter developer:

- [ ] Base URL: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/BarterBrainAPI`
- [ ] Three endpoints available:
  - `POST /ai/metadataValuation`
  - `POST /ai/negotiationCoach`
  - `POST /swaps/confirm`
- [ ] All endpoints accept JSON, return JSON
- [ ] Add proper error handling for network failures
- [ ] Store `sustainabilityImpact` string in Firestore swap documents
- [ ] Display sustainability message to users after swap confirmation

### Flutter Integration Example (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<String?> confirmSwapAndGetSustainability(String swapId) async {
  final url = 'https://us-central1-YOUR-PROJECT.cloudfunctions.net/BarterBrainAPI/swaps/confirm';
  
  final response = await http.post(
    Uri.parse(url),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'swapId': swapId}),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['sustainabilityImpact']; // String or null
  }
  return null;
}
```

---

## 🔧 Troubleshooting

### Function deployment fails
```bash
# Check Firebase project
firebase projects:list

# Use correct project
firebase use YOUR-PROJECT-ID

# Redeploy
firebase deploy --only functions
```

### Environment variables not working
```bash
# List current config
firebase functions:config:get

# If empty, set again
firebase functions:config:set gemini.api_key="YOUR_KEY"

# Must redeploy after config changes
firebase deploy --only functions
```

### CORS errors from mobile app
The function already has CORS enabled:
```javascript
app.use(cors());
```
If issues persist, specify origins:
```javascript
app.use(cors({ origin: '*' })); // Allow all
```

---

## 📊 Monitoring

View logs:
```bash
firebase functions:log
```

View in Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Functions" in left sidebar
4. View logs, metrics, and usage

---

## 🎉 Success Checklist

- ✅ `index.js` merged with all features
- ✅ `sustainability.js` present
- ✅ No syntax errors (`node -c index.js`)
- ✅ Gemini API key set in Firebase config
- ✅ Functions deployed successfully
- ✅ Function URL shared with Flutter dev
- ✅ API endpoints documented
- ✅ Test curls work

**You're ready to go! 🚀**
