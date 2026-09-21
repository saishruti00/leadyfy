"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Shoot = {
  id: string;
  clientId: string;
  orderId: string;
  creatorId: string | null;
  dateTime: string;
  location: string;
  cameraman: string | null;
  shootManager: string | null;
  shootingAssistant: string | null;
  approvedScripts: string | null;
  specialNotes: string | null;
  status: string;
  footageUploaded: boolean;
  rawFileIntegrityChecked: boolean;
  reshootRequired: boolean;
};

export default function ShootDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadShoot() {
      try {
        const response = await fetch(`/api/shoots/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message ?? "Failed to load shoot.");
          return;
        }

        setShoot(data.shoot);
      } catch {
        setError("Failed to load shoot.");
      } finally {
        setLoading(false);
      }
    }

    loadShoot();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-600">Loading shoot...</p>
        </div>
      </main>
    );
  }

  if (error || !shoot) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/shoots"
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            ← Back to Shoots
          </Link>

          <p className="mt-6 text-red-600">
            {error || "Shoot not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/shoots"
          className="text-sm font-medium text-gray-700 hover:underline"
        >
          ← Back to Shoots
        </Link>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Shoot #{shoot.id.slice(-6)}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Shoot Details
              </h1>
            </div>

            <StatusBadge status={shoot.status} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info label="Client ID" value={shoot.clientId} />
            <Info label="Order ID" value={shoot.orderId} />
            <Info label="Creator ID" value={shoot.creatorId} />

            <Info
              label="Date & Time"
              value={
                shoot.dateTime
                  ? new Date(shoot.dateTime).toLocaleString("en-IN")
                  : null
              }
            />

            <Info label="Location" value={shoot.location} />
            <Info label="Cameraman" value={shoot.cameraman} />
            <Info label="Shoot Manager" value={shoot.shootManager} />
            <Info
              label="Shooting Assistant"
              value={shoot.shootingAssistant}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Shoot Information
            </h2>

            <div className="mt-4 space-y-4">
              <Info
                label="Approved Scripts"
                value={shoot.approvedScripts}
              />

              <Info
                label="Special Notes"
                value={shoot.specialNotes}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Post-Shoot Verification
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Verification
                label="Footage Uploaded"
                value={shoot.footageUploaded}
              />

              <Verification
                label="Raw File Integrity"
                value={shoot.rawFileIntegrityChecked}
              />

              <Verification
                label="Reshoot Required"
                value={shoot.reshootRequired}
                negative
              />
            </div>
          </div>
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
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm text-gray-900">
        {value || "Not assigned"}
      </p>
    </div>
  );
}

function Verification({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: boolean;
  negative?: boolean;
}) {
  const positive = negative ? !value : value;

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          positive ? "text-green-700" : "text-red-700"
        }`}
      >
        {value ? "Yes" : "No"}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}