# ConsultBook - Your Gateway to Expert Wisdom

> **Connect with world-class experts. Learn. Grow. Transform.**

ConsultBook is a full-stack SaaS platform that makes it easy for experts to share their knowledge and for seekers to find exactly who they need. Think of it as a sophisticated marketplace where knowledge becomes a currency and connections matter.

---

## What Makes ConsultBook Different?

### **For Knowledge Seekers**
- **Find Your Expert** - Search through verified professionals by specialty, location, price, and availability
- **Book Instantly** - Check real-time availability and secure your session in seconds
- **Learn Your Way** - Choose between 1-on-1 consultations, group masterclasses, or self-paced digital products
- **Connect Easily** - Message experts directly before booking, ask questions, and build relationships

### **For Experts & Consultants**
- **Monetize Your Knowledge** - Set your rates, manage your schedule, and earn from your expertise
- **Build Your Presence** - Create a professional profile showcasing your credentials, portfolio, and reviews
- **Manage Everything** - Dashboard for bookings, earnings, workshop creation, and client communication
- **Grow Your Business** - Built-in payment processing, analytics, and automated workflows

### **For Platform Administrators**
- **Verify Quality** - Review consultant qualifications, certifications, and credentials
- **Monitor Activity** - Track platform health, user engagement, and transaction metrics
- **Manage Content** - Approve workshops, moderate reviews, and maintain platform integrity

---

## Core Features

### Smart Expert Discovery
Your one-stop shop for finding the right consultant
- **Lightning-Fast Search** - Filter by expertise, location, rates, and consultation mode with instant results
- **Rich Profiles** - See qualifications, certifications, portfolio items, verified reviews, and social links
- **Verified Reviews** - Transparent 5-star rating system with verified reviewer badges
- **Command Search** - Press `Cmd+K` to summon a universal search interface and navigate instantly

### Intelligent Scheduling System
Never miss a meeting or double-book again
- **Timezone Support** - Automatic timezone conversion ensures both parties are on the same page
- **Flexible Availability** - Consultants define weekly availability with custom time slots
- **Multi-Mode Support** - Video calls, audio-only, or in-person consultations
- **Smart Notifications** - Automated reminders, confirmations, and status updates for both parties
- **Appointment Lifecycle** - Pending → Confirmed → In-Progress → Completed → Reviewed

### Live Workshops & Masterclasses
Scale your impact beyond 1-on-1 sessions
- **Event Management** - Create, schedule, and publish group learning sessions
- **Ticketing & Capacity** - Set pricing, manage seat reservations, and control attendance
- **Resource Distribution** - Automatically deliver materials, recordings, and resources to attendees
- **Revenue Tracking** - See earnings per workshop and manage group pricing

### Real-Time Messaging Hub
Build relationships that extend beyond booking
- **Integrated Chat** - Message consultants before committing, ask questions, and get clarity
- **File Sharing** - Share documents, resources, and session notes directly in chat
- **Instant Notifications** - Never miss an important message or booking request
- **Media Support** - Exchange images, links, and attachments seamlessly

### Enterprise-Grade Payments
Secure, fast, and fair for everyone (Powered by Stripe)
- **Bank-Level Security** - End-to-end encryption with PCI DSS compliance
- **Smart Wallet System** - Track earnings, refunds, and transaction history
- **Global Reach** - Multi-currency support for international transactions
- **Instant Payouts** - Consultants withdraw earnings directly to their bank accounts
- **Transparent Reporting** - Detailed breakdowns of commissions, fees, and net earnings

### Role-Based Dashboards
Tailored experiences for every user type

#### **Client Dashboard**
- Your upcoming sessions at a glance
- Purchase history and digital products
- Favorite consultants and specialists
- Performance metrics and learning progress

#### **Consultant Dashboard**
- Booking requests and appointment calendar
- Earnings overview and monthly analytics
- Workshop management and performance
- Profile editing and certification uploads
- Payment history and payout schedule

#### **Admin Dashboard**
- User verification and approval workflows
- Payment monitoring and dispute resolution
- Platform analytics and health metrics
- Content moderation and compliance

---

## Platform Screenshots

See ConsultBook in action:

| | |
|:-------------------------:|:-------------------------:|
| **Landing Page** | **My Sessions** |
| ![Landing](/public/landing.jpeg) | ![Sessions](/public/sessions.jpeg) |
| **Library & Products** | **Consultant Profiles** |
| ![Library](/public/library.jpeg) | ![Profile](/public/consultants.jpeg) |

