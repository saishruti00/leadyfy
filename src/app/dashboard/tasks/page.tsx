"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  XCircle,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline?: string | null;
  attachment?: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

const initialForm = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "MEDIUM",
  deadline: "",
  attachment: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);

  async function loadTasks() {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (data.success) {
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      }
    } catch {
      setMessage("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline
            ? new Date(form.deadline).toISOString()
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task");
        return;
      }

      setMessage("Task created successfully");
      setForm(initialForm);
      await loadTasks();
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const todoCount = tasks.filter((task) => task.status === "TODO").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;
  const cancelledCount = tasks.filter(
    (task) => task.status === "CANCELLED",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Task Management</h1>
          <p className="mt-2 text-slate-400">
            Create and manage internal tasks.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="To Do"
            value={todoCount}
            icon={<ListTodo size={22} />}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock3 size={22} />}
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle2 size={22} />}
          />
          <StatCard
            title="Cancelled"
            value={cancelledCount}
            icon={<XCircle size={22} />}
          />
        </div>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Plus size={22} />
            <h2 className="text-xl font-semibold">Create Task</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <Field
              label="Task Title"
              value={form.title}
              placeholder="Prepare client report"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, title: value }))
              }
              required
            />

            <Field
              label="Assignee ID"
              value={form.assigneeId}
              placeholder="employee-1"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, assigneeId: value }))
              }
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                placeholder="Describe the task..."
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Deadline
              </label>

              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    deadline: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <Field
              label="Attachment URL"
              value={form.attachment}
              placeholder="https://example.com/file.pdf"
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  attachment: value,
                }))
              }
            />

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-sm font-medium text-emerald-600">
              {message}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-semibold">Task List</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No tasks found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-sm">
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="mt-1 max-w-md text-sm text-slate-500">
                            {task.description}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {task.assigneeId || "Unassigned"}
                      </td>

                      <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleString("en-IN")
                          : "No deadline"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} />
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

function Field({
  label,
  value,
  placeholder,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
      />
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
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Task["priority"];
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: Task["status"];
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
      {status.replace("_", " ")}
    </span>
  );
}