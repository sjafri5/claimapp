-- SCHEMA
CREATE TYPE "public"."deadline_type" AS ENUM('calendar', 'anniversary', 'rolling_monthly');
CREATE TYPE "public"."frequency" AS ENUM('one_time', 'annual', 'biannual_h1', 'biannual_h2', 'monthly');
CREATE TYPE "public"."plan" AS ENUM('free', 'pro');
CREATE TYPE "public"."reminder_type" AS ENUM('month_before', 'week_before');
CREATE TYPE "public"."user_status" AS ENUM('active', 'stopped', 'pending_verify');

CREATE TABLE "cards" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "issuer" text NOT NULL
);

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

CREATE TABLE "credit_claims" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "credit_id" uuid NOT NULL,
  "cycle_key" text NOT NULL,
  "claimed_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "credit_claims_user_id_credit_id_cycle_key_unique" UNIQUE("user_id","credit_id","cycle_key")
);

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

CREATE TABLE "user_cards" (
  "user_id" uuid NOT NULL,
  "card_id" text NOT NULL,
  "added_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_cards_user_id_card_id_pk" PRIMARY KEY("user_id","card_id")
);

ALTER TABLE "credit_claims" ADD CONSTRAINT "credit_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "credit_claims" ADD CONSTRAINT "credit_claims_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "credits" ADD CONSTRAINT "credits_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reminders_sent" ADD CONSTRAINT "reminders_sent_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reminders_sent" ADD CONSTRAINT "reminders_sent_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;

-- SEED: Cards
INSERT INTO cards (id, name, issuer) VALUES
  ('csr', 'Chase Sapphire Reserve', 'Chase'),
  ('united_club_infinite', 'United Club Infinite', 'Chase'),
  ('world_of_hyatt', 'World of Hyatt', 'Chase'),
  ('ihg_premier', 'IHG One Rewards Premier', 'Chase'),
  ('amex_platinum', 'Amex Platinum', 'American Express'),
  ('amex_gold', 'Amex Gold', 'American Express'),
  ('hilton_aspire', 'Hilton Honors Aspire', 'American Express'),
  ('marriott_brilliant', 'Marriott Bonvoy Brilliant', 'American Express'),
  ('delta_reserve', 'Delta SkyMiles Reserve', 'American Express'),
  ('venture_x', 'Capital One Venture X', 'Capital One'),
  ('citi_strata_premier', 'Citi Strata Premier', 'Citi'),
  ('citi_strata_elite', 'Citi Strata Elite', 'Citi'),
  ('bofa_premium_elite', 'Premium Rewards Elite', 'Bank of America'),
  ('altitude_reserve', 'Altitude Reserve', 'U.S. Bank'),
  ('bilt_palladium', 'Bilt Palladium', 'Bilt Rewards');

-- SEED: CSR Credits
INSERT INTO credits (card_id, name, amount_cents, description, activation_url, deadline_type, deadline_month, deadline_day, frequency, expires_after_year, active, low_priority) VALUES
  ('csr', 'StubHub / viagogo credit (H1)', 15000, '$150 StubHub/viagogo credit expires Jun 30. Activation required.', 'https://www.chase.com/mybonus', 'calendar', 6, 30, 'biannual_h1', NULL, true, false),
  ('csr', 'StubHub / viagogo credit (H2)', 15000, '$150 StubHub/viagogo credit expires Dec 31. Resets Jul 1.', 'https://www.chase.com/mybonus', 'calendar', 12, 31, 'biannual_h2', NULL, true, false),
  ('csr', 'Exclusive Tables dining (H1)', 15000, '$150 Exclusive Tables dining credit expires Jun 30.', NULL, 'calendar', 6, 30, 'biannual_h1', NULL, true, false),
  ('csr', 'Exclusive Tables dining (H2)', 15000, '$150 Exclusive Tables dining credit expires Dec 31.', NULL, 'calendar', 12, 31, 'biannual_h2', NULL, true, false),
  ('csr', 'The Edit hotel credit', 50000, '$500 The Edit hotel credit expires Dec 31.', NULL, 'calendar', 12, 31, 'annual', NULL, true, false),
  ('csr', 'Select Hotels credit', 25000, '$250 Select Hotels credit (2026 only). Expires Dec 31.', NULL, 'calendar', 12, 31, 'one_time', 2026, true, false),
  ('csr', 'Travel credit', 30000, '$300 annual travel credit resets on your card anniversary.', NULL, 'anniversary', NULL, NULL, 'annual', NULL, true, false),
  ('csr', 'DoorDash restaurant promo', 500, '$5 DoorDash restaurant credit expires end of month.', NULL, 'rolling_monthly', NULL, NULL, 'monthly', NULL, true, true),
  ('csr', 'Lyft credit', 1000, '$10 Lyft credit expires end of month.', NULL, 'rolling_monthly', NULL, NULL, 'monthly', NULL, true, true),
  ('csr', 'Peloton credit', 1000, '$10 Peloton credit expires end of month. Activation required.', 'https://www.chase.com/mybonus', 'rolling_monthly', NULL, NULL, 'monthly', NULL, true, true);

