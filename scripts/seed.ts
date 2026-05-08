import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../lib/db/schema";
import { cardSeeds } from "../lib/seeds/cards";
import { csrCredits } from "../lib/seeds/credits.csr";
import { unitedCredits } from "../lib/seeds/credits.united";
import { amexPlatinumCredits } from "../lib/seeds/credits.amex-platinum";
import { amexGoldCredits } from "../lib/seeds/credits.amex-gold";
import { hiltonAspireCredits } from "../lib/seeds/credits.hilton-aspire";
import { marriottBrilliantCredits } from "../lib/seeds/credits.marriott-brilliant";
import { deltaReserveCredits } from "../lib/seeds/credits.delta-reserve";
import { ventureXCredits } from "../lib/seeds/credits.venture-x";
import { citiStrataPremierCredits, citiStrataEliteCredits } from "../lib/seeds/credits.citi";
import {
  bofaPremiumEliteCredits,
  altitudeReserveCredits,
  worldOfHyattCredits,
  ihgPremierCredits,
  biltPalladiumCredits,
} from "../lib/seeds/credits.other";

const allCredits = [
  { name: "CSR", credits: csrCredits },
  { name: "United Club Infinite", credits: unitedCredits },
  { name: "Amex Platinum", credits: amexPlatinumCredits },
  { name: "Amex Gold", credits: amexGoldCredits },
  { name: "Hilton Aspire", credits: hiltonAspireCredits },
  { name: "Marriott Brilliant", credits: marriottBrilliantCredits },
  { name: "Delta Reserve", credits: deltaReserveCredits },
  { name: "Venture X", credits: ventureXCredits },
  { name: "Citi Strata Premier", credits: citiStrataPremierCredits },
  { name: "Citi Strata Elite", credits: citiStrataEliteCredits },
  { name: "BofA Premium Elite", credits: bofaPremiumEliteCredits },
  { name: "Altitude Reserve", credits: altitudeReserveCredits },
  { name: "World of Hyatt", credits: worldOfHyattCredits },
  { name: "IHG Premier", credits: ihgPremierCredits },
  { name: "Bilt Palladium", credits: biltPalladiumCredits },
];

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  console.log("Seeding cards...");
  for (const card of cardSeeds) {
    await db
      .insert(schema.cards)
      .values(card)
      .onConflictDoUpdate({
        target: schema.cards.id,
        set: { name: card.name, issuer: card.issuer },
      });
  }
  console.log(`  Seeded ${cardSeeds.length} cards`);

  for (const { name, credits } of allCredits) {
    console.log(`Seeding ${name} credits...`);
    for (const credit of credits) {
      await db.insert(schema.credits).values(credit);
    }
    console.log(`  Seeded ${credits.length} ${name} credits`);
  }

  const totalCredits = allCredits.reduce((sum, c) => sum + c.credits.length, 0);
  console.log(`\nDone! ${cardSeeds.length} cards, ${totalCredits} credits total.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
