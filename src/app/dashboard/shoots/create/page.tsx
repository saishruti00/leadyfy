"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const shootStatuses = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "RESHOOT_REQUIRED",
];

type FormData = {
  clientId: string;
  orderId: string;
  dateTime: string;
  location: string;
  assignedCreatorId: string;
  cameraman: string;
  shootManager: string;
  shootingAssistant: string;
  approvedScripts: string;
  specialNotes: string;
  status: string;
};

const initialForm: FormData = {
  clientId: "",
  orderId: "",
  dateTime: "",
  location: "",
  assignedCreatorId: "",
  cameraman: "",
  shootManager: "",
  shootingAssistant: "",
  approvedScripts: "",
  specialNotes: "",
  status: "SCHEDULED",
};

export default function CreateShootPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof FormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/shoots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: form.clientId,
          orderId: form.orderId,
          dateTime: form.dateTime,
          location: form.location,
         creatorId: form.assignedCreatorId,
          cameraman: form.cameraman || undefined,
          shootManager: form.shootManager || undefined,
          shootingAssistant:
            form.shootingAssistant || undefined,
          approvedScripts:
            form.approvedScripts || undefined,
          specialNotes: form.specialNotes || undefined,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Failed to create shoot.");
        return;
      }

      router.push("/dashboard/shoots");
    } catch {
      setError("Failed to create shoot.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/shoots"
          className="text-sm font-medium text-gray-600 hover:underline"
        >
          ← Back to Shoots
        </Link>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create Shoot
            </h1>

            <p className="mt-2 text-gray-600">
              Schedule and assign a new production shoot.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-8"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Booking Details
              </h2>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Client ID"
                  value={form.clientId}
                  onChange={(value) =>
                    updateField("clientId", value)
                  }
                  required
                  placeholder="Enter client ID"
                />

                <Field
                  label="Order ID"
                  value={form.orderId}
                  onChange={(value) =>
                    updateField("orderId", value)
                  }
                  required
                  placeholder="Enter order ID"
                />

                <Field
                  label="Date & Time"
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(value) =>
                    updateField("dateTime", value)
                  }
                  required
                />

                <Field
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    updateField("location", value)
                  }
                  required
                  placeholder="Enter shoot location"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Production Team
              </h2>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
               <Field
  label="Assigned Creator ID"
  value={form.assignedCreatorId}
  onChange={(value) =>
    updateField("assignedCreatorId", value)
  }
  placeholder="Enter creator ID"
  required
/>

                <Field
                  label="Cameraman"
                  value={form.cameraman}
                  onChange={(value) =>
                    updateField("cameraman", value)
                  }
                  placeholder="Enter cameraman name"
                />

                <Field
                  label="Shoot Manager"
                  value={form.shootManager}
                  onChange={(value) =>
                    updateField("shootManager", value)
                  }
                  placeholder="Enter shoot manager"
                />

                <Field
                  label="Shooting Assistant"
                  value={form.shootingAssistant}
                  onChange={(value) =>
                    updateField("shootingAssistant", value)
                  }
                  placeholder="Enter assistant name"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shoot Information
              </h2>

              <div className="mt-4 space-y-5">
                <div>
                  <label
                    htmlFor="approvedScripts"
                    className="text-sm font-medium text-gray-700"
                  >
                    Approved Scripts
                  </label>

                  <textarea
                    id="approvedScripts"
                    value={form.approvedScripts}
                    onChange={(event) =>
                      updateField(
                        "approvedScripts",
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="Enter approved script details or script IDs"
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="specialNotes"
                    className="text-sm font-medium text-gray-700"
                  >
                    Special Notes
                  </label>

                  <textarea
                    id="specialNotes"
                    value={form.specialNotes}
                    onChange={(event) =>
                      updateField(
                        "specialNotes",
                        event.target.value,
                      )
                    }
                    rows={4}
                    placeholder="Add special instructions or shoot notes"
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Shoot Status
                  </label>

                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900"
                  >
                    {shootStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard/shoots"
                className="rounded-lg border px-5 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Shoot"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-900"
      />
    </div>
  );
}