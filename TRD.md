# Technical Requirements Document
## onlyStuff — Hyperlocal Community Commerce Platform
**Version:** 1.0  
**Date:** 2026-06-02  
**Status:** Final

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────────┐   ┌────────────────────────────────────┐   │
│  │  landing/        │   │  frontend/ (React + Vite)          │   │
│  │  Static HTML/CSS │   │  - Buy tab (Home, Search, Orders)  │   │
│  │  5 pages         │   │  - Sell tab (Listings, Calendar)   │   │
│  │  Vercel CDN      │   │  - Admin tab (role-gated)          │   │
│  └─────────────────┘   │  - Socket.io client (real-time)    │   │
│                         └────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / WSS
┌───────────────────────────────▼─────────────────────────────────┐
│                        API LAYER                                │
│  backend/ (Node.js + Express)                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  REST    │ │ Socket.io│ │ Passport │ │ Nodemailer       │   │
│  │  /auth   │ │ /ws      │ │ Google   │ │ Gmail SMTP       │   │
│  │  /users  │ │ rooms:   │ │ OAuth2   │ │ 16 templates     │   │
│  │  /listing│ │ user:id  │ └──────────┘ └──────────────────┘   │
│  │  /orders │ │ listing: │                                      │
│  │  /admin  │ │ groupbuy │                                      │
│  └──────────┘ └──────────┘                                      │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ StorageService   │  │ DeliveryService│  │ GeoService     │   │
│  │ GoogleDrive (v1) │  │ Pluggable      │  │ Google Maps    │   │
│  │ S3/GCS (v2)      │  │ adapters       │  │ Geocoding      │   │
│  └──────────────────┘  └────────────────┘  └────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        DATA LAYER                               │
│  Neon PostgreSQL (managed)                                      │
│  Prisma ORM — 18 models                                         │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐   │
│  │ users   │ │communities│ │listings │ │orders  │ │bookings │   │
│  └─────────┘ └──────────┘ └─────────┘ └────────┘ └─────────┘   │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐               │
│  │group_   │ │ messages │ │ reviews │ │ admin_ │               │
│  │ buys    │ │          │ │         │ │  logs  │               │
│  └─────────┘ └──────────┘ └─────────┘ └────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Repo Structure

```
onlystuff/              (monorepo — single GitHub repo)
├── frontend/           React + Vite + Tailwind CSS
├── backend/            Node.js + Express + Prisma
├── landing/            Static HTML/CSS (5 pages)
├── PRD.md
├── TRD.md
├── README.md
└── .gitignore
```

### 1.2 Auth Flow

```
1. User clicks "Continue with Google"
2. Browser → GET /auth/google → passport.authenticate redirects to Google
3. Google → GET /auth/google/callback (with code)
4. Passport exchanges code → user profile
5. If new user: create User record (role seeded for admin emails)
6. Sign JWT with userId, set as httpOnly cookie
7. Redirect to frontend based on aadhaarStatus:
   - approved → /
   - no aadhaar uploaded → /onboarding/aadhaar
   - pending review → /onboarding/pending
8. All subsequent API calls carry the cookie automatically
9. requireAuth middleware verifies JWT, attaches req.user
```

---

## 2. Database Schema

