"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  IndianRupee,
  Loader2,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

interface Creator {
  id: string;
  name: string;
}

interface CreatorPayout {
  id: string;
  creatorId: string;
  amount: string;
  payoutDate: string;
  paymentMethod: string | null;
  reference: string | null;
  notes: string | null;
  creator: Creator;
}

export default function CreatorPayoutsPage() {
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    creatorId: "cmu9huv7n000654iftv6cta40",
    amount: "",
    payoutDate: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    reference: "",
    notes: "",
  });

  const fetchPayouts = async () => {
    try {
      const response = await fetch("/api/creator-payouts");

      if (!response.ok) {
        throw new Error("Failed to fetch payouts");
      }

      const data = await response.json();
      setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
    } catch {
      setMessage("Failed to load creator payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/creator-payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: form.creatorId,
          amount: Number(form.amount),
          payoutDate: form.payoutDate,
          paymentMethod: form.paymentMethod || undefined,
          reference: form.reference || undefined,
          notes: form.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payout");
      }

      setMessage("Creator payout created successfully");

      setForm((current) => ({
        ...current,
        amount: "",
        paymentMethod: "",
        reference: "",
        notes: "",
      }));

      await fetchPayouts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create creator payout",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = payouts.reduce(
    (total, payout) => total + Number(payout.amount),
    0,
  );

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Creator Payouts
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage payments made to creators.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3">
              <Receipt className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Payouts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {payouts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3">
              <Wallet className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">
            Add Creator Payout
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Creator ID
            </label>
            <input
              required
              value={form.creatorId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  creatorId: event.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Creator ID"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                className="w-full rounded-lg border py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="5000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Payout Date
            </label>
            <input
              required
              type="date"
              value={form.payoutDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  payoutDate: event.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <input
              value={form.paymentMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  paymentMethod: event.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="UPI / Bank Transfer / Cash"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reference
            </label>
            <input
              value={form.reference}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  reference: event.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="PAYOUT-001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <input
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Optional notes"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Saving..." : "Add Payout"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {message}
          </p>
        )}
      </section>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">Payout History</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : payouts.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No payouts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Creator
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Method
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-600">
                    Reference
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {payout.creator?.name || "Unknown Creator"}
                    </td>
                    <td className="px-6 py-4">
                      ₹{Number(payout.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(payout.payoutDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payout.paymentMethod || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payout.reference || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}