-- SEED: United Club Infinite
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('united_club_infinite', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', 'anniversary', NULL, NULL, 'annual', true, false),
  ('united_club_infinite', 'Annual United travel credit', 10000, 'Annual United travel credit resets on anniversary.', 'anniversary', NULL, NULL, 'annual', false, false);

-- SEED: Amex Platinum
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, expires_after_year, active, low_priority) VALUES
  ('amex_platinum', 'Uber Cash', 1500, '$15/mo Uber Cash ($20 in Dec). Does not roll over.', 'rolling_monthly', NULL, NULL, 'monthly', NULL, true, true),
  ('amex_platinum', 'Streaming/Digital Entertainment credit', 2500, '$25/mo streaming credit (Disney+, Hulu, ESPN+, Peacock, NYT, WSJ).', 'rolling_monthly', NULL, NULL, 'monthly', NULL, true, true),
  ('amex_platinum', 'Resy restaurant credit (Q1)', 10000, '$100 Resy dining credit expires Mar 31.', 'calendar', 3, 31, 'biannual_h1', NULL, true, false),
  ('amex_platinum', 'Resy restaurant credit (Q2)', 10000, '$100 Resy dining credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', NULL, true, false),
  ('amex_platinum', 'Resy restaurant credit (Q3)', 10000, '$100 Resy dining credit expires Sep 30.', 'calendar', 9, 30, 'biannual_h2', NULL, true, false),
  ('amex_platinum', 'Resy restaurant credit (Q4)', 10000, '$100 Resy dining credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', NULL, true, false),
  ('amex_platinum', 'Lululemon credit (Q1)', 7500, '$75 Lululemon credit expires Mar 31.', 'calendar', 3, 31, 'biannual_h1', NULL, true, false),
  ('amex_platinum', 'Lululemon credit (Q2)', 7500, '$75 Lululemon credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', NULL, true, false),
  ('amex_platinum', 'Lululemon credit (Q3)', 7500, '$75 Lululemon credit expires Sep 30.', 'calendar', 9, 30, 'biannual_h2', NULL, true, false),
  ('amex_platinum', 'Lululemon credit (Q4)', 7500, '$75 Lululemon credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', NULL, true, false),
  ('amex_platinum', 'FHR / Hotel Collection credit (H1)', 30000, '$300 Fine Hotels + Resorts credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', NULL, true, false),
  ('amex_platinum', 'FHR / Hotel Collection credit (H2)', 30000, '$300 Fine Hotels + Resorts credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', NULL, true, false),
  ('amex_platinum', 'Airline incidental fee credit', 20000, '$200 airline incidental credit expires Dec 31. Must select airline.', 'calendar', 12, 31, 'annual', NULL, true, false),
  ('amex_platinum', 'Saks Fifth Avenue credit (H1)', 5000, '$50 Saks credit expires Jun 30. Ending July 1, 2026.', 'calendar', 6, 30, 'biannual_h1', 2026, true, false),
  ('amex_platinum', 'Equinox credit', 30000, '$300 Equinox membership credit expires Dec 31.', 'calendar', 12, 31, 'annual', NULL, true, false),
  ('amex_platinum', 'CLEAR+ membership credit', 20900, '$209 CLEAR+ membership credit expires Dec 31.', 'calendar', 12, 31, 'annual', NULL, true, false),
  ('amex_platinum', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', 'anniversary', NULL, NULL, 'annual', NULL, true, false);

-- SEED: Amex Gold
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('amex_gold', 'Uber Cash', 1000, '$10/mo Uber Cash. Does not roll over.', 'rolling_monthly', NULL, NULL, 'monthly', true, true),
  ('amex_gold', 'Dining credit', 1000, '$10/mo dining credit (Grubhub, Cheesecake Factory, Five Guys).', 'rolling_monthly', NULL, NULL, 'monthly', true, true),
  ('amex_gold', 'Dunkin credit', 700, '$7/mo Dunkin credit.', 'rolling_monthly', NULL, NULL, 'monthly', true, true),
  ('amex_gold', 'Resy restaurant credit (H1)', 5000, '$50 Resy dining credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', true, false),
  ('amex_gold', 'Resy restaurant credit (H2)', 5000, '$50 Resy dining credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', true, false);

-- SEED: Hilton Aspire
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('hilton_aspire', 'Resort credit (H1)', 20000, '$200 Hilton resort credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', true, false),
  ('hilton_aspire', 'Resort credit (H2)', 20000, '$200 Hilton resort credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', true, false),
  ('hilton_aspire', 'Airline/flight credit (Q1)', 5000, '$50 airline credit expires Mar 31.', 'calendar', 3, 31, 'biannual_h1', true, false),
  ('hilton_aspire', 'Airline/flight credit (Q2)', 5000, '$50 airline credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', true, false),
  ('hilton_aspire', 'Airline/flight credit (Q3)', 5000, '$50 airline credit expires Sep 30.', 'calendar', 9, 30, 'biannual_h2', true, false),
  ('hilton_aspire', 'Airline/flight credit (Q4)', 5000, '$50 airline credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', true, false),
  ('hilton_aspire', 'CLEAR+ membership credit', 20900, '$209 CLEAR+ membership credit expires Dec 31.', 'calendar', 12, 31, 'annual', true, false);

-- SEED: Marriott Brilliant
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('marriott_brilliant', 'Dining credit', 2500, '$25/mo dining credit at any restaurant worldwide.', 'rolling_monthly', NULL, NULL, 'monthly', true, false),
  ('marriott_brilliant', 'Ritz-Carlton / St. Regis property credit (H1)', 10000, '$100 Ritz/St. Regis property credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', true, false),
  ('marriott_brilliant', 'Ritz-Carlton / St. Regis property credit (H2)', 10000, '$100 Ritz/St. Regis property credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', true, false);

-- SEED: Delta Reserve
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('delta_reserve', 'Resy restaurant credit', 2000, '$20/mo Resy dining credit. Does not roll over.', 'rolling_monthly', NULL, NULL, 'monthly', true, false),
  ('delta_reserve', 'Ride-hailing credit', 1000, '$10/mo ride credit (Lyft, Uber, Alto, Curb).', 'rolling_monthly', NULL, NULL, 'monthly', true, true),
  ('delta_reserve', 'Delta Stays hotel credit', 20000, '$200 Delta Stays hotel credit expires Dec 31.', 'calendar', 12, 31, 'annual', true, false),
  ('delta_reserve', 'Companion certificate', 0, 'Companion cert for domestic round-trip. Expires ~12 months.', 'anniversary', NULL, NULL, 'annual', true, false),
  ('delta_reserve', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: Venture X
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('venture_x', 'Travel credit', 30000, '$300 travel credit resets on anniversary. Must book through Capital One Travel.', 'anniversary', NULL, NULL, 'annual', true, false),
  ('venture_x', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: Citi Strata Premier
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('citi_strata_premier', 'Hotel credit', 10000, '$100 hotel credit (stays $500+). Must book via Citi Travel. Expires Dec 31.', 'calendar', 12, 31, 'annual', true, false);

-- SEED: Citi Strata Elite
INSERT INTO credits (card_id, name, amount_cents, description, activation_url, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('citi_strata_elite', 'Hotel credit', 30000, '$300 hotel credit expires Dec 31.', NULL, 'calendar', 12, 31, 'annual', true, false),
  ('citi_strata_elite', 'Splurge credit', 20000, '$200 Splurge credit expires Dec 31. Must activate merchant selections.', 'https://www.citi.com/splurgecredit', 'calendar', 12, 31, 'annual', true, false),
  ('citi_strata_elite', 'Blacklane chauffeur credit (H1)', 10000, '$100 Blacklane credit expires Jun 30.', NULL, 'calendar', 6, 30, 'biannual_h1', true, false),
  ('citi_strata_elite', 'Blacklane chauffeur credit (H2)', 10000, '$100 Blacklane credit expires Dec 31.', NULL, 'calendar', 12, 31, 'biannual_h2', true, false),
  ('citi_strata_elite', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', NULL, 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: BofA Premium Elite
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('bofa_premium_elite', 'Airline incidental credit', 30000, '$300 airline incidental credit expires Dec 31.', 'calendar', 12, 31, 'annual', true, false),
  ('bofa_premium_elite', 'Lifestyle credit', 15000, '$150 lifestyle credit expires Dec 31.', 'calendar', 12, 31, 'annual', true, false),
  ('bofa_premium_elite', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: Altitude Reserve
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('altitude_reserve', 'Travel credit', 32500, '$325 travel credit resets on anniversary.', 'anniversary', NULL, NULL, 'annual', true, false),
  ('altitude_reserve', 'Global Entry / TSA PreCheck credit', 10000, '$100 Global Entry/TSA PreCheck credit.', 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: World of Hyatt
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('world_of_hyatt', 'Anniversary free night certificate', 25000, 'Free night cert (Cat 1-4). Expires 12 months from issuance.', 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: IHG Premier
INSERT INTO credits (card_id, name, amount_cents, description, activation_url, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('ihg_premier', 'Anniversary free night award', 20000, 'Free night award (up to 40K pts). Expires 12 months from issuance.', NULL, 'anniversary', NULL, NULL, 'annual', true, false),
  ('ihg_premier', 'United TravelBank Cash (H1)', 2500, '$25 United TravelBank deposited ~Jan 5. EXPIRES Jul 15!', 'https://www.ihg.com/united', 'calendar', 7, 15, 'biannual_h1', true, false),
  ('ihg_premier', 'United TravelBank Cash (H2)', 2500, '$25 United TravelBank deposited ~Jul 5. EXPIRES Jan 15!', 'https://www.ihg.com/united', 'calendar', 1, 15, 'biannual_h2', true, false),
  ('ihg_premier', 'Global Entry / TSA PreCheck credit', 12000, '$120 Global Entry/TSA PreCheck credit.', NULL, 'anniversary', NULL, NULL, 'annual', true, false);

-- SEED: Bilt Palladium
INSERT INTO credits (card_id, name, amount_cents, description, deadline_type, deadline_month, deadline_day, frequency, active, low_priority) VALUES
  ('bilt_palladium', 'Hotel credit (H1)', 20000, '$200 Bilt Travel hotel credit expires Jun 30.', 'calendar', 6, 30, 'biannual_h1', true, false),
  ('bilt_palladium', 'Hotel credit (H2)', 20000, '$200 Bilt Travel hotel credit expires Dec 31.', 'calendar', 12, 31, 'biannual_h2', true, false),
  ('bilt_palladium', 'Bilt Cash', 20000, '$200 Bilt Cash credited Jan 1. Does not roll over.', 'calendar', 12, 31, 'annual', true, false),
  ('bilt_palladium', 'Grubhub delivery credit', 1000, '$10/mo Grubhub credit. Does not roll over.', 'rolling_monthly', NULL, NULL, 'monthly', true, true),
  ('bilt_palladium', 'Gopuff credit', 500, '$5/mo Gopuff credit. Does not roll over.', 'rolling_monthly', NULL, NULL, 'monthly', true, true);