### 2.1 Key Design Decisions
- `cuid()` primary keys throughout (collision-resistant, URL-safe)
- `lat/lng Float` columns instead of PostGIS (avoids PostGIS extension requirement on Neon's free tier; Google Maps API handles geo math)
- All arrays stored as `String[]` (photos, workingDays, promotedCommunities)
- JSONB used for flexible fields (fulfillment, metadata)
- Soft deletes via status fields — nothing is hard-deleted

### 2.2 Full Prisma Schema
See `backend/prisma/schema.prisma` for the complete, production-ready schema covering all 18 models:
- **users** — Google OAuth, Aadhaar status, role, community membership
- **communities** — Organic growth model, pending/active/suspended states
- **listings** — Products and services, slab pricing, visibility control
- **service_configs** — Slot duration, buffer, working hours per service
- **blocked_slots** — Provider availability overrides
- **price_slabs** — Up to 5 pricing tiers per listing
- **orders** — Full lifecycle: placed → confirmed → closed → disputed/fully_closed
- **bookings** — Service bookings with recurrence series support
- **group_buys** — 48h window, auto-lock on target, one extension
- **group_buy_members** — Unique constraint (groupBuyId, userId)
- **messages** — Listing-scoped P2P chat
- **group_buy_messages** — Group buy chat thread
- **reviews** — Post-fully-closed, unique per (orderId, reviewerId)
- **vouches** — Revocable community vouching
- **reports** — Multi-type reporting with admin action tracking
- **notifications** — Per-user, typed, with metadata JSON
- **delivery_partners** — Pluggable partner config
- **admin_logs** — Full audit trail of admin actions

---

## 3. API Design

### Base URL
- Development: `http://localhost:4000`
- Production: `https://api.onlystuff.in`

### Authentication
- JWT stored in `httpOnly` cookie named `token`
- `requireAuth` middleware: verifies JWT, attaches `req.user`
- `requireVerified` middleware: checks `aadhaarStatus === 'approved'`
- `adminOnly` middleware: checks `role === 'admin'`

### Endpoints Summary

#### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /auth/google | — | Initiate OAuth |
| GET | /auth/google/callback | — | OAuth callback |
| POST | /auth/logout | — | Clear cookie |
| GET | /auth/me | requireAuth | Current user |

#### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /users/:id | requireAuth + verified | Public profile |
| PATCH | /users/me | requireAuth | Update name/bio/phone |
| POST | /users/me/aadhaar | requireAuth | Upload Aadhaar images (multipart) |
| GET | /users/me/notifications | requireAuth | Notification list |
| PATCH | /users/me/notifications/:id/read | requireAuth | Mark read |
| POST | /users/:id/vouch | requireAuth + verified | Vouch for user |
| DELETE | /users/:id/vouch | requireAuth + verified | Revoke vouch |

#### Communities
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /communities | — | List active communities |
| GET | /communities/:id | — | Community detail |
| POST | /communities/request | requireAuth | Submit creation request |

#### Listings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /listings | — | Search + filter (q, type, category, radiusKm, lat, lng, page) |
| GET | /listings/:id | — | Listing detail with service config, slabs, group buys |
| POST | /listings | requireAuth + verified | Create listing (multipart with photos) |
| PATCH | /listings/:id | requireAuth + verified | Update listing |
| DELETE | /listings/:id | requireAuth + verified | Soft-delete (status=removed) |
| GET | /listings/:id/slots | requireAuth + verified | Available slots for a date (services) |
| POST | /listings/:id/report | requireAuth + verified | Report listing |

#### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /orders | requireAuth + verified | Place order |
| GET | /orders | requireAuth + verified | My orders (role=buyer/seller) |
| GET | /orders/:id | requireAuth + verified | Order detail |
| PATCH | /orders/:id/confirm | requireAuth + verified | Seller confirms |
| PATCH | /orders/:id/close | requireAuth + verified | Either party closes |
| POST | /orders/:id/dispute | requireAuth + verified | Raise dispute (within 48h) |
| GET | /orders/:id/reviews | requireAuth + verified | Get reviews |
| POST | /orders/:id/reviews | requireAuth + verified | Post review (after fully_closed) |

#### Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /bookings | requireAuth + verified | Create booking |
| GET | /bookings | requireAuth + verified | My bookings (role=buyer/seller) |
| GET | /bookings/:id | requireAuth + verified | Booking detail |
| PATCH | /bookings/:id/confirm | requireAuth + verified | Provider confirms |
| PATCH | /bookings/:id/decline | requireAuth + verified | Provider declines (reason required) |
| PATCH | /bookings/:id/reschedule | requireAuth + verified | Reschedule (max 2 times) |
| PATCH | /bookings/:id/cancel | requireAuth + verified | Cancel |
| POST | /bookings/:id/close | requireAuth + verified | Mark closed |
| POST | /bookings/:id/dispute | requireAuth + verified | Raise dispute |

#### Group Buys
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /group-buys | requireAuth + verified | List open group buys (listingId filter) |
| POST | /group-buys | requireAuth + verified | Initiate group buy |
| GET | /group-buys/:id | requireAuth + verified | Group buy detail |
| POST | /group-buys/:id/join | requireAuth + verified | Join group buy |
| POST | /group-buys/:id/extend | requireAuth + verified | Extend by 24h (initiator only, once) |
| GET | /group-buys/:id/chat | requireAuth + verified | Group chat messages |
| POST | /group-buys/:id/chat | requireAuth + verified | Send group chat message |

#### Chat
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /chat | requireAuth + verified | All conversations |
| GET | /chat/:listingId | requireAuth + verified | Messages for listing thread |
| POST | /chat/:listingId | requireAuth + verified | Send message (multipart for images) |

#### Delivery
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /delivery/query | requireAuth + verified | Query delivery partners (sellerLat, sellerLng, buyerLat, buyerLng) |

#### Admin (all require requireAuth + adminOnly)
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/aadhaar-queue | Pending Aadhaar verifications |
| PATCH | /admin/aadhaar/:userId/approve | Approve Aadhaar + send email |
| PATCH | /admin/aadhaar/:userId/reject | Reject with reason + send email |
| GET | /admin/community-requests | Pending community requests |
| PATCH | /admin/communities/:id/approve | Approve + place user in community |
| PATCH | /admin/communities/:id/reject | Reject with reason |
| GET | /admin/reports | Open reports queue |
| PATCH | /admin/reports/:id/action | dismiss / remove_listing / ban_user |
| GET | /admin/users | User list (q, role, aadhaarStatus filters) |
| GET | /admin/users/:id | Full user profile |
| PATCH | /admin/users/:id/action | warn / suspend / ban / unban |
| GET | /admin/listings | All listings (status filter) |
| PATCH | /admin/listings/:id/action | approve / remove / pause |
| GET | /admin/analytics | Platform totals |
| GET | /admin/analytics/communities | Per-community stats |
| GET | /admin/analytics/group-buys | Group buy status breakdown |
| GET | /admin/delivery-partners | List partners |
| POST | /admin/delivery-partners | Create partner config |
| PATCH | /admin/delivery-partners/:id | Update partner (enable/disable, API key) |

---

## 4. Real-time Architecture (Socket.io)

### 4.1 Room Strategy
| Room | Who joins | Events emitted to room |
|------|-----------|----------------------|
| `user:{userId}` | Auto on connection | `new_notification` |
| `listing:{listingId}` | Client calls `join:listing` | `chat:message`, `chat:typing` |
| `groupbuy:{groupBuyId}` | Client calls `join:groupbuy` | `chat:message`, `groupbuy:member_joined`, `groupbuy:locked`, `groupbuy:expiring_soon` |

### 4.2 Socket Events Reference

**Client → Server:**
| Event | Payload | Description |
|-------|---------|-------------|
| `join:listing` | `listingId` | Subscribe to listing chat |
| `join:groupbuy` | `groupBuyId` | Subscribe to group buy updates |
| `chat:send` | `{listingId, content}` | Broadcast message (REST call persists first) |
| `chat:typing` | `{listingId}` | Broadcast typing indicator |

**Server → Client:**
| Event | Payload | Description |
|-------|---------|-------------|
| `chat:message` | Message object | New chat message |
| `chat:typing` | `{userId, listingId}` | Typing indicator |
| `new_notification` | `{type, ...metadata}` | Real-time notification |
| `groupbuy:member_joined` | `{userId, committedQty, targetQty}` | Member joined group buy |
| `groupbuy:locked` | `{id}` | Group buy reached target |
| `groupbuy:expiring_soon` | `{id, expiresAt}` | 6h before expiry |

### 4.3 Auth Middleware
JWT verified on socket handshake via cookie or `socket.handshake.auth.token`. Unauthorized connections are rejected before any room subscription.

---

## 5. Storage Layer

### 5.1 Abstract Interface (`StorageService.js`)
```js
class StorageService {
  async upload(buffer, path, mimeType) → String (URL)
  async getUrl(fileId) → String (URL)
  async delete(fileId) → void
}
```

### 5.2 Google Drive Implementation (v1)
- Authenticates via service account JSON (`GOOGLE_SERVICE_ACCOUNT_KEY_PATH`)
- Creates folder structure under root folder (`GOOGLE_DRIVE_FOLDER_ID`):
  - `/onlystuff/aadhaar/` — Aadhaar images (restricted to Admin view)
  - `/onlystuff/listings/` — Listing photos
  - `/onlystuff/chat/` — Chat image attachments
  - `/onlystuff/avatars/` — Profile photos (future)
- Files made publicly readable via `permissions.create` (role: reader, type: anyone)
- Returns `https://drive.google.com/uc?export=view&id={fileId}` as the URL

### 5.3 Swap to S3/GCS
Replace `src/services/storage/index.js` singleton with `new S3Storage()` or `new GCSStorage()`. The interface contract (upload/getUrl/delete) stays identical — zero changes to controllers.

### 5.4 File Constraints
- Max size: 10MB per file
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`
- Multer configured with `memoryStorage()` — files never touch disk

---

## 6. Email System

### 6.1 Nodemailer Config
```js
nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
})
```
Gmail app password (16-char) stored in `.env`. Not the account password.

### 6.2 Template Engine
`src/config/mailer.js` — loads HTML template, replaces `{{varName}}` placeholders with `interpolate()`, sends via `transporter.sendMail()`.

### 6.3 Email Templates

| Template | Subject | Trigger |
|----------|---------|---------|
| `welcome` | Welcome to onlyStuff! | Aadhaar approved (first time) |
| `aadhaar_approved` | Your identity is verified — onlyStuff | Admin approves Aadhaar |
| `aadhaar_rejected` | Verification issue — onlyStuff | Admin rejects Aadhaar |
| `community_approved` | Your community is live — onlyStuff | Admin approves community |
| `community_rejected` | Community request update | Admin rejects community |
| `order_placed` | New order received — onlyStuff | Buyer places order (to seller) |
| `order_confirmed` | Order confirmed — onlyStuff | Seller confirms (to buyer) |
| `group_buy_locked` | Group Buy is locked! | Target qty reached (all members + seller) |
| `group_buy_expiring` | Group Buy expiring in 6 hours | 6h before expiry (all members) |
| `group_buy_cancelled` | Group Buy cancelled | Auto-cancel (all members) |
| `booking_request` | New booking request — onlyStuff | Buyer books slot (to provider) |
| `booking_confirmed` | Booking confirmed — onlyStuff | Provider confirms (to buyer) |
| `booking_reminder` | Reminder: booking tomorrow | 24h before slot (both parties) |
| `order_closed` | Order marked as closed | Either party closes (to other party) |
| `dispute_raised` | New dispute raised | Dispute filed (to all admin emails) |
| `review_unlocked` | Leave a review | Order reaches fully_closed |

All templates use inline CSS for email client compatibility. Brand colors: `#FF6B35` (primary), `#F7931E` (gradient end).

