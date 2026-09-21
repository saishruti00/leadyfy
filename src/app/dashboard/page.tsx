"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  role: string;
};

type VideoDeliverable = {
  id: string;
  orderId: string;
  videoNumber: number;
  title: string;
  status: string;
  deadline: string | null;
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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoDeliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [meResponse, videosResponse] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/video-deliverables", {
            cache: "no-store",
          }),
        ]);

        if (!meResponse.ok) {
          router.push("/login");
          return;
        }

        const meData = await meResponse.json();
        const videosData = await videosResponse.json();

        setUser(meData.user ?? null);

        if (videosData.success) {
          setVideos(videosData.videoDeliverables ?? []);
        }
      } catch (error) {
        console.error("DASHBOARD_LOAD_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const completed = videos.filter(
    (video) => video.status === "DELIVERED",
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const overdue = videos.filter((video) => {
    if (!video.deadline || video.status === "DELIVERED") {
      return false;
    }

    return new Date(video.deadline) < today;
  }).length;

  const dueToday = videos.filter((video) => {
    if (!video.deadline || video.status === "DELIVERED") {
      return false;
    }

    const deadline = new Date(video.deadline);

    return deadline >= today && deadline < tomorrow;
  }).length;

  const dueTomorrow = videos.filter((video) => {
    if (!video.deadline || video.status === "DELIVERED") {
      return false;
    }

    const deadline = new Date(video.deadline);

    return deadline >= tomorrow && deadline < dayAfterTomorrow;
  }).length;

  const sortedVideos = [...videos].sort((a, b) => {
    const getPriority = (video: VideoDeliverable) => {
      if (video.status === "DELIVERED") {
        return 4;
      }

      if (!video.deadline) {
        return 3;
      }

      const deadline = new Date(video.deadline);

      if (deadline < today) {
        return 1;
      }

      if (deadline < tomorrow) {
        return 2;
      }

      if (deadline < dayAfterTomorrow) {
        return 3;
      }

      return 4;
    };

    return getPriority(a) - getPriority(b);
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Leadyfy Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your video production workflow from one place.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {user.name}
                </p>

                <p className="text-sm text-gray-500">
                  {user.email}
                </p>

                <p className="text-xs font-medium uppercase text-gray-500">
                  {user.role}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        {/* Urgency Summary */}
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Overdue</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {overdue}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Due Today</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {dueToday}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Due Tomorrow</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {dueTomorrow}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Completed</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {completed}
            </p>
          </div>
        </div>

        {/* Video Pipeline */}
        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Video Pipeline
          </h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {pipelineStages.map((stage) => (
              <span
                key={stage}
                className="rounded-full border bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700"
              >
                {stage.replaceAll("_", " ")}
              </span>
            ))}
          </div>

          {loading ? (
            <p className="mt-4 text-gray-600">
              Loading videos...
            </p>
          ) : videos.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No video deliverables assigned yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {sortedVideos.map((video) => {
                const deadline = video.deadline
                  ? new Date(video.deadline)
                  : null;

                const isOverdue =
                  deadline !== null &&
                  deadline < today &&
                  video.status !== "DELIVERED";

                const isDueToday =
                  deadline !== null &&
                  deadline >= today &&
                  deadline < tomorrow &&
                  video.status !== "DELIVERED";

                const isDueTomorrow =
                  deadline !== null &&
                  deadline >= tomorrow &&
                  deadline < dayAfterTomorrow &&
                  video.status !== "DELIVERED";

                return (
                  <Link
                    key={video.id}
                    href={`/dashboard/videos/${video.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {video.title}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Video #{video.videoNumber}
                      </p>

                      {deadline && (
                        <p className="mt-1 text-sm text-gray-500">
                          Deadline: {deadline.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isOverdue && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                          OVERDUE
                        </span>
                      )}

                      {isDueToday && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                          DUE TODAY
                        </span>
                      )}

                      {isDueTomorrow && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          DUE TOMORROW
                        </span>
                      )}

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        {video.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}