---

## How Everything Fits Together

### **The Booking Flow** (From Search to Session)
```
User browsing marketplace 
    ↓
Finds consultant via search/filter
    ↓
Views profile with reviews & credentials
    ↓
Messages consultant to ask questions
    ↓
Books available time slot
    ↓
Payment processed securely
    ↓
Appointment confirmed (both get notifications)
    ↓
Pre-session reminders sent
    ↓
Session happens (video/audio/in-person)
    ↓
Both can leave reviews & ratings
    ↓
Consultant gets paid
```

### **The Consultant Onboarding Flow** (Becoming Verified)
```
Consultant registers
    ↓
Uploads qualifications & certifications
    ↓
Admin reviews credentials
    ↓
Either approved or feedback requested
    ↓
Profile published to marketplace
    ↓
Can start accepting bookings
    ↓
Builds reputation through reviews
```

### **The Payment Flow** (Money Moves Safely)
```
Client books appointment
    ↓
Securely enters payment info (Stripe)
    ↓
Funds held in escrow by platform
    ↓
Session completed
    ↓
Client can leave review/request refund
    ↓
If no dispute, consultant gets paid
    ↓
Consultant withdraws to bank account
```

---

## Technology Stack

Built on proven, modern technologies that scale:

| Layer | Technology | Why We Chose It |
|-------|-----------|-----------------|
| **Frontend** | Next.js 15 + React 19 | Server Components for performance, seamless SSR |
| **Language** | TypeScript (Strict) | Type safety catches bugs early |
| **Styling** | Tailwind CSS + Shadcn UI | Rapid development + beautiful components |
| **Database** | PostgreSQL (Neon) | Reliable, serverless, scales with us |
| **Database Access** | Drizzle ORM | Type-safe queries, minimal overhead |
| **Auth** | Firebase | Battle-tested, secure auth at scale |
| **State Management** | React Hooks + Context | Simple, no extra dependencies |
| **Server Logic** | Next.js Server Actions | Move computation to the edge |
| **Real-Time Updates** | Server-Sent Events (SSE) | Lightweight notifications |
| **Forms** | React Hook Form + Zod | Efficient, validated data entry |
| **Payments** | Stripe API | Industry standard for payments |
| **Animations** | Framer Motion | Smooth, performant UI transitions |

---

## System Architecture

### Database Schema Highlights

The system is built around a few key data models:

- **Users** - Base profile for clients, consultants, and admins
- **Consultant Profiles** - Extended info: bio, rates, specializations, certifications
- **Consultant Schedules** - Weekly availability with time slots per consultant
- **Appointments** - The heart of the platform: who's meeting with whom, when, and for what
- **Workshops** - Group learning events with pricing and capacity management
- **Messages** - Real-time chat between users
- **Payments & Transactions** - All money movements with Stripe integration
- **Reviews & Ratings** - Verified feedback and reputation system

```
┌─────────────────────────────────────┐
│          USERS                      │
│  (clients, consultants, admins)     │
└────────────┬────────────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
    ▼                   ▼
CONSULTANT        APPOINTMENTS
PROFILES              │
    │            ┌────┴────┐
    │            ▼         ▼
    │        MESSAGES   PAYMENTS
    │            │         │
    │            ▼         ▼
CERTIFICATIONS  REVIEWS  TRANSACTIONS
    │
    ▼
SCHEDULES
```

---

## Key Technical Achievements

### **1. Bulletproof Scheduling System**
The trickiest part: ensuring consultants never get double-booked while supporting timezones across the globe. Our solution:
- Immutable schedule blocks with collision detection
- Timezone-aware calculations using `date-fns`
- Real-time availability status updates

### **2. Ultra-Fast Performance**
With thousands of consultants and appointments, speed matters:
- Server Components reduce client bundle size by ~40%
- Server Actions move expensive logic off the client
- Database queries optimized with indexes and selective field loading
- Strategic use of caching reduces API calls

### **3. Unified Search**
Finding consultants across multiple dimensions (specialty, location, price, availability):
- Indexed full-text search on consultant profiles
- Multi-faceted filtering with real-time result counts
- Instant autocomplete with debouncing
- Global command palette (`Cmd+K`) for power users

### **4. Secure Payment Handling**
Managing real money safely:
- Private Stripe API keys never exposed to frontend
- Payment verification on both client and server
- Webhook handling for asynchronous payment events
- Dispute resolution workflow for chargebacks