---

## 7. Frontend Architecture

### 7.1 Route Map
| Path | Component | Auth |
|------|-----------|------|
| `/login` | Login | Public |
| `/auth/callback` | OAuthCallback | Public |
| `/onboarding/aadhaar` | AadhaarUpload | requireAuth |
| `/onboarding/pending` | PendingVerification | requireAuth |
| `/` | Home (Buy feed) | requireAuth + verified |
| `/search` | Search | requireAuth + verified |
| `/listings/:id` | ListingDetail | requireAuth + verified |
| `/buy/group-buys` | GroupBuys | requireAuth + verified |
| `/buy/orders` | Orders | requireAuth + verified |
| `/sell` | MyListings | requireAuth + verified |
| `/sell/new` | CreateListing | requireAuth + verified |
| `/sell/listings/:id/edit` | EditListing | requireAuth + verified |
| `/sell/orders` | OrdersReceived | requireAuth + verified |
| `/sell/calendar` | ServiceCalendar | requireAuth + verified |
| `/admin` | AdminDashboard | requireAdmin |
| `/admin/aadhaar` | AadhaarQueue | requireAdmin |
| `/admin/communities` | CommunityRequests | requireAdmin |
| `/admin/reports` | Reports | requireAdmin |
| `/admin/users` | UserManagement | requireAdmin |
| `/admin/analytics` | Analytics | requireAdmin |

