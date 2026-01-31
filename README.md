# ConsultBook - The Ultimate Expert Consultation Platform

![ConsultBook Hero](/public/hero.png)

## 🚀 Introduction

**ConsultBook** is a next-generation SaaS platform designed to bridge the gap between experts and knowledge seekers. It serves as a comprehensive **Knowledge Commerce Marketplace**, allowing professionals to monetize their expertise through 1:1 consultations, live masterclasses, and digital products.

Built with **Next.js 15**, **TypeScript**, and **Drizzle ORM**, ConsultBook offers a seamless, high-performance experience with real-time capabilities. It solves the fragmentation in the consultation industry by unifying scheduling, video conferencing, payments, and community management into a single, elegant ecosystem.

> **Status Reference for Recruiters**: This project is a full-stack production-grade application demonstrating advanced architectural patterns, real-time data handling, and complex state management.

---

## 🌟 Key Features

### 1. **Expert Marketplace & Discovery**
- **Advanced Search Engine**: Real-time filtering by specialty, location, price, and mode (video/in-person) using a custom optimized search algorithm.
- **Dynamic Profile Pages**: Rich consultant profiles showcasing bios, qualifications, cover photos, and verified reviews.
- **Global Command Center**: A `Cmd+K` power search interface for instant navigation across the entire platform.

### 2. **Comprehensive Booking System**
- **Smart Scheduling**: Integrated calendar management with timezone support, allowing consultants to define custom availability slots.
- **Multi-Mode Appointments**: Support for Video, Audio, and In-Person consultation bookings.
- **Workflow Automation**: Automated email notifications and status updates (Pending -> Confirmed -> Completed) for both parties.

### 3. **Live Workshops & Masterclasses**
- **Event Management**: Consultants can create, publish, and monetize live group sessions.
- **Ticketing System**: Seamless seat reservation and capacity management for workshops.
- **Digital Asset Delivery**: Automated distribution of workshop materials and resources to attendees.

### 4. **Real-Time Communication Hub**
- **Integrated Messaging**: A full-featured chat system allowing pre-booking inquiries and post-session follow-ups.
- **File Sharing**: Secure sharing of documents, resources, and session notes directly within the chat.
- **Instant Notifications**: Real-time alerts for new messages, booking requests, and session reminders.

### 5. **Robust Payment Infrastructure** (Powered by Stripe)
- **Secure Transactions**: End-to-end encrypted payment processing for appointments and digital products.
- **Wallet System**: Integrated digital wallet for tracking earnings, refunds, and transaction history.
- **Automated Payouts**: Streamlined withdrawal process for consultants to receive their earnings directly.
- **Multi-Currency Support**: Built to handle international transactions seamlessley.

### 6. **Dual-Role Dashboards**
- **Client Dashboard**: A personalized hub for tracking upcoming sessions, purchase history, and favorite consultants.
- **Consultant Workspace**: A professional suite for managing bookings, analyzing earnings, creating workshops, and editing public profiles.

---

## 🛠️ Technology Stack

This project leverages the bleeding edge of the React ecosystem to ensure scalability and performance.

| Category | Technologies |
|----------|--------------|
| **Core Framework** | Next.js 15 (App Router), React 19 (RC) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS, Shadcn UI, Framer Motion (Animations) |
| **Database & ORM** | PostgreSQL (Neon DB Serverless), Drizzle ORM |
| **Authentication** | Firebase Auth (Custom Integration) |
| **State Management** | React Hooks, Context API, Server Actions |
| **Real-Time** | Server-Sent Events (SSE) / Polling for Updates |
| **Forms & Validation** | React Hook Form, Zod |

---

## 💡 Technical Challenges Solved

### **1. Handling Complex Scheduling Logic**
Designing a database schema and UI that handles custom availability across different timezones was non-trivial. I implemented a robust `consultant_schedules` table and overlapping time-slot validation logic to ensure zero double-bookings.

### **2. Performance Optimization with Server Actions**
To ensure lightning-fast page loads, I heavily utilized Next.js Server Components and Server Actions. This reduced the client-side bundle size significantly and moved complex logic (like booking calculations and database mutations) to the edge.

### **3. Unified Search Experience**
Implementing the "Global Search" required harmonizing data from multiple disparate sources (Consultants, Workshops, Products). I built a unified search indexer that aggregates these entities and serves them through a high-performance filtering UI.

---

## 📸 Screen Showcase

| | |
|:-------------------------:|:-------------------------:|
| **Landing Page** | **Sessions** |
| ![Landing](/public/landing.jpeg) | ![Sessions](/public/sessions.jpeg) |
| **Library** | **Consultant Profiles** |
| ![Library](/public/library.jpeg) | ![Profile](/public/consultants.jpeg) |

---

## 🏁 Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/consultbook.git
    cd consultbook
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file and add your Supabase/Neon DB credentials and Stripe keys.
    ```env
    DATABASE_URL=postgres://...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    ```

4.  **Run Database Migrations:**
    ```bash
    npm run db:push
    ```

5.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

---

## 🛣️ Future Roadmap

- [ ] **AI-Powered Matching**: Recommendation engine to pair clients with the perfect expert.
- [ ] **Mobile App**: Native mobile experience using React Native.
- [ ] **Group Consulting**: Support for cohort-based consulting programs.

---

## 📬 Contact

For inquiries or collaboration opportunities, please reach out:

- **Portfolio**: [https://my-portfolio-v42.vercel.app/](https://my-portfolio-v42.vercel.app/)
- **Email**: [sharif.sazid.3@gmail.com](mailto:sharif.sazid.3@gmail.com)

*Built with ❤️ by a passionate full-stack developer.
©Sharif Mahmud Sazid*
