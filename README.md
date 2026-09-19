# FoodBridge — Real-Time Food Surplus Redistribution & Logistics Platform

FoodBridge connects commercial food donors (restaurants, university dining halls, hostels, event caterers, bakeries), verified volunteer couriers, and local NGOs/shelters to eliminate food waste and fight hunger through real-time logistics and digital chain-of-custody verification.

---

## 🌟 Key Features

- **🍱 Surplus Food Posting Engine (Donor Portal)**:
  - Rapid posting presets for Restaurant Buffets, Hostel Messes, Corporate Canteens, and Bakeries.
  - Granular parameters: Weight (kg), meal equivalents, dietary classifications (Vegetarian, Vegan, Halal, Non-Veg, Jain), thermal storage specs (, Chilled, Ambient, Frozen), and strict pickup expiry windows.
  - Gemini AI integration for real-time food safety shelf-life recommendations and environmental CO₂ reduction estimates.

- **⏱️ Real-Time Expiry Countdown & Emergency Urgency Alerts**:
  - Live second-by-second countdown timer badges.
  - Visual urgency tiers: Freshly Prepared (), High Priority (3h), and Critical Expiry ($<1$h) with top banner alerts.

- **🗺️ Real-Time Distribution Route Map (Leaflet)**:
  - Interactive live map displaying donor pickup locations, transit vehicles, and beneficiary NGO centers.
  - Simulated live GPS courier movements with animated delivery progress and route polylines.

- **🤝 Volunteer Rescue Dashboard & Contribution Points**:
  - Step-by-step workflow: Handover verification code check, photo proof upload, and NGO sign-off.
  - Gamification with contribution points ($+100$ per rescue, urgency bonuses, photo badges) and courier leaderboards.

- **🏢 NGO Hub & Beneficiary Meal Planning**:
  - Live incoming delivery alerts with courier ETAs.
  - Capacity intake meters and an emergency food request broadcast bulletin.

- **📊 Measurable Social & Environmental Impact**:
  - Tracks **Food Donated (128 kg)**, **Meals Redistributed (356)**, **Food Waste Prevented (128 kg)**, **Active Volunteers (42)**, and **Successful Deliveries (91)**.
  - Calculates greenhouse gas savings ($320$ kg CO₂e) and virtual water savings ($108,800$ Liters).
  - Chain-of-custody audit logs with digital receipts for corporate ESG reporting.

---

## 📁 Project Structure

```
├── .env.example             # Example environment variables template
├── .gitignore                # Git ignore list (node_modules, dist, .env)
├── index.html               # Main HTML entry point
├── metadata.json            # Application metadata & permissions
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration with Tailwind CSS v4
├── server.ts                # Express full-stack API backend & mock database
├── src/
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Core app container & state management
│   ├── index.css            # Tailwind CSS styling
│   ├── types.ts             # Global TypeScript models & interfaces
│   └── components/
│       ├── Header.tsx               # Navigation, stats pill, urgent alert ticker
│       ├── DistributionMap.tsx      # Leaflet map with animated delivery routes
│       ├── VolunteerDashboard.tsx   # Courier mission manager, code verification, points
│       ├── NgoDashboard.tsx         # Beneficiary intake, incoming ETAs, broadcast requests
│       ├── DonorPortal.tsx          # Donor management, impact stats, active batches
│       ├── ImpactDashboard.tsx      # High-impact statistics, ESG certificates, charts
│       ├── PostFoodModal.tsx        # Modal for posting food surplus with Gemini AI
│       ├── ListingCard.tsx          # Card component for individual food listings
│       ├── ListingDetailModal.tsx   # Detailed modal with chain-of-custody proofs
│       └── CountdownBadge.tsx       # Live dynamic countdown timer component
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <your-github-repo-url>
cd foodbridge
npm install
```

### 3. Environment Configuration (Optional)
If you want to use the Gemini AI features:
```bash
cp .env.example .env
```
Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*(The app functions smoothly with built-in intelligent fallback recommendations even without an API key).*

### 4. Running Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Canvas-Confetti, Leaflet.
- **Backend**: Node.js, Express, ESBuild, TSX.
- **AI**: Google Gen AI SDK (`@google/genai`) for portion estimation and safety assessment.
- **Tooling**: Vite.
