import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "stopped",
  "pending_verify",
]);

export const deadlineTypeEnum = pgEnum("deadline_type", [
  "calendar",
  "anniversary",
  "rolling_monthly",
]);

export const frequencyEnum = pgEnum("frequency", [
  "one_time",
  "annual",
  "biannual_h1",
  "biannual_h2",
  "monthly",
]);

export const reminderTypeEnum = pgEnum("reminder_type", [
  "month_before",
  "week_before",
]);

export const planEnum = pgEnum("plan", ["free", "pro"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  anniversaryCsr: date("anniversary_csr"),
  anniversaryUnited: date("anniversary_united"),
  consentAt: timestamp("consent_at"),
  status: userStatusEnum("status").notNull().default("pending_verify"),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
});

export const userCards = pgTable(
  "user_cards",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.cardId] }),
  })
);

export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  description: text("description").notNull(),
  activationUrl: text("activation_url"),
  deadlineType: deadlineTypeEnum("deadline_type").notNull(),
  deadlineMonth: integer("deadline_month"),
  deadlineDay: integer("deadline_day"),
  frequency: frequencyEnum("frequency").notNull(),
  expiresAfterYear: integer("expires_after_year"),
  active: boolean("active").notNull().default(true),
  lowPriority: boolean("low_priority").notNull().default(false),
});

export const remindersSent = pgTable(
  "reminders_sent",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    creditId: uuid("credit_id")
      .notNull()
      .references(() => credits.id),
    cycleKey: text("cycle_key").notNull(),
    reminderType: reminderTypeEnum("reminder_type").notNull(),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
    messageId: text("message_id"),
  },
  (table) => ({
    uniqueReminder: unique().on(
      table.userId,
      table.creditId,
      table.cycleKey,
      table.reminderType
    ),
  })
);

export const creditClaims = pgTable(
  "credit_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    creditId: uuid("credit_id")
      .notNull()
      .references(() => credits.id),
    cycleKey: text("cycle_key").notNull(),
    claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueClaim: unique().on(table.userId, table.creditId, table.cycleKey),
  })
);

export const verificationCodes = pgTable("verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type Credit = typeof credits.$inferSelect;
export type ReminderSent = typeof remindersSent.$inferSelect;
export type CreditClaim = typeof creditClaims.$inferSelect;
