"use client";

import { FormEvent, useEffect, useState } from "react";

type Payment = {
  id: string;
  clientId: string;
  orderId: string;
  amount: string | number;
  paymentDate: string;
  paymentMethod: string | null;
  reference: string | null;
  notes: string | null;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    orderId: "",
    amount: "",
    paymentDate: "",
    paymentMethod: "",
    reference: "",
    notes: "",
  });

  async function loadPayments() {
    try {
      const response = await fetch("/api/payments", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message ?? "Failed to load payments.");
        return;
      }

      setPayments(
        Array.isArray(result.payments) ? result.payments : [],
      );
    } catch {
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: form.clientId,
          orderId: form.orderId,
          amount: form.amount,
          paymentDate: form.paymentDate || undefined,
          paymentMethod: form.paymentMethod || undefined,
          reference: form.reference || undefined,
          notes: form.notes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message ?? "Failed to create payment.");
        return;
      }

      setSuccess("Payment created successfully.");

      setForm({
        clientId: "",
        orderId: "",
        amount: "",
        paymentDate: "",
        paymentMethod: "",
        reference: "",
        notes: "",
      });

      setShowForm(false);
      await loadPayments();
    } catch {
      setError("Failed to create payment.");
    } finally {
      setSaving(false);
    }
  }

  const totalAmount = payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payments
            </h1>

            <p className="mt-2 text-gray-600">
              Track client payments and transaction details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((value) => !value);
              setError("");
              setSuccess("");
            }}
            className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
          >
            {showForm ? "Cancel" : "Add Payment"}
          </button>
        </div>

        {showForm && (
          <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Payment
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Client ID
                </label>

                <input
                  required
                  value={form.clientId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      clientId: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                  placeholder="Enter client ID"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Order ID
                </label>

                <input
                  required
                  value={form.orderId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      orderId: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                  placeholder="Enter order ID"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Amount
                </label>

                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Payment Date
                </label>

                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      paymentDate: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Payment Method
                </label>

                <select
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      paymentMethod: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                >
                  <option value="">Select method</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Reference
                </label>

                <input
                  value={form.reference}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reference: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                  placeholder="Transaction reference"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes: event.target.value,
                    })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-gray-900"
                  placeholder="Optional notes"
                />
              </div>

              {error && (
                <p className="md:col-span-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </section>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Payments</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {payments.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Amount</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment History
          </h2>

          {loading ? (
            <p className="mt-6 text-gray-600">
              Loading payments...
            </p>
          ) : error && payments.length === 0 ? (
            <p className="mt-6 text-red-600">{error}</p>
          ) : payments.length === 0 ? (
            <p className="mt-6 text-gray-600">
              No payments recorded yet.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Order ID</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {new Date(
                          payment.paymentDate,
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {payment.paymentMethod ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {payment.reference ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500">
                        {payment.orderId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}