### 7.2 State Management
- **React Query** — all server state (listings, orders, notifications, etc.)
- **Zustand** — `authStore` (current user, loading), `uiStore` (toasts)
- No Redux. No Context API for data.

### 7.3 Component Structure
```
src/components/
├── ui/          Button, Input, Badge, Avatar, Modal, Spinner, Toast
├── layout/      Navbar (desktop), BottomNav (mobile), PageWrapper
├── listing/     ListingCard, ListingForm, SlabPricingEditor, PhotoUpload
├── order/       OrderCard, OrderTimeline, DisputeForm
├── group-buy/   GroupBuyBanner, GroupBuyCard, GroupBuyProgress
├── booking/     SlotCalendar, BookingCard, RecurrenceSelector
├── chat/        ChatWindow, MessageBubble, ChatList
├── map/         ListingMap, CommunityPin, SearchMapView
├── admin/       AadhaarReviewCard, CommunityRequestCard, ReportCard
└── profile/     ProfileCard, RatingStars, VouchButton
```

### 7.4 Mobile Responsive Strategy
- Mobile-first Tailwind classes
- `BottomNav` visible on mobile (`sm:hidden`), `Navbar` visible on desktop (`hidden sm:flex`)
- Grid layouts: `grid-cols-2 sm:grid-cols-3` for listing cards
- All modals slide up from bottom on mobile (`items-end sm:items-center`)
- Safe area padding for iOS home bar

