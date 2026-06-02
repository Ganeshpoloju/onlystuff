# Product Requirements Document
## onlyStuff — Hyperlocal Community Commerce Platform
**Version:** 0.4  
**Date:** 2026-06-02  
**Status:** Draft

---

## Table of Contents

1. Vision & Goals
2. Core Principles
3. Users & Roles
4. Onboarding & Identity
5. Community Model
6. Discovery & Search
7. Listings
8. Pricing — MOQ & Slab Model
9. Group Buying
10. Intelligent Service Scheduling
11. Delivery Middleware
12. Trust & Safety
13. Order Lifecycle
14. Chat
15. Notifications
16. Screen Architecture & UX Flows
17. Admin Panel
18. Monetization (Future)
19. Tech Stack
20. Non-Functional Requirements
21. Out of Scope (v1)
22. Open Questions

---

## 1. Vision & Goals

**onlyStuff** is a single web app where residents of Hyderabad apartment communities can buy and sell goods and services with people they share a neighbourhood with — built on verified identity, proximity, and peer trust.

### 1.1 Problem Statement
Existing platforms (OLX, WhatsApp groups, Instagram shops) either lack trust, lack locality, or separate buyer and seller experiences. Community WhatsApp groups have listings but no commerce infrastructure. OLX has listings but no community. onlyStuff merges both.

### 1.2 Goals (v1)
- Get 5 apartment communities onboarded in Hyderabad
- Every registered user is Aadhaar-verified before accessing the platform
- Buyers can discover, negotiate, and transact within their community and beyond
- Sellers can list products and services with MOQ/slab pricing and manage orders
- Group buys enable collective purchasing to unlock better prices
- Service providers can offer bookable time slots with no back-to-back packing

### 1.3 Success Metrics
- Weekly Active Users per community
- Listings created per week
- Group Buy initiation and fill rate
- Transaction volume (P2P, self-reported)
- Avg. distance of transactions (community-internal vs cross-community)
- Service booking completion rate

---

## 2. Core Principles

- **One app, two modes** — same user can buy and sell without switching accounts
- **Verified identity first** — Aadhaar OTP is required before any platform access
- **Community-first discovery** — search always surfaces your community first, then expands outward by distance
- **Trust over volume** — ratings, vouching, and verified identity over anonymous listings
- **Flexible fulfillment** — platform does not mandate a delivery model; it plugs in partners if available and falls back gracefully
- **Monetization-ready** — zero commission at launch, but architecture is designed to support subscriptions, featured listings, ads, and delivery margin later without rework

---

## 3. Users & Roles

| Role | Description | Access |
|------|-------------|--------|
| **Member** | Aadhaar-verified user belonging to an approved community | Buy, sell, chat, review, vouch |
| **Outsider Seller** | Aadhaar-verified user not tied to any community | Sell only; listings are city-wide, ranked by distance to the searching user |
| **Admin** | Platform super-admin (seeded in DB, not self-registerable) | Full moderation, analytics, community approval, user management |

### 3.1 Role Assignment
- Roles are stored in the database
- Admin role is seeded at deploy time — cannot be self-assigned or granted through the app
- A single user can function as both Member (buyer/seller) and Admin — the Admin tab is additive, not a separate account
- Outsider Seller status is auto-assigned if the user's address does not match any approved community at the time of registration

---

## 4. Onboarding & Identity

### 4.1 Registration Flow

```
Enter phone number
  → OTP verification (SMS)
  → Enter name, profile photo (optional)
  → Enter full address (with map pin)
    → System geocodes address
    → Matches to nearest approved community (within X metres)
      → If match found: user is placed in that community (status: Active Member)
      → If no match: user submits community creation request (see Section 5.2)
  → Aadhaar verification (mandatory, blocks all access until complete)
    → Enter Aadhaar number + OTP on registered mobile
    → UIDAI API validates
    → On success: Aadhaar Verified badge, platform unlocks
    → On failure: user cannot proceed, retry allowed
```

### 4.2 Aadhaar Verification

**v1 — Admin-reviewed image upload:**
- User uploads a photo of their Aadhaar card (front + back)
- Images are stored securely, visible only to Admin
- Admin reviews and approves or rejects with a reason
- Until approved: user is in "Pending Verification" state — cannot browse, buy, or sell
- On approval: Aadhaar Verified badge applied, platform unlocks
- On rejection: user notified with reason, can re-upload
- Admin target SLA: verify within 24 hours of upload

