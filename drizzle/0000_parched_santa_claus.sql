CREATE TYPE "public"."deadline_type" AS ENUM('calendar', 'anniversary', 'rolling_monthly');--> statement-breakpoint
CREATE TYPE "public"."frequency" AS ENUM('one_time', 'annual', 'biannual_h1', 'biannual_h2', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('month_before', 'week_before');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'stopped', 'pending_verify');--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credit_id" uuid NOT NULL,
	"cycle_key" text NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_claims_user_id_credit_id_cycle_key_unique" UNIQUE("user_id","credit_id","cycle_key")
);
--> statement-breakpoint
CREATE TABLE "credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" text NOT NULL,
	"name" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"description" text NOT NULL,
	"activation_url" text,
	"deadline_type" "deadline_type" NOT NULL,
	"deadline_month" integer,
	"deadline_day" integer,
	"frequency" "frequency" NOT NULL,
	"expires_after_year" integer,
	"active" boolean DEFAULT true NOT NULL,
	"low_priority" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders_sent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credit_id" uuid NOT NULL,
	"cycle_key" text NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"message_id" text,
	CONSTRAINT "reminders_sent_user_id_credit_id_cycle_key_reminder_type_unique" UNIQUE("user_id","credit_id","cycle_key","reminder_type")
);
--> statement-breakpoint
CREATE TABLE "user_cards" (
	"user_id" uuid NOT NULL,
	"card_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_cards_user_id_card_id_pk" PRIMARY KEY("user_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"anniversary_csr" date,
	"anniversary_united" date,
	"consent_at" timestamp,
	"status" "user_status" DEFAULT 'pending_verify' NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "credit_claims" ADD CONSTRAINT "credit_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_claims" ADD CONSTRAINT "credit_claims_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders_sent" ADD CONSTRAINT "reminders_sent_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders_sent" ADD CONSTRAINT "reminders_sent_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;