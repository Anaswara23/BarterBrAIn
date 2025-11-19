# BarterBrAIn - AI-Powered College Barter Marketplace

BarterBrAIn is a platform for students to exchange things they don’t need with things they do. Built with Flutter and Firebase Cloud Functions, it makes campus bartering smarter, fairer, and greener—with AI at its core.

## 🎯 Features

- **AI-Powered Product Valuation:**  
  Instantly estimates the fair market value of any item listed for barter. Users upload photos and details; Gemini’s multimodal AI analyzes both text and images to deliver an accurate price, confidence score, and a detailed breakdown (base price, age, condition, brand, accessories).

- **AI Chat Negotiation Coach:**  
  Provides real-time, AI-powered negotiation advice during swap conversations. As users chat live (via Firebase Cloud Messaging), Gemini analyzes the chat history, item values, and current offers to suggest the next best move. Suggests negotiation phrases, fair cash adjustments, explanations, and practical tips—making negotiation easy and transparent.

- **Sustainability Impact Feature:**  
  After every completed swap, users see the environmental impact of their choice—displayed as a personalized message showing CO₂ saved and money saved. Gemini estimates the carbon footprint of manufacturing a new item and calculates the savings, generating a human-friendly summary.

- **Secure, Campus-Only Community:**  
  .edu email login and OTP verification for safety.

- **Financial Integration:**  
  Capital One Nessie API for seamless payments when item values differ.

- **Apple Glass-Inspired UI:**  
  Modern, liquid glass interface for iOS and Android.

- **Profile & History:**  
  Edit profile, view transaction history, and manage credits.

## 🔑 Key AI Features & Tech Stack

- **AI-Powered Product Valuation:**  
  *Firebase Cloud Functions, Google Gemini 2.5 Flash (multimodal), Node.js*

- **AI Chat Negotiation Coach:**  
  *Firebase Cloud Functions, Firebase Cloud Messaging, Gemini 2.5 Flash, Express.js*

- **Sustainability Impact Feature:**  
  *Firebase Cloud Functions, Gemini 2.5 Flash, Node.js*

## 🚀 Live API

**Endpoint:**
```
POST https://us-central1-barterbrain-1254a.cloudfunctions.net/ProductPricePredictionApi/ai/metadataValuation
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 📱 Mobile Integration

Ready-to-use Flutter integration guide available in [MOBILE_INTEGRATION_GUIDE.md](./MOBILE_INTEGRATION_GUIDE.md).

Includes:
- Complete Flutter service class with models
- UI integration examples
- Field mapping guide
- Testing instructions
- Troubleshooting tips

## 🧪 Testing

Run the test script to verify the API:

```bash
node test_function.js
```

**Test Results:**
- ✅ iPhone 13 Pro: $535.54 (90% confidence)
- ✅ Calculus Textbook: $36 (70% confidence)
- ✅ PS5 Digital: $358.90 (90% confidence)

## 🛠️ Setup

### Prerequisites
- Node.js 22+
- Firebase CLI
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd barter-brain
```

2. Install dependencies:
```bash
npm install
cd functions && npm install
```

3. Set up environment variables:
```bash
# Create functions/.env
echo "GEMINI_API_KEY=your_api_key_here" > functions/.env
echo "GEMINI_MODEL=gemini-2.5-flash" >> functions/.env
```

4. Deploy to Firebase:
```bash
firebase deploy --only functions
```

## 📂 Project Structure

```
.
├── functions/
│   ├── index.js              # Main Cloud Function
│   ├── package.json          # Function dependencies
│   └── .env                  # Environment variables (not in repo)
├── src/
│   ├── gemini_client.js      # Gemini API client
│   ├── valuation_engine.js   # Price calculation logic
│   ├── reference_utils.js    # Reference data utilities
│   └── stub_server.js        # Local dev server
├── API_DOCUMENTATION.md      # Complete API docs
├── MOBILE_INTEGRATION_GUIDE.md # Flutter integration guide
├── test_function.js          # API test script
└── firebase.json             # Firebase configuration
```

## 🔑 Environment Variables

Required in `functions/.env`:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: Model to use (default: `gemini-2.5-flash`)

**⚠️ Never commit `.env` files to the repository!**

## 📊 API Request Example

```json
{
  "title": "iPhone 13 Pro",
  "description": "Gently used, 256GB, minor scratches",
  "category": "Electronics",
  "condition": "good",
  "ageMonths": 24,
  "brand": "Apple",
  "accessories": ["Original Box", "Charger"],
  "images": ["https://example.com/image1.jpg"]
}
```

## 📈 API Response Example

```json
{
  "value": 535.54,
  "confidence": 0.9,
  "breakdown": {
    "basePrice": 1099,
    "ageFactor": 0.5,
    "conditionFactor": 0.92,
    "brandFactor": 1,
    "accessoryValue": 30
  },
  "explanation": "This valuation accounts for the iPhone 13 Pro's original price, two-year age, and good condition with minor scratches."
}
```

## 🌱 Sustainability Calculation

- **CO₂ Saved:** Gemini estimates the carbon footprint (kg CO₂) of manufacturing a new item, based on its name.
- **Money Saved:** Estimated new item cost minus actual swap cost (item value + cash paid). If negative, set to zero.
- **Personalized Summary:** Gemini generates a short message showing CO₂ and money saved for every swap.

## 🤝 Contributing

This is a hackathon project. For questions or contributions, please reach out to the team.

## 📄 License

MIT

## 🔗 Resources

- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Google Gemini API](https://ai.google.dev/docs)
- [Flutter Integration Guide](./MOBILE_INTEGRATION_GUIDE.md)

---

**Built with ❤️ for BarterBrAIn - College Marketplace**