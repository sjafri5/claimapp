import type { Card } from "@/lib/db/schema";

export const cardSeeds: Card[] = [
  // Chase
  { id: "csr", name: "Chase Sapphire Reserve", issuer: "Chase" },
  { id: "united_club_infinite", name: "United Club Infinite", issuer: "Chase" },
  { id: "world_of_hyatt", name: "World of Hyatt", issuer: "Chase" },
  { id: "ihg_premier", name: "IHG One Rewards Premier", issuer: "Chase" },

  // American Express
  { id: "amex_platinum", name: "Amex Platinum", issuer: "American Express" },
  { id: "amex_gold", name: "Amex Gold", issuer: "American Express" },
  { id: "hilton_aspire", name: "Hilton Honors Aspire", issuer: "American Express" },
  { id: "marriott_brilliant", name: "Marriott Bonvoy Brilliant", issuer: "American Express" },
  { id: "delta_reserve", name: "Delta SkyMiles Reserve", issuer: "American Express" },

  // Capital One
  { id: "venture_x", name: "Capital One Venture X", issuer: "Capital One" },

  // Citi
  { id: "citi_strata_premier", name: "Citi Strata Premier", issuer: "Citi" },
  { id: "citi_strata_elite", name: "Citi Strata Elite", issuer: "Citi" },

  // Bank of America
  { id: "bofa_premium_elite", name: "Premium Rewards Elite", issuer: "Bank of America" },

  // U.S. Bank
  { id: "altitude_reserve", name: "Altitude Reserve", issuer: "U.S. Bank" },

  // Bilt
  { id: "bilt_palladium", name: "Bilt Palladium", issuer: "Bilt Rewards" },
];
