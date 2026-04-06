# AgeShield AI 🛡️

**Intelligent Governance for the Digital Age.**

AgeShield AI is a state-of-the-art, full-stack application ecosystem designed to protect users (aged 5-18) from psychologically harmful, explicit, or developmentally inappropriate content across their mobile devices. Built using microservices logic, the application unites Native Android filtering architectures with locally-deployed deep learning Python inference pipelines.

---

## 🌟 Key Features

### 1. Facial Age Inference Engine 🤖
Instead of relying strictly on typed inputs or standard DOB strings, AgeShield AI captures real-time biometric images via the onboarding screen and routes them to a local FastAPI microservice running the **DeepFace / InsightFace** architecture. This automatically bins the user into secure protection bands (`5-10`, `11-14`, `15-17`).

### 2. Deep NLP Content Governance
When a child browses the web on their Android device, background AI proxy systems utilize a lightweight **DistilBERT** Transformer endpoint to run sentiment semantic scans across all visited text and URLs, returning a Risk Score < 200ms.

### 3. Glassmorphic Web Dashboard
A luxurious, dark-mode React Dashboard for parents to monitor aggregated analytics, visualize screen time, adjust rule structures across blocked network patterns, and trigger **Remote Lockdowns**.

### 4. Educational AI Interventions
AgeShield AI doesn't just block screens. If a user encounters restricted materials, the screen automatically overlays with a friendly AI avatar explaining *why* the content is locked, providing educational and age-appropriate media alternatives.

---

## 🏗️ Architecture

The app is divided into 4 main autonomous repositories scaling via Docker Compose:

* **`/dashboard`** - React.js (Vite) premium web hub for administration.
* **`/mobile`** - React Native (Android) application with Accessibility Services and Background API hooks.
* **`/backend`** - Node.js serving JSON Web Tokens (JWT) and Mongoose schemas to track Rules, Devices, and History.
* **`/ai_services`** - Python-based FastAPI endpoints handling intensive Computer Vision and NLP model inferencing.

---

## 🚀 Getting Started

To launch the entire platform securely inside standard networked containers, verify that you have Docker installed.

### Fast Launch (All Infrastructure)
```bash
docker-compose up --build -d
```
This automatically boots:
* MongoDB Server (`:27017`)
* Node Backend Hub (`:5000`)
* Python FastAPI Engine (`:8000`)
* React Dashboard Webpage (`:5173`)

Navigate to [http://localhost:5173/](http://localhost:5173/) to witness the magic!

### Android Emulator Setup
Ensure your local Android development environment is connected.
```bash
cd mobile
npm install
npx react-native run-android
```

---
*Built with ❤️ for modern digital youth safety.*
