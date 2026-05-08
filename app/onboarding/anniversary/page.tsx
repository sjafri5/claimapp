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
      <div className="mb-8 text-center">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          When does your card year reset?
        </h1>
        <p className="mt-2 text-gray-600">
          Check your statement for the anniversary date. This helps us time the
          $300 travel credit and similar anniversary-based benefits. You can skip
          this.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                // Skip without setting anniversaries
                setAnniversaryCsr("");
                setAnniversaryUnited("");
                handleSubmit();
              }}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
