# onlyStuff — Build Report
**Date:** 2026-06-02  
**Version:** 1.0 (prototype)  
**Stack:** React + Vite + Tailwind · Node.js + Express + Prisma · Neon PostgreSQL · Socket.io

---

## What Was Built

### 1. Product & Technical Docs
| File | Description |
|------|-------------|
| `PRD.md` | Product Requirements Document v0.4 — all decisions locked |
| `TRD.md` | Technical Requirements Document v1.0 — full spec |
| `AUDIT_REPORT.md` | Code audit — 22 integration tests, 5 bugs found and fixed |
| `STATUS.md` | Module-by-module build tracker |

---

### 2. Backend (`backend/`)

**Infrastructure**
- Node.js + Express server with Helmet, CORS, rate limiting
- Prisma ORM connected to Neon PostgreSQL
- Socket.io real-time server with JWT auth middleware
- Google OAuth 2.0 via Passport.js (email fallback for seeded admins)
- Nodemailer + Gmail SMTP

**Database — 18 models**
Users, Communities, Listings, ServiceConfig, BlockedSlots, PriceSlabs, Orders, Bookings, GroupBuys, GroupBuyMembers, Messages, GroupBuyMessages, Reviews, Vouches, Reports, Notifications, DeliveryPartners, AdminLogs

**API — 60+ endpoints across 10 route files**
Auth, Users, Communities, Listings, Orders, Bookings, GroupBuys, Chat, Delivery, Admin

**Storage**
- Abstract `StorageService` interface (swap provider in one line)
- `GoogleDriveStorage` — OAuth2 personal account delegation (refresh token)
- To switch to S3/GCS: replace one line in `storage/index.js`

**Cron Jobs (5)**
1. Auto `fully_closed` orders/bookings after 48h dispute window
2. Auto-cancel expired group buys
3. Warn group buys expiring in 6h
4. Booking reminder emails 24h before slot
5. Auto-decline booking requests unanswered after 2h

**Email Templates (16)**
welcome, aadhaar_approved, aadhaar_rejected, community_approved, community_rejected, order_placed, order_confirmed, group_buy_locked, group_buy_expiring, group_buy_cancelled, booking_request, booking_confirmed, booking_reminder, order_closed, dispute_raised, review_unlocked

**Seed Data**
- 25 Hyderabad apartment communities with lat/lng
- 2 admin users (role=admin, aadhaarStatus=approved)
- 4 delivery partner stubs (Porter, Dunzo, Rapido, Swiggy Genie)

---

### 3. Frontend (`frontend/`)

**Architecture**
- React 18 + Vite + Tailwind CSS
- React Query (server state) + Zustand (client state)
- Socket.io client (real-time chat + notifications)
- Leaflet + react-leaflet (OpenStreetMap — no API key)
- Mobile-first responsive: BottomNav on mobile, Navbar on desktop

**22 Pages built**

| Tab | Page | Features |
|-----|------|---------|
| Auth | Login | Google OAuth button |
| Auth | OAuthCallback | Token handoff + redirect |
| Auth | AadhaarUpload | Front/back image upload, drag-drop |
| Auth | PendingVerification | Status screen, 24h SLA message |
| Buy | Home | Community-first feed, infinite scroll |
| Buy | Search | Text search, type/category/radius filters, list + OSM map toggle |
| Buy | ListingDetail | Photo gallery, slab price table, order form, group buy panel |
| Buy | Orders | Close, dispute (48h), review modal |
| Buy | GroupBuys | Progress bar, extend 24h |
| Sell | MyListings | Pause/reactivate/remove |
| Sell | CreateListing | Full form — photos, slab editor, service schedule |
| Sell | EditListing | Pre-filled form |
| Sell | OrdersReceived | Sectioned by status, confirm/close/dispute |
| Sell | ServiceCalendar | Month calendar, day view, pending banner, confirm/decline |
| Chat | ChatList | Conversations sorted by last message |
| Chat | ChatWindow | Real-time messages, typing indicator, image attachments |
| Admin | Dashboard | Navigation hub |
| Admin | AadhaarQueue | Review images, approve/reject |
| Admin | CommunityRequests | Approve/reject with reason |
| Admin | Reports | Dismiss/warn/remove/ban |
| Admin | UserManagement | Search, warn/suspend/ban/unban |
| Admin | Analytics | Live platform stats |

**UI Components**
Button (4 variants + loading), Badge (6 variants), Avatar (initials fallback), Modal (4 sizes + scroll lock), Spinner (3 sizes), Toast (4 types + progress bar + socket-driven), PhotoUpload (drag-drop, 10 max), SlabPricingEditor (up to 5 tiers), OrderCard (full lifecycle actions)

**Hooks**
`useAuth`, `useSocket`, `useNotifications` (real-time bell with unread count)

---

### 4. Landing Pages (`landing/`)

5 static HTML/CSS pages — no framework:

| Page | Content |
|------|---------|
| `index.html` | Phone mockup hero, stats bar, features, how-it-works, testimonials, trust strip, CTA |
| `how-it-works.html` | Step guide, buying/selling sections, FAQ accordion |
| `communities.html` | All 25 communities grouped by Hyderabad area |
| `sellers.html` | Feature grid, product/service categories, pricing table example |
| `about.html` | Story, principles, contact |

Shared: glassmorphism nav with hamburger mobile drawer, scroll-reveal animations, fully responsive (1024 / 768 / 480px breakpoints).

---

## Bugs Found & Fixed (Audit)

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `orders.js` | `resolveSlabPrice()` was a stub — slab orders priced wrong | Real DB query against PriceSlab table |
| 2 | `listings.js` | `skip: (page-1) * limit` — string math gave NaN | `parseInt()` both values |
| 3 | `groupBuys.js` | Race condition on concurrent joins — wrong committedQty | Prisma atomic `{ increment: qty }` |
| 4 | `GoogleDriveStorage.js` | `keyFile` path resolved inconsistently | `path.resolve(process.cwd(), ...)` |
| 5 | `App.jsx` | Onboarding routes unprotected — accessible when logged out | Added `RequireLogin` wrapper |

---

## Known Limitations (v1 — intentional)

| Item | Notes |
|------|-------|
| Delivery adapters | Porter/Dunzo/Rapido/Swiggy Genie return `null` until API keys added |
| Profile page | Avatar in Navbar has no destination — profile page not built |
| Razorpay | Phase 2 — all payments currently P2P |
| Mobile app | Web only — no iOS/Android |
| Aadhaar v2 | DigiLocker + OTP planned; v1 is manual admin review |
| Drive token rotation | OAuth refresh token is long-lived but will expire — re-run `get-drive-token.js` if uploads fail |

---

## Environment Setup

**Backend** — copy `backend/.env.example` → `backend/.env` and fill in:
- `DATABASE_URL` — Neon connection string
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth app credentials
- `GMAIL_APP_PASSWORD` — Gmail app password (not account password)
- `GOOGLE_DRIVE_FOLDER_ID` — Drive folder ID
- `GOOGLE_DRIVE_REFRESH_TOKEN` — run `node get-drive-token.js` once

**Frontend** — copy `frontend/.env.example` → `frontend/.env` (defaults work for local dev)

---

## Quick Start

```bash
# 1. Backend
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev          # runs on :4000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev          # runs on :5173
```

Login with `udaykumar199881@gmail.com` or `poloju.ganeshchary@gmail.com` for admin access.
