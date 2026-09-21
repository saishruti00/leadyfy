"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Client = {
  id: string;
  companyName: string | null;
  status?: string;
};

type Order = {
  id: string;
  packageName: string;
  contractedVideoCount: number;
  status: string;
  startDate: string | null;
  dueDate: string | null;
};

type Video = {
  id: string;
  videoNumber: number;
  title: string;
  status: string;
  deadline: string | null;
};

type Script = {
  id: string;
  videoNumber: number;
  language: string;
  scriptText: string;
  referenceLinks: string | null;
  deadline: string;
  revisionCount: number;
  comments: string | null;
  status: string;
};

type PortalData = {
  client: Client;
  orders: Order[];
  scripts: Script[];
  videos: Video[];
};

export default function ClientPortalPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(
    null,
  );
  const [feedbackComment, setFeedbackComment] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    async function loadPortal() {
      try {
        const response = await fetch("/api/clients/portal", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.message ?? "Failed to load client portal.");
          return;
        }

        const client = result.client ?? {};

        const orders: Order[] = Array.isArray(result.orders)
          ? result.orders
          : Array.isArray(client.orders)
            ? client.orders
            : [];

        const videos: Video[] = Array.isArray(result.videos)
          ? result.videos
          : Array.isArray(result.videoDeliverables)
            ? result.videoDeliverables
            : Array.isArray(client.videoDeliverables)
              ? client.videoDeliverables
              : [];

        const scripts: Script[] = Array.isArray(result.scripts)
          ? result.scripts
          : Array.isArray(client.scripts)
            ? client.scripts
            : [];

        setData({
          client: {
            id: client.id ?? "",
            companyName: client.companyName ?? "Client",
            status: client.status ?? "ACTIVE",
          },
          orders,
          scripts,
          videos,
        });
      } catch {
        setError("Failed to load client portal.");
      } finally {
        setLoading(false);
      }
    }

    loadPortal();
  }, []);

  const handleScriptFeedback = async (
    scriptId: string,
    action: "APPROVED" | "REVISION_REQUIRED",
  ) => {
    const comment = feedbackComment[scriptId]?.trim() ?? "";

    if (action === "REVISION_REQUIRED" && !comment) {
      alert("Please enter a comment for the revision request.");
      return;
    }

    try {
      setFeedbackLoading(`${scriptId}-${action}`);

      const response = await fetch(
        `/api/client/scripts/${scriptId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            comment: comment || null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to submit feedback",
        );
      }

      setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          scripts: current.scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  status: result.script.status,
                  revisionCount: result.script.revisionCount,
                  comments: result.script.comments,
                }
              : script,
          ),
        };
      });

      setFeedbackComment((current) => ({
        ...current,
        [scriptId]: "",
      }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit feedback",
      );
    } finally {
      setFeedbackLoading(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">
            Loading client portal...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const orders = Array.isArray(data.orders) ? data.orders : [];
  const scripts = Array.isArray(data.scripts) ? data.scripts : [];
  const videos = Array.isArray(data.videos) ? data.videos : [];

  const deliveredVideos = videos.filter(
    (video) => video.status === "DELIVERED",
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Client Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {data.client.companyName}
              </h1>

              <p className="mt-2 text-gray-600">
                Track your orders and video production progress.
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              {data.client.status}
            </span>
          </div>
        </header>

        {/* Summary */}
        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <SummaryCard
            label="Total Orders"
            value={orders.length}
          />

          <SummaryCard
            label="Total Videos"
            value={videos.length}
          />

          <SummaryCard
            label="Delivered Videos"
            value={deliveredVideos}
          />
        </section>

        {/* Orders */}
        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            My Orders
          </h2>

          {orders.length === 0 ? (
            <p className="mt-6 text-gray-600">
              No orders found.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {order.packageName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.contractedVideoCount} videos
                      </p>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Start Date"
                      value={formatDate(order.startDate)}
                    />

                    <Info
                      label="Due Date"
                      value={formatDate(order.dueDate)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Script Review */}
        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Script Review
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review scripts submitted for your orders.
            </p>
          </div>

          {scripts.length === 0 ? (
            <p className="mt-6 text-gray-600">
              No scripts available for review.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {scripts.map((script) => {
                const isSubmitting =
                  feedbackLoading?.startsWith(script.id) ?? false;

                return (
                  <article
                    key={script.id}
                    className="rounded-xl border p-5"
                  >
                    {/* Script Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Video #{script.videoNumber}
                        </p>

                        <h3 className="mt-1 font-semibold text-gray-900">
                          {script.language} Script
                        </h3>
                      </div>

                      <StatusBadge status={script.status} />
                    </div>

                    {/* Script Text */}
                    <div className="mt-5 rounded-lg bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Script
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                        {script.scriptText}
                      </p>
                    </div>

                    {/* Script Information */}
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Info
                        label="Deadline"
                        value={formatDate(script.deadline)}
                      />

                      <Info
                        label="Revisions"
                        value={String(script.revisionCount)}
                      />
                    </div>

                    {/* Existing Comments */}
                    {script.comments && (
                      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-yellow-700">
                          Comments
                        </p>

                        <p className="mt-1 text-sm text-yellow-900">
                          {script.comments}
                        </p>
                      </div>
                    )}

                    {/* Reference Links */}
                    {script.referenceLinks && (
                      <div className="mt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Reference Links
                        </p>

                        <p className="mt-1 break-all text-sm text-blue-600">
                          {script.referenceLinks}
                        </p>
                      </div>
                    )}

                    {/* Client Review Actions */}
                    {script.status === "SENT_TO_CLIENT" && (
                      <div className="mt-6 border-t pt-5">
                        <label
                          htmlFor={`feedback-${script.id}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Feedback
                        </label>

                        <textarea
                          id={`feedback-${script.id}`}
                          value={
                            feedbackComment[script.id] ?? ""
                          }
                          onChange={(event) =>
                            setFeedbackComment((current) => ({
                              ...current,
                              [script.id]: event.target.value,
                            }))
                          }
                          placeholder="Add a comment or revision request..."
                          rows={3}
                          disabled={isSubmitting}
                          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500 disabled:bg-gray-100"
                        />

                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleScriptFeedback(
                                script.id,
                                "APPROVED",
                              )
                            }
                            disabled={isSubmitting}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {feedbackLoading ===
                            `${script.id}-APPROVED`
                              ? "Approving..."
                              : "Approve Script"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleScriptFeedback(
                                script.id,
                                "REVISION_REQUIRED",
                              )
                            }
                            disabled={isSubmitting}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {feedbackLoading ===
                            `${script.id}-REVISION_REQUIRED`
                              ? "Submitting..."
                              : "Request Revision"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Review Completed */}
                    {script.status === "APPROVED" && (
                      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                          Script approved
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          This script is approved and ready for
                          the next production stage.
                        </p>
                      </div>
                    )}

                    {script.status === "REVISION_REQUIRED" && (
                      <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <p className="text-sm font-medium text-orange-800">
                          Revision requested
                        </p>

                        <p className="mt-1 text-sm text-orange-700">
                          Your revision request has been submitted.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Video Production */}
        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Video Production
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track the status of your videos.
          </p>

          {videos.length === 0 ? (
            <p className="mt-6 text-gray-600">
              No videos available yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/dashboard/videos/${video.id}`}
                  className="block rounded-xl border p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Video #{video.videoNumber}
                      </p>

                      <h3 className="mt-1 font-semibold text-gray-900">
                        {video.title}
                      </h3>

                      {video.deadline && (
                        <p className="mt-2 text-sm text-gray-500">
                          Deadline: {formatDate(video.deadline)}
                        </p>
                      )}
                    </div>

                    <StatusBadge status={video.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-IN");
}