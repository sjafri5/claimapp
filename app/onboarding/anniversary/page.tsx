"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, PageContainer, Logo, Card } from "@/components/ui";

export default function AnniversaryPage() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [anniversaryCsr, setAnniversaryCsr] = useState("");
  const [anniversaryUnited, setAnniversaryUnited] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("selected_cards");
    if (!stored) {
      router.push("/onboarding/cards");
      return;
    }
    setSelectedCards(JSON.parse(stored));
  }, [router]);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardIds: selectedCards,
          anniversaryCsr: anniversaryCsr || null,
          anniversaryUnited: anniversaryUnited || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setLoading(false);
        return;
      }

      sessionStorage.removeItem("selected_cards");
      router.push("/onboarding/done");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <PageContainer>
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
          When does your card year reset?
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
          Check your statement for the anniversary date. This helps us time the
          $300 travel credit and similar anniversary-based benefits. You can skip
          this.
        </p>
      </div>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedCards.includes("csr") && (
            <Input
              label="Chase Sapphire Reserve anniversary"
              type="date"
              value={anniversaryCsr}
              onChange={setAnniversaryCsr}
            />
          )}

          {selectedCards.includes("united_club_infinite") && (
            <Input
              label="United Club Infinite anniversary"
              type="date"
              value={anniversaryUnited}
              onChange={setAnniversaryUnited}
            />
          )}

          {error && (
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 15,
                color: "#c98a8a",
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Button
                variant="secondary"
                onClick={() => {
                  // Skip without setting anniversaries
                  setAnniversaryCsr("");
                  setAnniversaryUnited("");
                  handleSubmit();
                }}
                className="w-full"
              >
                Skip
              </Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