**v2 — DigiLocker + OTP (planned):**
- User authenticates via DigiLocker OAuth
- Aadhaar XML fetched directly from UIDAI via DigiLocker
- OTP confirms the user is the document owner
- Instant verification, no Admin involvement
- Aadhaar images from v1 purged upon v2 migration for users who re-verify

**Both versions:**
- One Aadhaar per account — Admin flags duplicate Aadhaar numbers during v1 review; v2 enforces programmatically
- Aadhaar number is masked in the UI (only last 4 digits shown after verification)
- Stored images (v1) encrypted at rest, access-logged

### 4.3 Referral
- Every verified member gets a unique referral link
- Referred user who clicks the link: their community is pre-filled from referrer's community, but they still enter their own address to confirm
- Referral is tracked (for future reward system) but confers no special access in v1
- Referral link does not bypass Aadhaar verification

### 4.4 Profile
- Display name (required)
- Profile photo (optional)
- Bio (optional, max 200 chars)
- Community badge (shown on profile)
- Aadhaar Verified badge
- Rating (buyer + seller separately)
- Vouch count
- Member since date
- Active listings count
- Transaction count (self-reported, from completed orders)

---

## 5. Community Model

### 5.1 What is a Community
- An apartment society, gated community, or residential complex in Hyderabad
- Defined by a name, a geo-polygon or pin + radius, and an address
- Peer-run — there is no community admin role
- Only the platform Admin manages community records

### 5.2 Pre-Seeded Communities
The following well-known Hyderabad apartment communities are pre-loaded into the DB at launch. Users with matching addresses are auto-placed without an Admin approval step.

**Gachibowli / Nanakramguda / Financial District**
- Aparna Sarovar, Nallagandla
- My Home Bhooja, Manikonda
- Prestige High Fields, Gachibowli
- Mantri Serene, Gachibowli
- Lodha Bellezza, Kokapet

**Kondapur / Madhapur / HITEC City**
- Indu Fortune Fields, Kondapur
- Aditya Meadows, Kondapur
- NSL Klassik, Madhapur
- Vasavi Signature, Madhapur

**Manikonda / Puppalaguda**
- My Home Jewel, Manikonda
- Prestige Falcon City, Manikonda
- Aparna Constructions Western Meadows, Puppalaguda

**Kukatpally / KPHB**
- KPHB Colony phases (multiple)
- NCC Urban One, Kukatpally

**Kompally / Medchal**
- Aliens Space Station, Tellapur
- Ramky Towers, Kompally

**Miyapur / Chandanagar**
- Brigade Buena Vista, Miyapur
- Rainbow Vistas Rock Garden, Miyapur

**Bachupally / Nizampet**
- Suchitra Heights, Bachupally
- My Home Avatar, Tellapur

**Banjara Hills / Jubilee Hills**
- Vasavi Rock Gardens, Banjara Hills
- Aparna Cyber Life, Banjara Hills

Additional societies to be added as communities are approved organically.

### 5.3 Community Creation (Organic Growth)
```
User's address doesn't match any existing community
  → User fills:
      - Community name (e.g., "Prestige Lakeside Habitat")
      - Address / pin on map
      - Approximate number of households (optional)
  → Request enters Admin queue
  → Admin reviews:
      - Approves → community added to DB, user becomes first member, user notified
      - Rejects with reason → user notified, can re-submit with corrections
  → Until approved, user is in "Pending Community" state:
      - Can complete profile and Aadhaar verification
      - Cannot browse listings or list items
  → Requests arrive as they come — no threshold required
```

### 5.4 Joining an Existing Community
- System auto-matches on address during registration
- If user moves: can update address → triggers re-matching → if new community, requires Admin approval of the address change (to prevent gaming)

### 5.5 Outsider Sellers
- Users whose address does not map to any community, and who do not submit a community request, are classified as Outsider Sellers
- Their listings are visible city-wide
- In any search, their listings appear after all community-matched listings, ranked by distance to the searching user's community pin
- They cannot initiate or join Group Buys (they are the seller, not the buyer side)
- They can receive and fulfil orders like any other seller

### 5.6 Community Data
Each community record contains:
- Name
- Geo-coordinates (centroid pin)
- Approximate boundary (polygon or radius)
- Approved date
- Member count (live)
- Active listing count (live)
- Status: Pending / Active / Suspended

---

## 6. Discovery & Search

### 6.1 Home Feed
- Displays listings from the user's community first, sorted by recency
- Below community listings: listings from nearest communities, sorted by distance
- Feed is paginated (infinite scroll)
- Each listing card shows: photo, title, price (starting price for slabs), distance, seller name, seller rating, listing type (Product/Service), Group Buy indicator if active

