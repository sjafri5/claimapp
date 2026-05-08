"use client";

import { useState, useEffect } from "react";
import { Button, Input, PageContainer, Logo, Card } from "@/components/ui";

interface CreditItem {
  id: string;
  cardId: string;
  name: string;
  amountCents: number;
  description: string;
  activationUrl: string | null;
  deadlineType: string;
  deadlineMonth: number | null;
  deadlineDay: number | null;
  frequency: string;
  expiresAfterYear: number | null;
  active: boolean;
  lowPriority: boolean;
}

export default function AdminCreditsPage() {
  const [credits, setCredits] = useState<CreditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreditItem>>({});

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      const res = await fetch("/api/admin/credits");
      if (res.status === 401) {
        setError("Unauthorized — admin access required");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCredits(data);
      setLoading(false);
    } catch {
      setError("Failed to load credits");
      setLoading(false);
    }
  }

  async function saveEdit() {
    if (!editingId) return;

    try {
      const res = await fetch("/api/admin/credits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setEditingId(null);
      setEditForm({});
      fetchCredits();
    } catch {
      setError("Failed to save");
    }
  }

  function startEdit(credit: CreditItem) {
    setEditingId(credit.id);
    setEditForm({
      name: credit.name,
      amountCents: credit.amountCents,
      description: credit.description,
      deadlineMonth: credit.deadlineMonth,
      deadlineDay: credit.deadlineDay,
      active: credit.active,
      lowPriority: credit.lowPriority,
    });
  }

  if (loading) {
    return (
      <PageContainer>
        <Logo />
        <p className="mt-8 text-center text-gray-500">Loading...</p>
      </PageContainer>
    );
  }

  if (error === "Unauthorized — admin access required") {
    return (
      <PageContainer>
        <Logo />
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">Admin access required</p>
          <p className="mt-1 text-sm text-red-600">
            Sign in with the admin phone number to access this page.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
          Admin
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Manage credits</h1>
      <p className="mt-1 text-gray-600">
        Edit credit deadlines and settings without redeploying.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {credits.map((credit) => (
          <div
            key={credit.id}
            className={`rounded-xl border p-4 ${
              credit.active
                ? "border-gray-200 bg-white"
                : "border-gray-100 bg-gray-50 opacity-60"
            }`}
          >
            {editingId === credit.id ? (
              <div className="space-y-3">
                <Input
                  label="Name"
                  value={editForm.name ?? ""}
                  onChange={(val) =>
                    setEditForm((p) => ({ ...p, name: val }))
                  }
                />
                <Input
                  label="Amount (cents)"
                  type="number"
                  value={String(editForm.amountCents ?? "")}
                  onChange={(val) =>
                    setEditForm((p) => ({
                      ...p,
                      amountCents: parseInt(val) || 0,
                    }))
                  }
                />
                <Input
                  label="Description"
                  value={editForm.description ?? ""}
                  onChange={(val) =>
                    setEditForm((p) => ({ ...p, description: val }))
                  }
                />
                <div className="flex gap-3">
                  <Input
                    label="Deadline month (1-12)"
                    type="number"
                    value={String(editForm.deadlineMonth ?? "")}
                    onChange={(val) =>
                      setEditForm((p) => ({
                        ...p,
                        deadlineMonth: parseInt(val) || null,
                      }))
                    }
                    className="flex-1"
                  />
                  <Input
                    label="Deadline day (1-31)"
                    type="number"
                    value={String(editForm.deadlineDay ?? "")}
                    onChange={(val) =>
                      setEditForm((p) => ({
                        ...p,
                        deadlineDay: parseInt(val) || null,
                      }))
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.active ?? true}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          active: e.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.lowPriority ?? false}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          lowPriority: e.target.checked,
                        }))
                      }
                    />
                    Low priority
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEdit}>Save</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {credit.name}
                    {!credit.active && (
                      <span className="ml-2 text-xs text-gray-400">
                        (inactive)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{credit.description}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {credit.cardId} · {credit.frequency} ·{" "}
                    {credit.deadlineType}
                    {credit.deadlineMonth &&
                      ` · ${credit.deadlineMonth}/${credit.deadlineDay}`}
                    {credit.lowPriority && " · low priority"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">
                    ${credit.amountCents / 100}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => startEdit(credit)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
