"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  PageContainer,
  Logo,
  Checkbox,
} from "@/components/ui";

const CARD_GROUPS = [
  {
    issuer: "Chase",
    cards: [
      { id: "csr", name: "Chase Sapphire Reserve", description: "$795/yr — $2,200+ in credits (dining, StubHub, hotel, travel)" },
      { id: "united_club_infinite", name: "United Club Infinite", description: "$525/yr — Global Entry, travel credit" },
      { id: "world_of_hyatt", name: "World of Hyatt", description: "$95/yr — Free night certificate, DashPass" },
      { id: "ihg_premier", name: "IHG One Rewards Premier", description: "$99/yr — Free night, United TravelBank cash" },
    ],
  },
  {
    issuer: "American Express",
    cards: [
      { id: "amex_platinum", name: "Amex Platinum", description: "$895/yr — $3,500+ in credits (Uber, Resy, Lululemon, FHR, Saks)" },
      { id: "amex_gold", name: "Amex Gold", description: "$325/yr — Uber, dining, Dunkin', Resy credits" },
      { id: "hilton_aspire", name: "Hilton Honors Aspire", description: "$550/yr — Resort, airline, CLEAR+ credits" },
      { id: "marriott_brilliant", name: "Marriott Bonvoy Brilliant", description: "$650/yr — $25/mo dining, Ritz/St. Regis property credit" },
      { id: "delta_reserve", name: "Delta SkyMiles Reserve", description: "$650/yr — Resy, rides, Delta Stays, companion cert" },
    ],
  },
  {
    issuer: "Capital One",
    cards: [
      { id: "venture_x", name: "Capital One Venture X", description: "$395/yr — $300 travel credit, Global Entry" },
    ],
  },
  {
    issuer: "Citi",
    cards: [
      { id: "citi_strata_premier", name: "Citi Strata Premier", description: "$250/yr — $100 hotel credit" },
      { id: "citi_strata_elite", name: "Citi Strata Elite", description: "$595/yr — Hotel, Splurge, Blacklane credits" },
    ],
  },
  {
    issuer: "Other",
    cards: [
      { id: "bofa_premium_elite", name: "BofA Premium Rewards Elite", description: "$550/yr — $300 airline + $150 lifestyle credits" },
      { id: "altitude_reserve", name: "U.S. Bank Altitude Reserve", description: "$400/yr — $325 travel credit" },
      { id: "bilt_palladium", name: "Bilt Palladium", description: "$495/yr — Hotel, Grubhub, Gopuff, Bilt Cash credits" },
    ],
  },
];

// Cards that have anniversary-based credits
const ANNIVERSARY_CARDS = [
  "csr",
  "united_club_infinite",
  "amex_platinum",
  "venture_x",
  "delta_reserve",
  "altitude_reserve",
  "world_of_hyatt",
  "ihg_premier",
  "citi_strata_elite",
  "bofa_premium_elite",
];

export default function CardsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setPlan(d.plan || "free"))
      .catch(() => {});
  }, []);

  const isFree = plan !== "pro";
  const atLimit = isFree && selected.length >= 1;

  function toggleCard(cardId: string) {
    if (selected.includes(cardId)) {
      setSelected((prev) => prev.filter((id) => id !== cardId));
      return;
    }
    if (atLimit) {
      setError("Free plan allows 1 card. Upgrade to Pro for unlimited.");
      return;
    }
    setSelected((prev) => [...prev, cardId]);
    setError("");
  }

  async function handleContinue() {
    if (selected.length === 0) {
      setError("Select at least one card");
      return;
    }
    setError("");

    const needsAnniversary = selected.some((id) =>
      ANNIVERSARY_CARDS.includes(id)
    );

    if (needsAnniversary) {
      sessionStorage.setItem("selected_cards", JSON.stringify(selected));
      router.push("/onboarding/anniversary");
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/onboarding/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardIds: selected }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to save");
          setLoading(false);
          return;
        }
        router.push("/onboarding/done");
      } catch {
        setError("Something went wrong");
        setLoading(false);
      }
    }
  }

  return (
    <PageContainer className="max-w-lg">
      <div className="mb-8 text-center">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Which cards do you have?
        </h1>
        <p className="mt-2 text-gray-600">
          Select the cards you want reminders for.
        </p>
      </div>

      <div className="space-y-6">
        {CARD_GROUPS.map((group) => (
          <div key={group.issuer}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.issuer}
            </h3>
            <div className="space-y-2">
              {group.cards.map((card) => (
                <Checkbox
                  key={card.id}
                  label={card.name}
                  description={card.description}
                  checked={selected.includes(card.id)}
                  onChange={() => toggleCard(card.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isFree && (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center text-sm text-yellow-800">
          Free plan — 1 card.{" "}
          <a href="/upgrade" className="font-semibold underline">
            Upgrade to Pro ($10/yr)
          </a>{" "}
          for unlimited cards + monthly reminders.
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleContinue}
        disabled={loading || selected.length === 0}
        className="mt-6 w-full"
      >
        {loading ? "Saving..." : `Continue with ${selected.length} card${selected.length !== 1 ? "s" : ""}`}
      </Button>
    </PageContainer>
  );
}
