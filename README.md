# Book a Place — AI-Powered Accommodation Booking Marketplace (Pakistan)

> **"Find Your Place. Make Yourself at Home."**

Book a Place is a modern accommodation booking platform built for Pakistan, powered by **React, TypeScript, Supabase PostgreSQL, and Google Gemini AI**. It connects property hosts with students, working professionals, families, tourists, and backpackers across Pakistani cities including Islamabad, Lahore, Karachi, Murree, Hunza, Skardu, Peshawar, and Multan.

---

## 🏛️ Architecture Overview

```
├── src/
│   ├── components/
│   │   ├── ai/            # Google Gemini Stay Specialist & Itinerary Planner
│   │   ├── booking/       # Booking Checkout (Easypaisa, JazzCash, 1Link, Card)
│   │   ├── dashboard/     # Customer, Host & Protected Admin Panels
│   │   ├── destinations/  # Pakistani City Explorer
│   │   ├── home/          # Hero Search & Quick Destination Chips
│   │   ├── layout/        # Navbar, Footer & Brand Identity
│   │   ├── packages/      # Student Living, Executive Suites, Northern Chalets
│   │   ├── properties/    # Horizontal Property Cards (Reference UI), Filters, Interactive Map, Detail Modal
│   │   └── static/        # Policies (Cancellation, Terms, Privacy, Helpline)
│   ├── context/           # AuthContext (Role Switching: Guest, Host, Admin, Multi-currency PKR/USD/AED/GBP)
│   ├── lib/               # Supabase Client & Seed Data
│   ├── services/          # Unified Database Service (Supabase & local store)
│   └── types/             # Domain Types matching 21 PostgreSQL tables
├── server/
│   ├── gemini.ts          # Server-side Gemini Client with aistudio-build telemetry
│   └── routes.ts          # Express API Endpoints (/api/ai/*, /api/bookings/*, /api/workspace/*)
├── supabase/
│   ├── migrations/        # 20261009000000_initial_schema.sql (21 tables, RLS, triggers)
│   ├── functions/         # Supabase Edge Functions (gemini, checkout, webhook, sync)
│   └── storage_policies.sql
├── tests/                 # Automated tests for pricing engine & booking constraints
└── server.ts              # Full-stack Node production server
```

---

## 🗄️ Supabase PostgreSQL Schema (21 Tables)

The database schema is fully normalized with foreign keys, checks, indexes, and Row Level Security (RLS):

1. **`profiles`** — Customer, host, and admin account info with CNIC/Passport verification.
2. **`user_roles`** — Role-based authorization (`customer`, `host`, `admin`).
3. **`host_profiles`** — Verification status, bank account titles, IBAN, and payout preferences.
4. **`destinations`** — Pakistani cities (Islamabad, Lahore, Karachi, Murree, Hunza, Skardu, etc.).
5. **`amenities`** — Categorized amenities (Fiber Wi-Fi, 24/7 Generator/UPS, Inverter AC, Heating, CCTV).
6. **`properties`** — Accommodations with coordinates, nightly base rates in PKR, and house rules.
7. **`property_images`** — Photo gallery references and display orders.
8. **`room_types`** — Specific room tiers (shared room, studio, suite, entire apartment).
9. **`availability`** — Calendar availability and price overrides.
10. **`packages`** — Student living, corporate executive, budget, and northern retreat packages.
11. **`promotions`** — Promo codes (`WELCOMEPK` = 10% off, `STUDENT15` = 15% off).
12. **`bookings`** — Idempotent booking records with reference IDs (e.g., `BAP-PK-2026-8941`).
13. **`booking_guests`** — Detailed guest records and government ID logs.
14. **`payments`** — Transaction records with Easypaisa, JazzCash, 1Link, or Card references.
15. **`refunds`** — Refund requests and processing status.
16. **`reviews`** — Verified-stay guest reviews with category ratings.
17. **`wishlists`** — Saved customer accommodations.
18. **`support_tickets`** — Customer support inquiries.
19. **`notifications`** — In-app alerts for confirmations and cancellations.
20. **`integration_jobs`** — Background sync jobs for Google Workspace.
21. **`audit_logs`** — Administrative and security change audit trail.

---

## 🛡️ Row Level Security (RLS) Policies

All tables have RLS enabled:
- **Public Visitors**: Can view published properties, approved reviews, packages, and destinations.
- **Customers**: Can read/update only their own profile, view their own bookings, and save wishlists.
- **Hosts**: Can create and manage their own listings, room types, and reservations.
- **Administrators**: Access restricted management functions via `is_admin()` helper function.

---

## 🤖 Google Gemini AI Features

- **Stay Specialist (`/api/ai/recommend`)**: Analyzes travel queries (e.g., *"Furnished room in Lahore near Gulberg for 30 days under PKR 45,000"*), matches listings, computes cost trade-offs, and provides local advice.
- **Itinerary Generator (`/api/ai/itinerary`)**: Creates personalized day-by-day travel schedules highlighting authentic food, sights, and transit in Pakistan.

---

## 🗺️ Google Maps & Destination Locator

- Interactive accommodation map highlighting properties across Pakistani coordinates with price pills.
- Split-screen card and map explorer.
- City filters for quick jumping between North and South regions.

---

## 💼 Google Workspace Integrations

- **Google Sheets (`/api/workspace/export-sheets`)**: Export booking data and financial summaries directly to CSV/Sheets.
- **Google Docs (`/api/workspace/generate-doc`)**: Generate printable official reservation vouchers and itineraries.
- **Gmail Notifications (`/api/workspace/send-email`)**: Send booking confirmation emails.

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

3. **Run automated tests:**
   ```bash
   npx tsx --test tests/booking-engine.test.ts
   ```

4. **Build & Start production:**
   ```bash
   npm run build
   npm start
   ```

5. **Deploy Supabase Migrations:**
   Copy the contents of `supabase/migrations/20261009000000_initial_schema.sql` and run them in your Supabase SQL Editor.
