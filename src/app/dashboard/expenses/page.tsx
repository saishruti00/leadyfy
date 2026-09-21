"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  Loader2,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description?: string | null;
  amount: string | number;
  expenseDate: string;
  paymentMethod?: string | null;
  receiptLink?: string | null;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    receiptLink: "",
  });

  async function loadExpenses() {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create expense");
        return;
      }

      setMessage("Expense added successfully.");

      setForm({
        category: "",
        description: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMethod: "",
        receiptLink: "",
      });

      await loadExpenses();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage company expenses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3">
              <Wallet className="h-5 w-5 text-gray-700" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalExpenses.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3">
              <Receipt className="h-5 w-5 text-gray-700" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Expense Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Add Expense</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>
            <input
              required
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              placeholder="Office, Travel, Marketing..."
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
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
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                placeholder="0.00"
                className="w-full rounded-lg border py-2 pl-9 pr-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Expense Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                required
                type="date"
                value={form.expenseDate}
                onChange={(e) =>
                  setForm({ ...form, expenseDate: e.target.value })
                }
                className="w-full rounded-lg border py-2 pl-9 pr-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Payment Method
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
              className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="">Select method</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Add expense details..."
              rows={3}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Receipt Link
            </label>
            <input
              type="url"
              value={form.receiptLink}
              onChange={(e) =>
                setForm({ ...form, receiptLink: e.target.value })
              }
              placeholder="https://..."
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gray-900"
            />
          </div>

          {message && (
            <p className="text-sm text-gray-600 md:col-span-2">
              {message}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Expense History</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No expenses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b last:border-0">
                    <td className="px-6 py-4 font-medium">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {expense.description || "—"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {expense.paymentMethod || "—"}
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