### 7.5 Socket.io Client
```js
// hooks/useSocket.js
const socket = io(API_URL, { withCredentials: true });
socket.on('connect', () => socket.emit('join:listing', listingId));
socket.on('chat:message', (msg) => queryClient.setQueryData(...));
```

---

## 8. Landing Pages

| File | URL | Content |
|------|-----|---------|
| `index.html` | / | Hero, features, how it works, testimonials, CTA |
| `how-it-works.html` | /how-it-works | Step-by-step buying and selling flows |
| `communities.html` | /communities | All 25 pre-seeded communities grouped by area |
| `sellers.html` | /sellers | Seller value prop, zero commission, features |
| `about.html` | /about | Mission, principles, contact |

All pages share `css/style.css` and `js/main.js`. Brand colors `#FF6B35` / `#F7931E`. Fully responsive. No framework dependency.

---

## 9. Environment Variables

### Backend (`.env`)
```
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
LANDING_URL=http://localhost:3000
DATABASE_URL=<neon connection string>
JWT_SECRET=<64+ char random string>
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
GMAIL_USER=udaykumar199881@gmail.com
GMAIL_APP_PASSWORD=<16-char app password>
EMAIL_FROM=onlyStuff <udaykumar199881@gmail.com>
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google-service-account.json
GOOGLE_DRIVE_FOLDER_ID=<root folder ID>
GOOGLE_MAPS_API_KEY=<Maps API key>
PORTER_API_KEY=replace_when_available
DUNZO_API_KEY=replace_when_available
RAPIDO_API_KEY=replace_when_available
SWIGGY_GENIE_API_KEY=replace_when_available
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=<Maps API key>
VITE_APP_URL=http://localhost:5173
```

