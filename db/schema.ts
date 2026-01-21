import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, varchar, primaryKey } from "drizzle-orm/pg-core";

// Users table (Authentification & Basic Info)
export const users = pgTable("users", {
  uid: text("uid").primaryKey(), // Firebase UID
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["client", "consultant", "admin"] }).default("client").notNull(),
  profilePhoto: text("profile_photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Location info often stored on user in this app
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
});

// Consultant Profiles (Extended info for consultants)
export const consultantProfiles = pgTable("consultant_profiles", {
  consultantId: text("consultant_id").primaryKey().references(() => users.uid),
  bio: text("bio").default(""),
  specializations: text("specializations").array(),
  hourlyRate: integer("hourly_rate").default(0),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  address: text("address"),
  experience: text("experience"), // e.g., "5+ years"
  education: jsonb("education"), // Array<{ degree, university, year }>
  socialLinks: jsonb("social_links"),
  portfolioItems: jsonb("portfolio_items"), // Array<{ title, description, imageUrl }>
  languages: text("languages").array(),
  consultationModes: text("consultation_modes").array(), // ["video", "audio"]
  
  isApproved: boolean("is_approved").default(false),
  isPublished: boolean("is_published").default(false),
  isAvailable: boolean("is_available").default(true),
  
  coverPhoto: text("cover_photo"),
  resume: text("resume"),
  
  // Stats
  hoursDelivered: integer("hours_delivered").default(0),
  ratingCount: integer("rating_count").default(0),
  averageRating: integer("average_rating").default(0),
  
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Qualifications (Normalized)
export const qualifications = pgTable("qualifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  name: text("name").notNull(),
  certificateUrl: text("certificate_url"),
  certificateFilename: text("certificate_filename"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rejectedConsultants = pgTable("rejected_consultants", {
  id: uuid("id").defaultRandom().primaryKey(),
  uid: text("uid").notNull(), 
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  rejectionReason: text("rejection_reason"),
  rejectedAt: timestamp("rejected_at").defaultNow(),
  originalData: jsonb("original_data"), // Store full snapshot if needed
});

export const certifications = pgTable("certifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consultant Schedules (New dedicated table)
export const consultantSchedules = pgTable("consultant_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(), // 'monday', 'tuesday', etc.
  isEnabled: boolean("is_enabled").default(true).notNull(),
  timeSlots: text("time_slots").array().notNull(), // ["09:00", "10:00"]
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: text("client_id").notNull().references(() => users.uid),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:mm
  duration: integer("duration").notNull(), // in minutes
  mode: text("mode").notNull(), // 'video', 'in-person'
  amount: integer("amount").notNull(),
  
  status: text("status", { enum: ["upcoming", "completed", "cancelled"] }).default("upcoming").notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "completed", "refunded"] }).default("pending").notNull(),
  paymentMethod: text("payment_method"),
  
  notes: text("notes"),
  meetingLink: text("meeting_link"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.uid),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["booking", "reschedule", "cancellation", "message", "alert"] }).notNull(),
  relatedId: text("related_id"), // appointmentId, messageId etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  clientId: text("client_id").notNull().references(() => users.uid),
  appointmentId: uuid("appointment_id").notNull().references(() => appointments.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversations
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: text("client_id").notNull().references(() => users.uid),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time").defaultNow(),
  clientUnread: integer("client_unread").default(0).notNull(),
  consultantUnread: integer("consultant_unread").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id),
  senderId: text("sender_id").notNull().references(() => users.uid),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "image", "file"] }).default("text").notNull(),
  fileUrl: text("file_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Library / Marketplace Products
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["book", "course", "digital_asset"] }).notNull(),
  price: integer("price").notNull(), // in cents
  thumbnailUrl: text("thumbnail_url"),
  fileUrl: text("file_url"), // The actual download or access link
  isPublished: boolean("is_published").default(false).notNull(),
  salesCount: integer("sales_count").default(0).notNull(),
  averageRating: integer("average_rating").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Reviews
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id),
  clientId: text("client_id").notNull().references(() => users.uid),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product Orders
export const productOrders = pgTable("product_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id),
  clientId: text("client_id").notNull().references(() => users.uid),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workshops / Sessions
export const workshops = pgTable("workshops", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultantId: text("consultant_id").notNull().references(() => users.uid),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(),
  mode: text("mode", { enum: ["online", "offline"] }).notNull(),
  location: text("location"), // Zoom link or physical address
  thumbnailUrl: text("thumbnail_url"),
  maxParticipants: integer("max_participants"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workshop Registrations
export const workshopRegistrations = pgTable("workshop_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workshopId: uuid("workshop_id").notNull().references(() => workshops.id),
  clientId: text("client_id").notNull().references(() => users.uid),
  paymentStatus: text("payment_status", { enum: ["pending", "completed", "refunded"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ one, many }) => ({
  consultantProfile: one(consultantProfiles, {
    fields: [users.uid],
    references: [consultantProfiles.consultantId],
  }),
  qualifications: many(qualifications),
  appointmentsAsClient: many(appointments, { relationName: "clientAppointments" }),
  appointmentsAsConsultant: many(appointments, { relationName: "consultantAppointments" }),
  sentMessages: many(messages),
  products: many(products),
  productReviews: many(productReviews),
  productOrders: many(productOrders),
  workshops: many(workshops),
  workshopRegistrations: many(workshopRegistrations),
}));

export const consultantProfileRelations = relations(consultantProfiles, ({ one }) => ({
  user: one(users, {
    fields: [consultantProfiles.consultantId],
    references: [users.uid],
  }),
}));

export const qualificationsRelations = relations(qualifications, ({ one }) => ({
  consultant: one(users, {
    fields: [qualifications.consultantId],
    references: [users.uid],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.uid],
    relationName: "clientAppointments"
  }),
  consultant: one(users, {
    fields: [appointments.consultantId],
    references: [users.uid],
    relationName: "consultantAppointments"
  }),
  review: one(reviews, {
    fields: [appointments.id],
    references: [reviews.appointmentId],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.uid],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  consultant: one(users, {
    fields: [reviews.consultantId],
    references: [users.uid],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.uid],
  }),
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  client: one(users, {
    fields: [conversations.clientId],
    references: [users.uid],
  }),
  consultant: one(users, {
    fields: [conversations.consultantId],
    references: [users.uid],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.uid],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  consultant: one(users, {
    fields: [products.consultantId],
    references: [users.uid],
  }),
  reviews: many(productReviews),
  orders: many(productOrders),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  client: one(users, {
    fields: [productReviews.clientId],
    references: [users.uid],
  }),
}));

export const productOrdersRelations = relations(productOrders, ({ one }) => ({
  product: one(products, {
    fields: [productOrders.productId],
    references: [products.id],
  }),
  client: one(users, {
    fields: [productOrders.clientId],
    references: [users.uid],
  }),
}));

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
  consultant: one(users, {
    fields: [workshops.consultantId],
    references: [users.uid],
  }),
  registrations: many(workshopRegistrations),
}));

export const workshopRegistrationsRelations = relations(workshopRegistrations, ({ one }) => ({
  workshop: one(workshops, {
    fields: [workshopRegistrations.workshopId],
    references: [workshops.id],
  }),
  client: one(users, {
    fields: [workshopRegistrations.clientId],
    references: [users.uid],
  }),
}));
