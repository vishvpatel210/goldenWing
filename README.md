# ✈️ GoldenWing — Luxury Flight Booking System

A full-stack luxury flight reservation application inspired by five-star airlines, featuring a bespoke **Black & Gold (#080808 / #D4AF37)** design system, atomic collision-free seat allocation, digital ticketing, and an executive administration command center.

---

## 🌟 Key Features

### 📱 Traveler Mobile Application (React Native / Expo)
- **Luxury Aesthetic**: Consistent black and gold interface with customized status bars, luxury cards, and tactile feedback.
- **Dynamic Search**: Interactive source & destination airports, cabin classes (Economy, Business, First Class), calendar date pickers, and passenger counters.
- **Cabin Suite Matrix**: Real-time interactive seat map displaying reserved, available, and active suite selections.
- **Atomic Booking Flow**: Conflict-free seat locking, passenger manifest collection, and instant boarding pass generation.
- **My Trips**: Digital boarding passes with simulated QR codes, flight statuses, and full cancellation options.
- **Member Portal**: Role-based access for VIP travelers and administrative executives.

### 🛡️ Backend API & Executive Services (Node.js / Express / MongoDB)
- **Stateless JWT Authentication**: Secure password hashing with `bcryptjs` (10 rounds) and protected Bearer token interceptors.
- **Role-Based Access Control (RBAC)**: Strict separation of privileges (`user` vs `admin`) preventing self-assigned elevation.
- **Atomic Concurrency Protection**: High-performance MongoDB query filters ensuring two travelers cannot reserve the same seat simultaneously.
- **Automated PNR & Ticket Issuance**: Generation of 6-character PNR booking references (`GW****`) and 13-digit airline ticket numbers (`074-**********`).
- **Executive Analytics Engine**: Dashboard metrics covering total gross revenue, occupancy rates, and real-time fleet schedules.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React Native, Expo (SDK 52), Expo Router |
| **Language** | TypeScript |
| **Networking & State** | Axios, Context API |
| **Secure Storage** | Expo SecureStore, Platform LocalStorage |
| **Backend Runtime** | Node.js, Express.js |
| **Database** | MongoDB Atlas / Mongoose ORM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Cloud Deployment** | Render (Web Service), EAS Build (Android APK) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Expo Go App](https://expo.dev/client) (on iOS or Android device)

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd goldenWing/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` to configure your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/goldenwing?retryWrites=true&w=majority
JWT_SECRET=goldenwing_super_secret_jwt_key_2026
JWT_EXPIRE=30d
```

```bash
# Seed the database with airports, luxury flights, and demo accounts
npm run seed

# Run automated verification test suite
npm test

# Start backend server
npm run dev
```
> Server runs on `http://localhost:5000/api`

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd goldenWing/frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```
- Press `w` to open in your web browser.
- Scan the displayed QR code with the **Expo Go** mobile application on your iOS or Android device.

---

## 🔐 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **VIP Traveler** | `elite@goldenwing.com` | `password123` | Search, select suites, book flights, view trips |
| **Administrator** | `admin@goldenwing.com` | `admin123` | Analytics, add/edit/delete flights, view master manifest |

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Create traveler account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET  /api/users/profile` — Get authenticated traveler profile *(Private)*
- `PUT  /api/users/profile` — Update traveler profile *(Private)*

### Flights
- `GET    /api/flights` — Search flights with filters, sorting & pagination *(Public)*
- `GET    /api/flights/:id` — Get flight details and seat layout *(Public)*
- `POST   /api/flights` — Create new flight schedule *(Admin Only)*
- `PUT    /api/flights/:id` — Update flight pricing or schedule *(Admin Only)*
- `DELETE /api/flights/:id` — Cancel and remove flight from fleet *(Admin Only)*

### Bookings
- `POST /api/bookings` — Atomically reserve suites and generate tickets *(Private)*
- `GET  /api/bookings/my-trips` — Get user's active & past bookings *(Private)*
- `GET  /api/bookings/:id` — Get booking details & QR boarding pass *(Private)*
- `POST /api/bookings/:id/cancel` — Cancel booking and restore seat inventory *(Private)*

### Executive Admin Suite
- `GET /api/admin/analytics` — Gross revenue, occupancy rates & fleet KPIs *(Admin Only)*
- `GET /api/admin/bookings` — Master passenger manifest with PNR search *(Admin Only)*
- `PUT /api/admin/flights/:id/seats` — Direct seat availability override *(Admin Only)*

---

## 📦 Deployment Guide

### Backend on Render
1. Push this repository to GitHub.
2. In Render, select **New Web Service** and connect your repository.
3. Use the provided [`render.yaml`](./render.yaml) blueprint or set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String
   - `JWT_SECRET`: Any high-entropy random secret key
   - `NODE_ENV`: `production`

### Android APK Generation via Expo EAS
1. Install EAS CLI: `npm install -g eas-cli`
2. Authenticate: `eas login`
3. Configure project: `eas build:configure`
4. Build standalone installable APK:
   ```bash
   cd frontend
   eas build -p android --profile preview
   ```
5. Download and install the generated `.apk` directly onto any Android device.