### 6.2 Search
- Full-text search on title and description
- Results ranked:
  1. Same community, text relevance
  2. Nearby communities, text relevance (sorted by distance)
  3. City-wide (outsiders and distant communities), text relevance + distance

### 6.3 Filters
| Filter | Options |
|--------|---------|
| Listing type | Products / Services / Both |
| Category | Multi-select from taxonomy |
| Price range | Min–Max slider |
| MOQ | Has MOQ / No MOQ |
| Condition | New / Used / Refurbished (Products only) |
| Seller rating | 3+ / 4+ / 4.5+ stars |
| Distance | Radius slider — default 5km, user adjustable (1km → 50km → city-wide) |
| Availability | Available now / Has active Group Buy |
| Fulfillment | Pickup / Delivery available |

### 6.4 Map View
- Toggle between list view and map view in search results
- Map pins represent listings
- Cluster pins when zoomed out
- Clicking a pin shows a listing card preview
- User's community is highlighted on the map

### 6.5 Categories (Taxonomy — Seeded by Admin)
**Products:** Electronics, Furniture, Kitchen & Appliances, Books & Stationery, Clothing & Accessories, Toys & Games, Sports & Fitness, Home Decor, Groceries & Produce, Plants & Gardening, Baby & Kids, Vehicles & Accessories, Other

**Services:** Home Repairs, Cleaning, Tutoring & Coaching, Fitness & Wellness, Pet Care, Beauty & Grooming, Photography, Music & Arts, Transport & Moving, IT & Tech Support, Other

---

## 7. Listings

