# BarterBrAIn 🧠💱

**Campus-wide peer-to-peer trading platform with AI-powered price suggestions**

BarterBrAIn is a Flutter mobile application that enables verified university students to trade items with each other seamlessly. The platform combines real-time messaging, AI-driven product valuation, and secure payment integration to create a trusted marketplace within university communities.

## 🚀 Features

### For Students
✅ **Verified Community**: Only .edu email addresses  
✅ **Smart Pricing**: AI suggests fair market value  
✅ **Real-time Chat**: WhatsApp-like messaging with emojis and images  
✅ **Secure Payments**: Integrated with Capital One Nessie API  
✅ **Trade Matching**: Find products within your price range  
✅ **Trade History**: Track all your exchanges  

## 🛠️ Tech Stack

**Frontend**: Flutter (Dart)  
**Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)  
**State Management**: GetX  
**UI**: Cupertino Native (iOS-inspired widgets)  
**AI**: Google Gemini API  
**Payments**: Capital One Nessie API  

## 📁 Project Structure

This repository is organized into two main components:

### `/barterbrain-main` - Flutter Frontend
- Complete Flutter mobile application
- User authentication and profile management
- Real-time messaging and trading interface
- Product listings and search functionality
- Payment integration with Capital One Nessie API

### `/barterbrain-ai` - AI Backend Services  
- Google Gemini API integration for smart pricing
- Sustainability analysis and recommendations
- Product valuation algorithms
- Firebase Cloud Functions for backend processing

## 🚀 Installation & Setup

### Prerequisites
- Flutter SDK (3.0 or higher)
- Node.js (18 or higher)
- Firebase CLI
- Android Studio / Xcode for mobile development
- Git

### Clone the Repository
```bash
git clone https://github.com/Anaswara23/BarterBrAIn.git
cd BarterBrAIn
```

### Flutter App Setup
```bash
cd barterbrain-main/
flutter pub get
flutter run
```

### AI Services Setup
```bash
cd barterbrain-ai/
npm install
firebase login
firebase deploy --only functions
```

### Environment Variables
Create the following configuration files:

**Flutter App (`barterbrain-main/`)**:
- Configure Firebase in `lib/core/firebase_options.dart`
- Add Capital One API keys to your environment

**AI Services (`barterbrain-ai/`)**:
- Set up Gemini API key in Firebase environment
- Configure Firebase project settings

---

## 📱 Usage

1. **Setup your university email** for verification
2. **Browse products** posted by fellow students
3. **Get AI price suggestions** for fair trades
4. **Chat in real-time** with other traders
5. **Complete secure transactions** with integrated payments

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: [your-email@university.edu](mailto:your-email@university.edu)
- 🐛 Issues: [GitHub Issues](https://github.com/Anaswara23/BarterBrAIn/issues)
- 📖 Documentation: Check individual folder READMEs for detailed setup

**Built for students, by students 🎓**