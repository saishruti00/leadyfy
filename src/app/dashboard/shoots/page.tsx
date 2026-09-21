"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Shoot = {
  id: string;
  clientId: string;
  orderId: string;
  dateTime: string;
  location: string;
creatorId: string | null;
  cameraman: string | null;
  shootManager: string | null;
  shootingAssistant: string | null;
  approvedScripts: string | null;
  specialNotes: string | null;
  status: string;
};

export default function ShootsPage() {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadShoots() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/shoots", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message ?? "Failed to load shoots.");
          return;
        }

        setShoots(data.shoots ?? []);
      } catch {
        setError("Failed to load shoots.");
      } finally {
        setLoading(false);
      }
    }

    loadShoots();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              Shoot Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage scheduled shoots and production teams.
            </p>
          </div>

          <Link
  href="/dashboard/shoots/create"
  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
>
  + Create Shoot
</Link>
        </header>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Shoots
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {shoots.length} shoot{shoots.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {loading && (
            <p className="mt-6 text-gray-600">
              Loading shoots...
            </p>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && shoots.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium text-gray-900">
                No shoots found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Create a shoot to start managing production.
              </p>
            </div>
          )}

          {!loading && !error && shoots.length > 0 && (
            <div className="mt-6 space-y-4">
              {shoots.map((shoot) => (
                <article
                  key={shoot.id}
                  className="rounded-xl border p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          Shoot #{shoot.id.slice(-6)}
                        </h3>

                        <StatusBadge status={shoot.status} />
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <Info
                          label="Client"
                          value={shoot.clientId}
                        />

                        <Info
                          label="Order"
                          value={shoot.orderId}
                        />

                        <Info
                          label="Date & Time"
                          value={
                            shoot.dateTime
                              ? new Date(
                                  shoot.dateTime,
                                ).toLocaleString("en-IN")
                              : null
                          }
                        />

                        <Info
                          label="Location"
                          value={shoot.location}
                        />

                        <Info
  label="Assigned Creator"
  value={shoot.creatorId}
/>

                        <Info
                          label="Cameraman"
                          value={shoot.cameraman}
                        />

                        <Info
                          label="Shoot Manager"
                          value={shoot.shootManager}
                        />

                        <Info
                          label="Shooting Assistant"
                          value={shoot.shootingAssistant}
                        />
                      </div>

                      {(shoot.approvedScripts ||
                        shoot.specialNotes) && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <Info
                            label="Approved Scripts"
                            value={shoot.approvedScripts}
                          />

                          <Info
                            label="Special Notes"
                            value={shoot.specialNotes}
                          />
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/shoots/${shoot.id}`}
                      className="w-fit rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm text-gray-900">
        {value || "Not assigned"}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}