### 7.1 Product Listing Fields
| Field | Type | Required |
|-------|------|----------|
| Title | Text (max 100 chars) | Yes |
| Description | Rich text (max 2000 chars) | Yes |
| Category | Select from taxonomy | Yes |
| Photos | Upload, 1–10 images | Yes (min 1) |
| Condition | New / Used / Refurbished | Yes |
| Pricing model | Fixed or Slab | Yes |
| MOQ | Number | No |
| Stock quantity | Number | Yes |
| Fulfillment | Pickup / Delivery / Both | Yes |
| Pickup address | Map pin (defaults to user's address) | If Pickup selected |
| Tags | Free text, up to 5 | No |
| Listing visibility | Community only / Everyone | Yes |

### 7.2 Service Listing Fields
| Field | Type | Required |
|-------|------|----------|
| Title | Text (max 100 chars) | Yes |
| Description | Rich text (max 2000 chars) | Yes |
| Category | Select from taxonomy | Yes |
| Photos | Upload, 1–10 images | Yes (min 1) |
| Pricing model | Fixed or Slab (per session/hour) | Yes |
| Slot duration | Minutes (15, 30, 45, 60, 90, 120, custom) | Yes |
| Buffer time between slots | Minutes (0, 15, 30, 45, 60, custom) | Yes |
| Working days | Multi-select (Mon–Sun) | Yes |
| Working hours | Start time – End time | Yes |
| Service area | Community only / Radius (X km) | Yes |
| Max concurrent bookings | Number (default 1) | Yes |
| Tags | Free text, up to 5 | No |

### 7.3 Listing States
| State | Description |
|-------|-------------|
| Draft | Saved but not published |
| Active | Live and discoverable |
| Paused | Hidden by seller temporarily |
| Out of Stock | Auto-set when quantity reaches 0 (Products) |
| Pending Review | Flagged, awaiting Admin action |
| Removed | Taken down by Admin |
| Expired | Inactive for 90 days (soft delete, seller can reactivate) |

### 7.4 Photos
- Min: 1, Max: 10 per listing
- Accepted formats: JPG, PNG, WEBP
- Max file size: 10MB per image
- Platform auto-compresses and serves optimised versions (thumbnails for cards, full-res for detail view)
- First photo is the cover image (seller can reorder)

### 7.5 Listing Visibility
- **Community only** — listing is only visible to members of the seller's community
- **Everyone** — listing is visible city-wide (default for Outsider Sellers, optional for Members)

---

## 8. Pricing — MOQ & Slab Model

### 8.1 Fixed Pricing
- Single price per unit (or per service session)
- No MOQ — buyer can order any quantity ≥ 1

### 8.2 Slab Pricing
Seller defines up to 5 pricing tiers. Each tier:
- **From qty** — minimum quantity to activate this tier
- **To qty** — maximum quantity for this tier (leave blank = "and above")
- **Price per unit** — price at this tier

**Example:**
| Tier | Qty Range | Price/unit |
|------|-----------|------------|
| 1 | 1–5 | ₹100 |
| 2 | 6–10 | ₹85 |
| 3 | 11+ | ₹70 |

- Tiers must be contiguous — no gaps in quantity ranges
- Price must decrease (or stay same) as quantity increases — system validates this

### 8.3 MOQ (Minimum Order Quantity)
- Seller sets a minimum quantity that must be ordered in a single transaction
- MOQ is independent of slabs — a seller can have MOQ = 6 with the slab table above, meaning the ₹100/unit tier is inaccessible individually
- If a buyer tries to order below MOQ, the cart blocks the order and prompts: "This seller requires a minimum of X units. Start a Group Buy to meet the MOQ with other buyers."

### 8.4 Price Display on Listing Card
- Fixed: show the price
- Slab with MOQ: show "From ₹X / unit (MOQ: Y)"
- Slab without MOQ: show "From ₹X / unit"

---

## 9. Group Buying

### 9.1 Purpose
Allow multiple buyers to pool quantities to meet an MOQ or unlock a better price tier.

### 9.2 Initiating a Group Buy
- Any verified member can initiate a Group Buy on any active product listing
- Initiator sets:
  - Target quantity (must be ≥ listing's MOQ, if set)
  - Target price tier (system shows which slab the target quantity would unlock)
- System creates a Group Buy with a 48-hour window

### 9.3 Joining a Group Buy
- Group Buy is discoverable on the listing page (shown as a banner)
- Any verified member can join, declaring their individual quantity
- Total committed quantity is shown live: "32 of 50 units committed"
- A user can only be in one active Group Buy per listing at a time

### 9.4 Group Buy States & Transitions

```
Open (0 – 48 hrs)
  → Target reached before deadline
      → Locked (order placed with seller, seller notified)
  → 48 hrs passed, target not reached
      → Initiator extends once (+ 24 hrs) OR auto-cancels
  → Extended (0 – 24 hrs)
      → Target reached → Locked
      → 24 hrs passed → Auto-cancelled
  → Locked
      → Seller confirms fulfilment → Completed
      → Seller cancels → Cancelled (all members notified, affects seller reliability score)
```

### 9.5 Multiple Group Buys
- Multiple Group Buys can exist simultaneously on the same listing
- Seller must fulfil each independently
- Each Group Buy has its own quantity tracking

### 9.6 Notifications During Group Buy
- Member joins → all existing members notified
- 80% of target reached → all members notified
- Target reached → all members notified, seller notified
- 6 hours before expiry (if target not met) → all members + initiator notified
- Auto-cancel → all members notified with reason

### 9.7 Post-Lock
- Quantities are frozen — no additions, no withdrawals
- Members coordinate payment and fulfilment directly with seller (P2P)
- In Phase 2 (Razorpay), payment is collected in-app and held in escrow until fulfilment

---

## 10. Intelligent Service Scheduling

### 10.1 Slot Generation Logic
System generates bookable slots from:
1. Provider's working days and hours
2. Slot duration (set per service listing)
3. Buffer time (set per service listing — enforced, cannot be overridden by the provider)
4. Existing confirmed bookings

**Formula per day:**
```
Slots = []
current_time = working_hours.start
while current_time + slot_duration ≤ working_hours.end:
    if slot at current_time is not booked:
        Slots.append(current_time)
    current_time += slot_duration + buffer_time
```

**Example:** Working 9am–5pm, 60-min slots, 30-min buffer:
- Slots at: 9:00, 10:30, 12:00, 13:30, 15:00, 16:30 → 6 slots/day

### 10.2 Calendar UX
- Buyer sees a month/week calendar on the service listing page
- Available slots: white/green
- Booked slots: grey (no detail shown)
- Buffer time: shown as a visual gap (not selectable)
- Past slots: dimmed

### 10.3 Booking Flow
```
Buyer selects slot
  → Booking request sent to provider
  → Provider receives notification: "New booking request for [slot]. Confirm within 2 hours."
  → Provider confirms
      → Booking confirmed, both parties notified, slot locked
  → Provider declines (with mandatory reason)
      → Buyer notified with reason, slot reopens
  → 2 hours pass with no action
      → Auto-declined, buyer notified, slot reopens
```

### 10.4 Recurring Bookings
- A buyer can set a booking to recur: Weekly, Bi-weekly, or Monthly
- Recurrence generates future bookings automatically for up to 3 months ahead
- Each recurrence is a separate booking instance — cancelling one does not cancel the series
- Provider can cancel the entire series or individual instances
- Buyer can end the series at any time (cancels all future unconfirmed instances)
- Confirmed future instances require the normal cancellation flow

### 10.5 Reschedule
- **Buyer reschedule:** allowed up to 4 hours before the slot — triggers new confirmation request from provider
- **Provider reschedule:** allowed at any time — buyer must confirm the new slot
- Max 2 reschedules per booking (third cancels the booking)

### 10.6 Cancellation
- **Buyer cancels:** allowed up to 4 hours before slot, no penalty in v1
- **Provider cancels:** allowed, but mandatory reason required. Each provider cancellation is counted and visible on their reliability score. 3+ cancellations in 30 days triggers Admin review.

### 10.7 Provider Availability Override
- Provider can block specific dates/times (e.g., holidays, unavailable days)
- Blocked times are removed from the bookable calendar immediately
- If a slot already has a confirmed booking when provider tries to block it: system warns and requires provider to cancel that booking first

---

## 11. Delivery Middleware

### 11.1 Design Philosophy
onlyStuff does not own delivery. It provides a pluggable adapter layer that queries available third-party delivery partners and presents options to the buyer.

### 11.2 Supported Partners (at launch, if API access available)
- Porter
- Dunzo (if operational)
- Swiggy Genie
- Rapido (bike delivery)

Partners are configured by Admin — each has an enabled/disabled toggle and API credentials stored securely.

### 11.3 Checkout Delivery Flow
```
Buyer proceeds to checkout
  → If listing supports Delivery:
      → Platform queries all enabled delivery partner APIs
        (pickup: seller's address, drop: buyer's address)
      → If ≥ 1 partner responds:
          → Show options: Partner name, vehicle type, ETA, price
          → Buyer selects partner → redirected to partner's app/flow OR
            partner API handles booking in-background
      → If 0 partners respond or no coverage:
          → Show: "No delivery partners available for this route.
                   Contact the seller to arrange delivery or self-pickup."
          → Buyer can still proceed with pickup or chat with seller
```

### 11.4 Delivery Fee
- Buyer pays delivery fee directly to the delivery partner
- onlyStuff takes no margin on delivery in v1
- Delivery fee is shown at checkout for transparency — it is an estimate (final fare may vary by partner)

### 11.5 Fulfillment Options (always buyer's choice)
| Option | Description |
|--------|-------------|
| Self-pickup | Buyer collects from seller's pickup address |
| Delivery via partner | Platform queries partners, buyer selects |
| Arrange with seller | Buyer and seller agree via chat — no platform involvement |

---

## 12. Trust & Safety

### 12.1 Ratings System
- After a transaction is marked complete, both parties can rate each other
- Rating: 1–5 stars + optional text review (max 500 chars)
- Ratings are public on the user's profile
- Seller rating and Buyer rating are tracked separately
- Minimum 3 ratings before a star average is displayed (below 3: shows "New")
- Seller can respond to a review (once, max 300 chars)

### 12.2 Reliability Score (Internal)
Computed score used for ranking and Admin alerts. Inputs:
- Rating average
- Transaction completion rate (orders accepted vs fulfilled)
- Provider cancellation count (services)
- Number of times reported
- Vouches received vs revoked

Not shown to users directly in v1 — used internally by the platform for ranking and Admin dashboards.

### 12.3 Community Vouching
- Any community member can vouch for another user: "I personally know [name] from [community]"
- Vouch is public on the vouched user's profile
- A vouch can be revoked by the voucher at any time
- If a user is banned by Admin: all vouches they gave are automatically flagged (voucher's credibility is noted, not penalised automatically in v1)
- Vouch count is visible on listing cards for sellers

### 12.4 Identity Verification Badges
| Badge | Criteria |
|-------|----------|
| Phone Verified | OTP at signup |
| Aadhaar Verified | UIDAI OTP passed (all users) |
| Community Member | Address matched to approved community |

### 12.5 Reporting
- Any user can report any listing or user profile
- Report reasons: Fake/Misleading, Inappropriate content, Spam, Fraud, Other
- On 3 reports for same listing: auto-hidden pending Admin review, seller notified
- On 5 reports for same user: Admin flagged for review (user not auto-banned)
- Admin sees full report history per listing and per user

### 12.6 Prohibited Content
- Weapons, drugs, counterfeit goods
- Adult content
- Services requiring professional licensing without disclosure (medical, legal)
- Real estate (scope exclusion)
- Live animals

Sellers are shown a prohibited content policy at listing creation. Violation = immediate removal + Admin review of account.

---

## 13. Order Lifecycle

### 13.1 Order States

| State | Description |
|-------|-------------|
| Placed | Order submitted by buyer, awaiting seller acknowledgement |
| Confirmed | Seller acknowledged the order |
| In Progress | Fulfillment underway (delivery dispatched, or service slot upcoming) |
| Closed | Either party has marked the order done — dispute window open |
| Disputed | Other party raised a dispute within 48h — in Admin queue |
| Fully Closed | 48h passed with no dispute, or Admin resolved dispute — reviews now unlocked |
| Cancelled | Cancelled before fulfilment by either party |

### 13.2 Closing an Order
- Either the buyer or the seller can mark an order as **Closed** at any time after it is Confirmed
- When one party closes: status changes to Closed immediately, the other party is notified
- The other party has **48 hours** to raise a Dispute
- If no dispute is raised in 48 hours → order automatically moves to **Fully Closed**
- If a dispute is raised → status changes to **Disputed**, enters Admin queue

### 13.3 Disputes
- Dispute requires a mandatory reason (text, max 500 chars) and optional photos
- Admin reviews the dispute: can resolve in favour of buyer, seller, or mark as inconclusive
- Admin resolution moves the order to Fully Closed regardless of outcome
- Dispute outcome is recorded on the order but does not automatically affect ratings (Admin may take separate action on the user)
- In v1 (P2P payments): disputes are informational — platform cannot force a refund
- In v2 (Razorpay escrow): dispute outcome can trigger refund or release of held funds

### 13.4 Reviews
- Both buyer and seller can leave a review **only after** the order is Fully Closed
- Review window: 14 days from Fully Closed date — after that, the option expires
- One review per party per order
- Seller can respond to the buyer's review once (max 300 chars)
- Reviews are permanent — only Admin can remove (in case of abuse)

---

## 14. Chat

### 13.1 Scope
- Chat is always initiated from a listing — every conversation is tied to a listing
- No cold DMs between users outside a listing context
- One conversation thread per (buyer, seller, listing) tuple

### 13.2 Features
- Text messages
- Image sharing (up to 5 images per message)
- Delivery status: Sent / Delivered / Read
- Typing indicator
- Message timestamps

### 13.3 Chat in Context of Group Buys
- Once a Group Buy locks, the initiator can open a group chat thread with the seller
- Group chat includes: initiator + all Group Buy members + seller
- Purpose: coordinate payment and pickup/delivery logistics

### 13.4 Data & Privacy
- Chat history retained for 90 days from last message
- Users can delete their side of a conversation (messages soft-deleted)
- Admin can access any chat thread as part of a dispute investigation

### 13.5 Chat Inbox
- Unified inbox (not split by Buy/Sell mode)
- Conversations sorted by last message time
- Unread count badge on inbox icon
- Archived conversations (user can archive, not delete)

---

## 14. Notifications

### 14.1 Notification Types

| Trigger | Recipient | Channel |
|---------|-----------|---------|
| New message | Receiver | In-app + Push (Web Push) |
| Order placed | Seller | In-app + Push |
| Order confirmed | Buyer | In-app + Push |
| Group Buy: member joined | All existing members | In-app |
| Group Buy: 80% filled | All members | In-app + Push |
| Group Buy: locked | All members + Seller | In-app + Push |
| Group Buy: expiring in 6h | All members + Initiator | In-app + Push |
| Group Buy: auto-cancelled | All members | In-app + Push |
| Service booking request | Provider | In-app + Push |
| Booking confirmed | Buyer | In-app + Push |
| Booking declined | Buyer | In-app + Push |
| Booking reminder (24h before) | Buyer + Provider | In-app + Push |
| Review received | Seller/Buyer | In-app |
| Community request approved/rejected | User | In-app + SMS |
| Listing reported (auto-hidden) | Seller | In-app |
| Account warning/ban | User | In-app + SMS |

### 14.2 Notification Preferences
- Users can toggle Push notifications on/off per category
- SMS is reserved for critical actions only (community approval, account actions)
- In-app notifications always enabled (no opt-out)

---

## 15. Screen Architecture & UX Flows

### 15.1 Navigation Structure

```
Bottom Navigation (always visible):
  [Buy]  [Sell]  [Admin — only for Admin role]

Buy Tab:
  ├── Home Feed
  ├── Search (with map toggle)
  ├── Listing Detail
  │     ├── Seller Profile
  │     ├── Group Buy panel
  │     └── Chat with Seller
  ├── Group Buys (active group buys user has joined)
  ├── Orders (purchase history)
  ├── Chat Inbox
  └── My Profile

Sell Tab:
  ├── My Listings
  │     ├── Create Listing (Product / Service)
  │     └── Edit / Pause / Delete Listing
  ├── Orders Received
  ├── Group Buys (on my listings)
  ├── Service Calendar
  ├── Chat Inbox (shared with Buy tab inbox)
  └── Seller Profile Preview

Admin Tab:
  ├── Reports Queue
  ├── Community Approvals
  ├── User Management
  ├── Listing Moderation
  └── Analytics Dashboard
```

### 15.2 Key UX Flows

**Flow 1: New User Registration**
1. Enter phone → OTP
2. Enter name + address → map pin confirmation
3. Community matched or creation request submitted
4. Aadhaar number → OTP → verified
5. If community pending: holding screen with status
6. If community approved: home feed unlocks

**Flow 2: Buying a Product (Fixed Price)**
1. Browse feed / search
2. Open listing detail
3. Select quantity (validates against MOQ)
4. Proceed to checkout → choose fulfillment (pickup / delivery / arrange)
5. If delivery: see partner options → select
6. Order placed → seller notified
7. Coordinate payment and delivery via chat or directly
8. Either party marks order as Closed
9. Order status → Closed; other party notified
10. Other party can Dispute within 48 hours (goes to Admin queue)
11. If no dispute in 48 hours → order Fully Closed
12. Both parties can now leave a review

**Flow 3: Starting a Group Buy**
1. Open listing detail
2. Quantity below MOQ → prompted with Group Buy CTA
3. Set target quantity → system shows price tier unlocked
4. Group Buy created and shared link available
5. Others join → notifications sent
6. Target hit → Group Buy locks
7. Seller fulfils → either party marks Closed → dispute window → Fully Closed → all members and seller can rate

**Flow 4: Booking a Service**
1. Open service listing
2. View calendar → select available slot
3. Submit booking request
4. Provider confirms (within 2 hrs)
5. Booking confirmed → reminder 24h before
6. Service delivered → either party marks Closed → 48h dispute window → Fully Closed → both can rate

**Flow 5: Creating a Slab-Priced Listing**
1. Go to Sell tab → Create Listing → Product
2. Fill title, description, photos, category, condition
3. Choose pricing: Slab
4. Add up to 5 tiers (from qty, to qty, price per unit)
5. Set MOQ (optional — can be same as first tier's from)
6. Set stock, fulfillment preference
7. Publish

### 15.3 Empty States
- New community with no listings: "Be the first to list something in [Community Name]"
- No search results: "Nothing nearby. Try expanding your search or check back later."
- No Group Buys available: "No active group buys. Start one on any listing."
- Seller with no orders: "No orders yet. Share your listing to get started."

---

## 16. Admin Panel

### 16.1 Access
- Third tab in the same app, visible only to seeded Admin role
- Admin users still have a normal member profile — they can buy and sell
- Admin tab is additive, not a separate login

### 16.2 Reports Queue
- Lists all reported listings and users sorted by report count
- Each item shows: what was reported, who reported, report reason, count
- Actions: Dismiss, Warn User, Remove Listing, Ban User
- Dismissed reports are archived (not deleted) for audit trail

### 16.3 Community Approvals
- Queue of community creation requests
- Each request shows: user name, address, map pin, proposed community name, household count
- Admin can: Approve (community created, user notified) / Reject with reason (user notified, can resubmit)
- Admin can also directly create communities (for pre-known societies)
- Admin can merge duplicate communities, rename, or suspend

### 16.4 User Management
- Search users by name, phone, Aadhaar last 4
- View full profile: community, listings, ratings, reports received, Aadhaar verification status
- Actions: Verify manually, Warn (sends in-app + SMS), Suspend (temporary, set duration), Ban (permanent)
- Ban removes all active listings and prevents re-registration with same Aadhaar

### 16.5 Listing Moderation
- Review reported / auto-hidden listings
- Full listing view with all photos
- Actions: Approve (restore visibility), Remove, Warn Seller

### 16.6 Analytics Dashboard
| Metric | Description |
|--------|-------------|
| DAU / WAU / MAU | Active users by day/week/month |
| New registrations | Per day, with Aadhaar completion rate |
| Listings created | Per day, split by product/service |
| Orders placed | Per day, estimated GMV |
| Group Buys | Created / Filled / Auto-cancelled per week |
| Service bookings | Created / Confirmed / Cancelled per week |
| Top communities | By active users, listings, transaction volume |
| Delivery partner usage | Queries vs bookings per partner |
| Reports | Open / Resolved per week |
| Community requests | Pending / Approved / Rejected per week |

### 16.7 Seeded Data Management
- Category taxonomy (add, rename, disable categories)
- Delivery partner config (enable/disable partners, API key management)
- Platform-level settings (auto-hide threshold, Group Buy window duration, etc.)

---

## 17. Monetization (Future — Not in v1)

No fees, no commissions, no subscriptions in v1. Architecture must not prevent these.

| Model | Description | Architecture Requirement |
|-------|-------------|--------------------------|
| Seller subscription | Monthly/annual plan unlocking premium features (more photos, featured slots, slab tiers) | User has a `plan` field; features check plan level |
| Featured listings | Sellers pay to appear at top of search results | Listings have a `boost_until` timestamp field |
| Delivery margin | Platform takes X% on delivery fee | Delivery pricing goes through platform layer, not direct to partner |
| Ads / Promoted listings | Outsider sellers pay to target specific communities | Listings have a `promoted_communities` array |
| Transaction fee | Small % on in-app payments (Phase 2 Razorpay) | Payment flow routes through platform |

---

## 18. Tech Stack (Recommended)

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js 14 (App Router) | Web-first, SSR for SEO, map embedding, strong ecosystem |
| UI | Tailwind CSS + shadcn/ui | Fast to build, accessible components |
| Backend | Node.js + NestJS | TypeScript across stack, modular, scalable |
| Database | PostgreSQL 15 + PostGIS | Geospatial queries, community proximity matching |
| Cache | Redis | Session store, real-time counters, notification queues |
| Maps | Google Maps API | Geocoding, distance matrix, place search in Hyderabad |
| Auth | Twilio Verify (OTP) | SMS OTP for phone + Aadhaar OTP flow |
| File storage | Cloudflare R2 | Cheap object storage, CDN-native |
| Image processing | Sharp (Node) or Cloudflare Images | Resize/compress on upload |
| Real-time chat | Socket.io | P2P chat, typing indicators, read receipts |
| Push notifications | Web Push API (VAPID) | Browser-native, no app store dependency |
| Payments | Razorpay (Phase 2) | UPI, cards, wallets — India-native |
| Delivery APIs | Porter, Dunzo, Rapido (pluggable adapters) | Abstract interface, toggle per partner |
| Aadhaar verification | UIDAI Sandbox → Production API | OTP-based, no Aadhaar data stored |
| Hosting | Railway / Render (initial) → AWS/GCP (scale) | Low ops overhead at launch |
| CI/CD | GitHub Actions | Automated tests + deploy |

---

## 19. Non-Functional Requirements

### 19.1 Performance
- Home feed: first meaningful paint < 2s on 4G
- Search results: < 1s for community-scoped queries
- Map view: tiles load within 1s on average connection
- Chat: message delivery < 500ms on same network

### 19.2 Scale (v1 targets)
- 10 communities, ~5,000 users
- 500 concurrent active users
- 50,000 listings in DB

### 19.3 Security
- All API routes authenticated (JWT)
- Aadhaar number never stored in plaintext — only verification token
- Phone number stored hashed, shown only to the user themselves
- Rate limiting on OTP endpoints
- Input sanitisation on all listing fields (prevent XSS)
- Image uploads scanned for EXIF data stripping (location privacy)
- Admin actions logged with timestamp and admin user ID

### 19.4 Availability
- Target: 99.5% uptime (3.6 hrs downtime/month acceptable at launch)
- Scheduled maintenance in off-peak hours (2am–5am IST)

### 19.5 Data Retention
- Chat messages: 90 days from last message in thread
- Deleted listings: soft-deleted, purged after 180 days
- Banned user data: retained for 2 years for fraud prevention
- Aadhaar verification tokens: retained as long as account is active

---

## 20. Out of Scope (v1)

- Mobile apps (iOS / Android)
- In-app payments / escrow (Phase 2)
- Food / restaurant ordering
- Real estate
- Auction / bidding on listings
- Multi-city expansion (Hyderabad only for v1)
- Subscription billing / premium plans
- Bulk seller tools (CSV import, inventory sync)
- API for third-party integrations
- Loyalty / rewards program (referrals tracked but no rewards in v1)

---

## 21. Open Questions

No blocking open questions remain for the PRD. All decisions are locked.

**Resolved:**
- Aadhaar v1: Admin-reviewed image upload (24hr SLA). v2: DigiLocker + OTP.
- Communities: pre-seeded ~25 known Hyderabad societies. New ones approved organically, no threshold.
- Nearby default: 5km radius, user-adjustable slider from 1km to city-wide.
- No fee for outsider sellers targeting communities in v1.
- Landing page: designed as part of the TRD phase.
- Recurring bookings: supported in v1 (weekly / bi-weekly / monthly, up to 3 months ahead).
- Order closing: either party can mark Closed → 48h dispute window → Fully Closed if no dispute.
- Reviews: unlocked only after order reaches Fully Closed state, 14-day window to leave one.
