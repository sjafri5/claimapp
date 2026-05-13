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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setPlan(d.plan || "free");
        setIsAdmin(d.isAdmin || false);
      })
      .catch(() => {});
  }, []);

  const isPro = plan === "pro" || isAdmin;
  const needsUpgrade = !isPro && selected.length > 1;

  function toggleCard(cardId: string) {
    setSelected((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
    setError("");
  }

  async function handleContinue() {
    if (selected.length === 0) {
      setError("Select at least one card");
      return;
    }
    setError("");

    // Store selected cards for after checkout/anniversary
    sessionStorage.setItem("selected_cards", JSON.stringify(selected));

    // If free user picked >1, send to checkout first
    if (needsUpgrade) {
      setLoading(true);
      try {
        const res = await fetch("/api/stripe/checkout", { method: "POST" });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } catch {
        setError("Something went wrong with checkout");
        setLoading(false);
        return;
      }
    }

    const needsAnniversary = selected.some((id) =>
      ANNIVERSARY_CARDS.includes(id)
    );

    if (needsAnniversary) {
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
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Logo />
        <h1
          style={{
            marginTop: 24,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: 28,
            fontStyle: "italic",
            color: "#3a342b",
          }}
        >
          Which cards do you have?
        </h1>
        <p
          style={{
            marginTop: 8,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 16,
            fontStyle: "italic",
            color: "#6b5f4d",
            lineHeight: 1.6,
          }}
        >
          Select the cards you want reminders for.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {CARD_GROUPS.map((group) => (
          <div key={group.issuer}>
            <h3
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20,
                color: "#6b5f4d",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              {group.issuer}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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

      {needsUpgrade && (
        <div
          style={{
            marginTop: 16,
            border: "1px solid #6f8a5e",
            background: "rgba(155,176,138,.08)",
            padding: 14,
            textAlign: "center",
            fontFamily: "'Caveat', cursive",
            fontSize: 16,
            color: "#3a342b",
          }}
        >
          {selected.length} cards selected — Pro plan ($10/yr) will be applied at checkout.
          <br />
          <span style={{ fontSize: 14, color: "#6b5f4d" }}>
            Or select just 1 card to continue free.
          </span>
        </div>
      )}

      {error && (
        <p
          style={{
            marginTop: 12,
            fontFamily: "'Caveat', cursive",
            fontSize: 15,
            color: "#c98a8a",
          }}
        >
          {error}
        </p>
      )}

      <div style={{ marginTop: 24 }}>
        <Button
          onClick={handleContinue}
          disabled={loading || selected.length === 0}
          className="w-full"
        >
          {loading
            ? "Saving..."
            : needsUpgrade
              ? `Continue with ${selected.length} cards — $10/yr`
              : `Continue with ${selected.length} card${selected.length !== 1 ? "s" : ""} — free`}
        </Button>
      </div>
    </PageContainer>
  );
}