---

## 10. Seed Script

`backend/prisma/seed.js` seeds:
1. **Delivery partners** — Porter, Dunzo, Rapido, Swiggy Genie (all disabled until API keys added)
2. **25 communities** — Pre-seeded Hyderabad societies with lat/lng. Uses `upsert` (safe to re-run)
3. **Admin users** — `udaykumar199881@gmail.com`, `poloju.ganeshchary@gmail.com` — role=admin, aadhaarStatus=approved, googleId=seeded placeholder (overwritten on first OAuth login)

**Run:** `cd backend && node prisma/seed.js`

**Note on admin Google ID:** On first Google login, `passport.js` does `findUnique({ where: { googleId } })` — not found (placeholder ID). It then tries `create` but email uniqueness constraint catches it. **Fix needed:** Passport should also check by email, then update the googleId. The seed script uses `seeded_<email>` as a placeholder; the passport.js strategy should be updated to do:
```js
let user = await prisma.user.findFirst({
  where: { OR: [{ googleId: profile.id }, { email }] }
});
if (user && user.googleId !== profile.id) {
  user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } });
}
```
This is already the correct approach — update `src/config/passport.js` accordingly before first deploy.

---

## 11. Security

| Concern | Implementation |
|---------|----------------|
| Auth cookies | `httpOnly: true`, `secure: true` in prod, `sameSite: 'none'` in prod |
| JWT | Signed with 64+ char secret, 7d expiry |
| OAuth CSRF | Passport.js handles `state` parameter automatically |
| Rate limiting | `express-rate-limit`: 20 req/15min on auth, 10 req/15min on uploads, 120 req/min on general API |
| Input sanitisation | Zod validation on all request bodies (wire into controllers as needed) |
| XSS | No dangerouslySetInnerHTML in React; DOMPurify to be added for any user-generated HTML |
| File uploads | `multer` with `memoryStorage`, MIME type checked against whitelist before upload |
| Aadhaar image access | Stored in Google Drive folder accessible only by service account; URLs not exposed in public API; admin-only endpoint serves them |
| SQL injection | Prisma parameterises all queries — no raw SQL |
| CORS | Explicit origin allowlist (`CLIENT_URL`, `LANDING_URL`) |
| Security headers | `helmet()` adds HSTS, X-Frame-Options, X-Content-Type-Options, CSP |
| Admin actions | All logged to `admin_logs` table with timestamp and actor |
| Duplicate Aadhaar | Admin flags duplicates manually in v1; v2 DigiLocker enforces programmatically |

---

## 12. Deployment

### Infrastructure (v1)
| Component | Service | Notes |
|-----------|---------|-------|
| Backend | Railway or Render | Node.js runtime, auto-deploy from `main` branch |
| Frontend | Vercel | Vite project, auto-deploy from `main` branch |
| Landing | Vercel | Separate project pointing to `/landing` directory |
| Database | Neon PostgreSQL | Already provisioned |
| File storage | Google Drive | Service account, managed by admin |

### Production Environment Variables
Update the following for production:
- `NODE_ENV=production`
- `CLIENT_URL=https://app.onlystuff.in`
- `LANDING_URL=https://onlystuff.in`
- `GOOGLE_CALLBACK_URL=https://api.onlystuff.in/auth/google/callback`
- `JWT_SECRET=<strong production secret>`

### Pre-deploy Checklist
1. `npx prisma migrate deploy` against production DB
2. `node prisma/seed.js` to seed admin users and communities
3. Google OAuth: add production callback URL to Google Cloud Console
4. Google Drive: share root folder with service account email
5. Test admin login with both seeded email addresses
6. Test Aadhaar upload → admin approve flow end-to-end
7. Verify email delivery from `udaykumar199881@gmail.com`
