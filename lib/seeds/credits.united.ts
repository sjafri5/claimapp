import type { Credit } from "@/lib/db/schema";

// United Club Infinite credits — lower confidence, verify against Chase docs before launch
// Credits marked active: false should be verified and enabled from /admin/credits
export const unitedCredits: Omit<Credit, "id">[] = [
  {
    cardId: "united_club_infinite",
    name: "Global Entry / TSA PreCheck credit",
    amountCents: 12000,
    description: "$120 Global Entry/TSA PreCheck credit. Resets every 4 years on anniversary.",
    activationUrl: null,
    deadlineType: "anniversary",
    deadlineMonth: null,
    deadlineDay: null,
    frequency: "annual", // technically every 4 years, but annual reminder is safe
    expiresAfterYear: null,
    active: true,
    lowPriority: false,
  },
  {
    cardId: "united_club_infinite",
    name: "Annual United travel credit",
    amountCents: 10000, // verify current value
    description: "Annual United travel credit resets on your card anniversary. Verify current amount.",
    activationUrl: null,
    deadlineType: "anniversary",
    deadlineMonth: null,
    deadlineDay: null,
    frequency: "annual",
    expiresAfterYear: null,
    active: false, // verify value before enabling
    lowPriority: false,
  },
];