### **5. Admin Approval Workflow**
Keeping the platform trustworthy:
- Consultant credential verification before publishing
- Document upload and thumbnail generation
- Batch approval/rejection with customizable feedback
- Audit trail of all approvals and rejections

---

## Project Structure

```
ConsultBook/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions (18+ modules)
│   │   ├── admin.ts              # Admin-only operations
│   │   ├── appointments.ts       # Booking logic
│   │   ├── payments.ts           # Stripe integration
│   │   ├── consultants.ts        # Profile management
│   │   ├── messages.ts           # Chat operations
│   │   ├── reviews.ts            # Rating system
│   │   ├── workshops.ts          # Event management
│   │   └── [10+ more]            # Other business logic
│   │
│   ├── dashboard/                # Role-based dashboards
│   │   ├── admin/                # Admin console
│   │   ├── consultant/           # Expert workspace
│   │   └── client/               # Learner dashboard
│   │
│   ├── (pages)/                  # Public pages
│   │   ├── book-consultant/      # Booking interface
│   │   ├── consultant/           # Profile viewing
│   │   ├── library/              # Course/product library
│   │   ├── messages/             # Chat interface
│   │   ├── login/                # Auth pages
│   │   ├── register/
│   │   └── [etc]
│   │
│   └── layout.tsx                # Root layout
│
├── components/                   # Reusable React components
│   ├── ui/                       # Shadcn UI components
│   ├── navbar/                   # Navigation
│   ├── marketplace/              # Booking & product UI
│   ├── payments/                 # Stripe form components
│   ├── search/                   # Global search
│   └── [etc]
│
├── lib/                          # Utilities & config
│   ├── auth-context.tsx          # Firebase auth wrapper
│   ├── db.ts                     # Database connection
│   ├── stripe.ts                 # Stripe initialization
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Helper functions
│
├── db/                           # Database setup
│   ├── schema.ts                 # Drizzle ORM schema
│   └── index.ts                  # Database client
│
├── hooks/                        # React hooks
│   ├── use-toast.ts              # Toast notifications
│   └── use-mobile.tsx            # Mobile detection
│
├── public/                       # Static assets
│   └── images/                   # Hero, backgrounds, etc.
│
└── [config files]                # TypeScript, Tailwind, etc.
```

---

## Getting Started (Development)

### **Prerequisites**
- Node.js 18+ and pnpm (or npm/yarn)
- PostgreSQL database (or Neon serverless account)
- Firebase project for auth
- Stripe account for payments

### **Step 1: Clone and Install**
```bash
git clone https://github.com/your-username/consultbook.git
cd consultbook
pnpm install    # Much faster than npm!
```

### **Step 2: Environment Setup**
Create a `.env.local` file with:
```env
# Database
DATABASE_URL=postgresql://...

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# [other Firebase vars]

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### **Step 3: Database Setup**
```bash
# Run migrations
pnpm run migrate

# (Optional) Seed sample data
pnpm run seed
```

### **Step 4: Start Development**
```bash
pnpm run dev
# Open http://localhost:3000
```

---

## Development Workflow

### **Key Commands**
```bash
# Development server with hot reload
pnpm run dev

# Type checking
pnpm run lint

# Production build
pnpm run build

# Start production server
pnpm run start

# Run database migrations
pnpm run migrate
```

### **Common Development Tasks**

#### **Adding a New Consultant Action**
1. Create new function in `app/actions/consultants.ts`
2. Use `"use server"` directive at top
3. Query database using Drizzle ORM
4. Return typed response
5. Call from client component using `await actionName()`

#### **Creating a New API Flow**
1. Add data model to `db/schema.ts`
2. Create server actions for CRUD operations
3. Build components in `components/`
4. Wire up pages in `app/`
5. Add business logic to relevant actions file

#### **Styling New Components**
- Use Tailwind CSS classes (no CSS files needed)
- Import Shadcn components from `@/components/ui/`
- Follow existing component patterns for consistency

---

## System Workflows Visualized

### **1. Client Booking Flow**
How a client discovers, books, and pays for a consultation:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT BOOKING JOURNEY                       │
└─────────────────────────────────────────────────────────────────┘

  DISCOVER                    ENGAGE                   TRANSACT
     │                           │                         │
     ▼                           ▼                         ▼
┌──────────┐    YES      ┌──────────────┐    YES    ┌─────────────┐
│ Browse   │─────────►   │ View Rich    │─────────► │ Secure Time │
│ Experts  │             │ Profile &    │           │ Slot        │
└──────────┘             │ Reviews      │           └─────────────┘
                         └──────────────┘                   │
                                │                          ▼
                         LIKE IT?                      ┌─────────────┐
                                │                      │ Enter       │
                                ▼                      │ Payment     │
                         ┌──────────────┐              │ Details     │
                         │ Message      │              │ (Stripe)    │
                         │ Consultant   │              └─────────────┘
                         │ Ask Qs       │                   │
                         └──────────────┘                   ▼
                                                      ┌─────────────┐
                                                      │ Confirm &   │
                                                      │ Receive     │
                                                      │ Details     │
                                                      └─────────────┘
```

