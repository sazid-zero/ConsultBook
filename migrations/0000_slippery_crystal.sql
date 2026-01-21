CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"consultant_id" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"duration" integer NOT NULL,
	"mode" text NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"notes" text,
	"meeting_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultant_profiles" (
	"consultant_id" text PRIMARY KEY NOT NULL,
	"bio" text DEFAULT '',
	"specializations" text[],
	"hourly_rate" integer DEFAULT 0,
	"city" text,
	"experience" text,
	"languages" text[],
	"consultation_modes" text[],
	"is_approved" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"cover_photo" text,
	"resume" text,
	"hours_delivered" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"average_rating" integer DEFAULT 0,
	"published_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultant_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" text NOT NULL,
	"day_of_week" varchar(20) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"time_slots" text[] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uid" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'client' NOT NULL,
	"profile_photo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"country" text
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_users_uid_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_consultant_id_users_uid_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_profiles" ADD CONSTRAINT "consultant_profiles_consultant_id_users_uid_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant_schedules" ADD CONSTRAINT "consultant_schedules_consultant_id_users_uid_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;