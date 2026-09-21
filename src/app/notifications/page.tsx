"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notifications");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notifications",
        );
      }

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : [],
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications",
      );
    } finally {
      setLoading(false);
    }
  }
  async function handleMarkAsRead(id: string) {
  try {
    const response = await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to mark notification as read",
      );
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to update notification",
    );
  }
}

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.isRead,
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              View your latest Leadyfy system notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard
            title="Total Notifications"
            value={notifications.length}
            icon={<Bell className="h-5 w-5" />}
          />

          <StatCard
            title="Unread"
            value={unreadCount}
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <StatCard
            title="Read"
            value={readCount}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Notifications
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="font-medium text-red-600">{error}</p>

              <button
                type="button"
                onClick={loadNotifications}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No notifications
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                New system notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
               <NotificationCard
  key={notification.id}
  notification={notification}
  onMarkAsRead={handleMarkAsRead}
  markingAsRead={false}
/>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


function NotificationCard({
  notification,
  onMarkAsRead,
  markingAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  markingAsRead: boolean;
}) {
  return (
    <div
      className={`flex gap-4 px-6 py-5 transition ${
        notification.isRead ? "bg-white" : "bg-slate-50/70"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          notification.isRead
            ? "bg-slate-100 text-slate-500"
            : "bg-slate-900 text-white"
        }`}
      >
        <Bell className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">
              {notification.title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {notification.message}
            </p>
          </div>

          {!notification.isRead && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Unread
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
            {notification.type}
          </span>

          <span>
            {new Date(notification.createdAt).toLocaleString(
              "en-IN",
            )}
          </span>

          {!notification.isRead && (
            <button
              type="button"
              onClick={() => onMarkAsRead(notification.id)}
              disabled={markingAsRead}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {markingAsRead
                ? "Updating..."
                : "Mark as Read"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}