### **2. Consultant Onboarding & Approval**
How experts become verified and start selling:

```
┌─────────────────────────────────────────────────────────────────┐
│              CONSULTANT VERIFICATION PIPELINE                   │
└─────────────────────────────────────────────────────────────────┘

REGISTER         VERIFY              ADMIN REVIEW        PUBLISH
   │                 │                    │                  │
   ▼                 ▼                    ▼                  ▼
 ┌────┐    ┌──────────────┐    ┌─────────────────┐     ┌─────────┐
 │Cre-│───►│ Upload Docs: │───►│ Admin Reviews:  │────►│ Profile │
 │ate │    │ • Degrees    │    │ • Check Creds   │     │ Goes    │
 │Pro-│    │ • Certs      │    │ • Verify Legit  │     │ Live!   │
 │fil│    │ • Portfolio  │    │ • Approve/Reject│     │ Bookings│
 │e   │    └──────────────┘    └─────────────────┘     │ Open    │
 └────┘                                 │               └─────────┘
                                    APPROVED?
                                   /        \
                               YES          NO
                               /              \
                              ▼               ▼
                          PUBLISH        REQUEST
                          PROFILE        REVISIONS
```

### **3. Payment & Settlement Flow**
How money moves safely from clients to consultants:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT SETTLEMENT FLOW                      │
└─────────────────────────────────────────────────────────────────┘

BOOKING CONFIRMED          PRE-SESSION           POST-SESSION
       │                        │                      │
       ▼                        ▼                      ▼
 ┌──────────┐            ┌────────────┐        ┌──────────────┐
 │ Funds    │            │ Both Can   │        │ Dispute      │
 │ Collected│            │ Message    │        │ Window Opens │
 │ By       │            │ Consultant │        │ (7 days)     │
 │ Stripe   │            │ About      │        │              │
 │ &        │            │ Session    │        └──────────────┘
 │ Held in  │            └────────────┘               │
 │ Escrow   │                                    DISPUTE?
 └──────────┘                                    /        \
       │                                     YES          NO
       │                                     /              \
       │                                REFUND        RELEASE
       │                                ISSUED        TO CONS
       │                                    │          ULTANT
       ▼                                    │              ▼
 ┌──────────┐                              │         ┌──────────┐
 │ Session  │                              │         │ Funds in │
 │ Happens  │                              │         │ Escrow   │
 │          │                              │         │ Released │
 └──────────┘                              │         └──────────┘
                                           ▼
                                      ┌────────────┐
                                      │ Refund     │
                                      │ Processed  │
                                      │ Back to    │
                                      │ Client     │
                                      └────────────┘
```

### **4. Real-Time Messaging System**
How consultants and clients communicate:

```
┌─────────────────────────────────────────────────────────────────┐
│                 REAL-TIME MESSAGING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

CLIENT                                        CONSULTANT
  │                                                │
  │ 1. Opens chat with consultant                │
  │────────────────────────────────────────────►│
  │                                              │ 2. Receives instant
  │                                              │    notification
  │                                              │
  │ 3. Types message + attaches file            │
  │────────────────────────────────────────────►│
  │                                              │ 4. Message appears
  │                                              │    instantly (SSE)
  │                                              │
  │                                              │ 5. Types response
  │◄────────────────────────────────────────────│
  │                                              │
  │ 6. Chat history persisted in DB             │
  │ 7. Can reference in future bookings         │
```

### **5. Admin Dashboard Workflow**
How platform admins maintain quality:

```
┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN QUALITY CONTROL HUB                      │
└─────────────────────────────────────────────────────────────────┘

