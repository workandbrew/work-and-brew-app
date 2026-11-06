# Work & Brew ☕📍

Work & Brew is a mobile application designed to help remote workers, students, and creatives
discover vetted, work-friendly cafés with reliable WiFi, comfortable seating, and
focus-supportive atmospheres.

The app is built with a productivity-first mindset, blending café discovery with tools that
support intentional work sessions.

---

## 🚧 Project Status
**In active development (MVP phase)**

This repository represents the active development of the Work & Brew mobile application.
Features, architecture, and implementation are evolving as the product is iterated and tested.

---

## ✨ Core Features (MVP)
- Discover work-friendly cafés by location
- “Café of the Week” spotlight
- Save and favorite cafés
- Focus tools to support productive sessions
- Foundation for user accounts and personalization

---

## 🛠 Tech Stack
- React Native (Expo)
- JavaScript
- Expo Router
- GitHub for version control

---

## ▶️ Run the app

```bash
npm install
npx expo start
```

### On your iPhone or iPad
1. Install **Expo Go** from the App Store.
2. Make sure your phone and computer are on the same Wi-Fi.
3. Run `npx expo start` on your computer and scan the QR code with the iPhone **Camera** app. It opens in Expo Go.
   If the networks don't match, use `npx expo start --tunnel`.

Edits to the code reload on the device right away. For TestFlight or App Store builds, use EAS: `npx eas-cli@latest build --platform ios`.

### In a browser
`npx expo start --web`. Handy for quick checks, but the phone is the real test.

## 🗂 Project layout
- `src/app/`: screens (Expo Router). `(tabs)/` holds Explore, Map, Focus, Saved, and Profile, each with its own stack.
- `src/components/`: shared UI (nav bar, buttons, café art, map stand-in).
- `src/theme/`: design tokens from the Spotlight wireframe kit, plus `useLayout` for iPhone → iPad sizing.
- `src/state/`: app state (saved on the device for now) and the focus timer.
- `src/services/`: data access. This is where Supabase plugs in. See [docs/BACKEND.md](docs/BACKEND.md).

---

## 🔐 Security & Data Handling
Work & Brew is built with privacy and security best practices in mind:

- User authentication and account data are handled using secure, industry-standard methods
- Sensitive credentials (API keys, secrets, environment variables) are excluded from version
  control via `.gitignore`
- Passwords and authentication tokens are never stored in plain text
- Only essential user data required for core functionality is collected during the MVP phase

Security considerations will continue to evolve as the product scales.

---

## 📄 Privacy & Compliance
The application is designed to align with platform and privacy requirements, including:

- Transparent disclosure of collected user data
- Clear purpose for data usage
- Support for account deletion and data removal
- Compliance with App Store and Google Play privacy guidelines

Formal Privacy Policy and Terms of Service will be published prior to public launch.

---

## 🎯 Product Vision
Work & Brew aims to bridge productivity and local café culture by making it easier to find
spaces that support deep work and creativity.

The long-term vision includes:
- Community-driven café vetting
- Expanded focus and productivity tools
- City-by-city expansion, starting in NYC

---

## 👩‍💻 Author
Built and maintained by the founder of Work & Brew.

---

## 🔒 License
All rights reserved.

This repository and its contents are proprietary and may not be copied, modified, or
redistributed without explicit permission from the author.
