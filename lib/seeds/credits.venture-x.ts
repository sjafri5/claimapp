import type { Credit } from "@/lib/db/schema";

export const ventureXCredits: Omit<Credit, "id">[] = [
  {
    cardId: "venture_x",
    name: "Travel credit",
    amountCents: 30000,
    description: "$300 travel credit resets on anniversary. Must book through Capital One Travel.",
    activationUrl: null,
    deadlineType: "anniversary",
    deadlineMonth: null,
    deadlineDay: null,
    frequency: "annual",
    expiresAfterYear: null,
    active: true,
    lowPriority: false,
  },
  {
    cardId: "venture_x",
    name: "Global Entry / TSA PreCheck credit",
    amountCents: 12000,
    description: "$120 Global Entry/TSA PreCheck credit. Resets every 4 years.",
    activationUrl: null,
    deadlineType: "anniversary",
    deadlineMonth: null,
    deadlineDay: null,
    frequency: "annual",
    expiresAfterYear: null,
    active: true,
    lowPriority: false,
  },
];