VERIFICATION QUEUE          TRANSACTION MONITOR      CONTENT MOD
      │                            │                      │
      ▼                            ▼                      ▼
 ┌──────────┐               ┌────────────┐          ┌─────────┐
 │ Review   │               │ Monitor    │          │ Review  │
 │ Pending  │               │ Payments   │          │ Reviews │
 │ Consults │               │ & Disputes │          │ & Rates │
 │ Creds    │               │ Chargebacks│          │ Content │
 └──────────┘               └────────────┘          └─────────┘
      │                            │                      │
      ▼                            ▼                      ▼
 APPROVE/                    RESOLVE/        APPROVE/REJECT/
 REJECT                       REFUND          FLAG FOR REVIEW
      │                            │                      │
      ▼                            ▼                      ▼
CONSULTANT                   CLIENT &            CONSULTANT &
NOTIFIED                      CONSULTANT           CLIENT INFO
                              UPDATED              UPDATED
```

### **6. Appointment Lifecycle**
The complete journey of a single appointment:

```
┌─────────────────────────────────────────────────────────────────┐
│                  APPOINTMENT STATE MACHINE                      │
└─────────────────────────────────────────────────────────────────┘

  CREATED              CONFIRMED           IN-PROGRESS
    │                      │                    │
    │ Payment OK?          │ Time check        │ Session
    ▼                      ▼ reminder          ▼ starts
 ┌──────┐           automated  1h             ┌─────┐
 │PENDING├─────────────►│CONFIRMED├────────► │LIVE │
 │       │   Notify     │         │Notify    │     │
 └──────┘  both parties └──────────┘ both    └─────┘
                       parties            │
                                          ▼
                                      ┌──────────┐
                                      │COMPLETED │
                                      │ Opened  │
                                      │ for      │
                                      │ Review   │
                                      └──────────┘
                                          │
                                    ┌─────┴──────┐
                                    ▼            ▼
                          ┌──────────────┐  ┌───────────────┐
                          │CLIENT REVIEWS │  │CONSULTANT    │
                          │& RATES       │  │RESPONDS &    │
                          └──────────────┘  │ADDS NOTES    │
                                            └───────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────────┐
                                            │ ARCHIVED         │
                                            │ (for portfolio)  │
                                            └──────────────────┘
```

---

## User Experience Design

The platform prioritizes intuitive, accessible design:

### **Visual Hierarchy**
- **Clear CTAs** - Every page has an obvious next step
- **Progressive Disclosure** - Show necessary info first, details on demand
- **Responsive** - Works flawlessly on mobile, tablet, and desktop

### **Performance Indicators**
- **Page Load Times** - < 1 second (optimized with Server Components)
- **Search Results** - Instant with debouncing
- **Payment Processing** - < 3 seconds confirmation
- **Chat Latency** - < 100ms (real-time SSE)

---

## Security & Compliance

We take data safety seriously:

- **Authentication** - Firebase handles secure login/logout
- **Data Encryption** - HTTPS everywhere; sensitive data encrypted at rest
- **Payment Security** - PCI DSS compliant via Stripe
- **Privacy** - No third-party data selling; GDPR compliant
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **Session Management** - Automatic logout after inactivity

---

## Future Roadmap

- [ ] **AI-Powered Matching** - Smart algorithm to pair clients with ideal consultants
- [ ] **Mobile Apps** - Native iOS/Android experiences
- [ ] **Cohort Programs** - Group-based learning with cohort pricing
- [ ] **Video Recording** - Automatic session recording for consultants
- [ ] **Marketplace Integrations** - Connect with Calendly, Zoom, Slack
- [ ] **Advanced Analytics** - Consultant performance dashboards with insights
- [ ] **Affiliate Program** - Consultants earn by referring others

---

## Contributing

We love contributions! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the existing code style and add tests for new features.

---

## License

This project is proprietary software. All rights reserved.

---

## Support & Feedback

Have questions or suggestions? We'd love to hear them:

- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Ask questions in GitHub Discussions
- **Email** - For partnerships: partnerships@consultbook.dev

---

## Acknowledgments

Built with inspiration from platforms like Calendly, Stripe, and the global community of knowledge sharers. Special thanks to:

- The React and Next.js teams for amazing frameworks
- Shadcn for beautiful UI components
- Stripe for reliable payment processing
- Our early users who help us improve every day

---

*Last Updated: March 2026*
©Sharif Mahmud Sazid*
