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

### `/barterbrain-main`
Flutter frontend application

### `/barterbrain-ai`  
AI-powered backend services

## 🚀 Quick Start

### Flutter App
```bash
cd barterbrain-main/
flutter pub get
flutter run
```

### AI Services
```bash
cd barterbrain-ai/
npm install
firebase deploy --only functions
```

---
**Built for students, by students 🎓**