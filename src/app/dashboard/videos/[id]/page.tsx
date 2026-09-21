"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type VideoDeliverable = {
  id: string;
  clientId: string;
  orderId: string;
  scriptId: string | null;
  creatorId: string | null;
  shootId: string | null;
  assignedEditorId: string | null;
  videoNumber: number;
  title: string;
  status: string;
  deadline: string | null;
  videoFileLink: string | null;
  thumbnail: string | null;
  clientFeedbackLog: string | null;
  revisionCount: number;
  finalDeliveryLink: string | null;
};

const pipelineStages = [
  "SCRIPT_APPROVED",
  "SHOOT_PENDING",
  "RAW_FOOTAGE_RECEIVED",
  "VIDEO_EDITING",
  "INTERNAL_QA",
  "CLIENT_REVIEW",
  "REVISION",
  "FINAL_APPROVED",
  "DELIVERED",
];

export default function VideoDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [video, setVideo] = useState<VideoDeliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function loadVideo() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/video-deliverables/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Failed to load video.");
        return;
      }

      setVideo(data.videoDeliverable);
    } catch {
      setError("Failed to load video.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideo();
  }, [id]);

  async function handleNextStatus() {
    if (!video) return;

    const currentIndex = pipelineStages.indexOf(video.status);

    if (
      currentIndex === -1 ||
      currentIndex === pipelineStages.length - 1
    ) {
      return;
    }

    const nextStatus = pipelineStages[currentIndex + 1];

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(`/api/video-deliverables/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Failed to update video status.");
        return;
      }

      setVideo(data.videoDeliverable);
    } catch {
      setError("Failed to update video status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-600">Loading video...</p>
        </div>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-red-600">
            {error || "Video deliverable not found."}
          </p>
        </div>
      </main>
    );
  }

  const currentStage = pipelineStages.indexOf(video.status);

  const nextStatus =
    currentStage >= 0 && currentStage < pipelineStages.length - 1
      ? pipelineStages[currentStage + 1]
      : null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Video #{video.videoNumber}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {video.title}
              </h1>
            </div>

            <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              {video.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Production Pipeline
              </h2>

              {nextStatus && (
                <button
                  type="button"
                  onClick={handleNextStatus}
                  disabled={updating}
                  className="w-fit rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating
                    ? "Updating..."
                    : `Move to ${nextStatus.replaceAll("_", " ")}`}
                </button>
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {pipelineStages.map((stage, index) => {
                const isActive = index === currentStage;

                const isCompleted =
                  currentStage >= 0 && index < currentStage;

                return (
                  <span
                    key={stage}
                    className={`rounded-full px-3 py-2 text-xs font-medium ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : isCompleted
                          ? "bg-gray-200 text-gray-800"
                          : "border bg-white text-gray-500"
                    }`}
                  >
                    {stage.replaceAll("_", " ")}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info
              label="Client ID"
              value={video.clientId}
            />

            <Info
              label="Order ID"
              value={video.orderId}
            />

            <Info
              label="Script ID"
              value={video.scriptId}
            />

            <Info
              label="Creator ID"
              value={video.creatorId}
            />

            <Info
              label="Shoot ID"
              value={video.shootId}
            />

            <Info
              label="Assigned Editor"
              value={video.assignedEditorId}
            />

            <Info
              label="Deadline"
              value={
                video.deadline
                  ? new Date(video.deadline).toLocaleString("en-IN")
                  : null
              }
            />

            <Info
              label="Revision Count"
              value={String(video.revisionCount)}
            />
          </div>

          <div className="mt-8 space-y-4">
            <Info
              label="Video File"
              value={video.videoFileLink}
            />

            <Info
              label="Thumbnail"
              value={video.thumbnail}
            />

            <Info
              label="Client Feedback"
              value={video.clientFeedbackLog}
            />

            <Info
              label="Final Delivery Link"
              value={video.finalDeliveryLink}
            />
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