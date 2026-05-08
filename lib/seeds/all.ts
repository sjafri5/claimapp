import type { Credit } from "@/lib/db/schema";
import { csrCredits } from "./credits.csr";
import { unitedCredits } from "./credits.united";
import { amexPlatinumCredits } from "./credits.amex-platinum";
import { amexGoldCredits } from "./credits.amex-gold";
import { hiltonAspireCredits } from "./credits.hilton-aspire";
import { marriottBrilliantCredits } from "./credits.marriott-brilliant";
import { deltaReserveCredits } from "./credits.delta-reserve";
import { ventureXCredits } from "./credits.venture-x";
import { citiStrataPremierCredits, citiStrataEliteCredits } from "./credits.citi";
import {
  bofaPremiumEliteCredits,
  altitudeReserveCredits,
  worldOfHyattCredits,
  ihgPremierCredits,
  biltPalladiumCredits,
} from "./credits.other";

const allSeedArrays = [
  csrCredits,
  unitedCredits,
  amexPlatinumCredits,
  amexGoldCredits,
  hiltonAspireCredits,
  marriottBrilliantCredits,
  deltaReserveCredits,
  ventureXCredits,
  citiStrataPremierCredits,
  citiStrataEliteCredits,
  bofaPremiumEliteCredits,
  altitudeReserveCredits,
  worldOfHyattCredits,
  ihgPremierCredits,
  biltPalladiumCredits,
];

export function getAllSeedCredits(): (Omit<Credit, "id"> & { id: string })[] {
  const result: (Omit<Credit, "id"> & { id: string })[] = [];
  for (const arr of allSeedArrays) {
    for (let i = 0; i < arr.length; i++) {
      result.push({ ...arr[i], id: `seed-${arr[i].cardId}-${i}` });
    }
  }
  return result;
}
