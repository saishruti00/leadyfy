"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
interface Client {
  id: string;
  companyName?: string;
  name?: string;
}

interface Order {
  id: string;
  packageName: string;
  clientId: string;
}

interface Creator {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Script {
  id: string;
  videoNumber: number;
  language: string;
  scriptText: string;
  referenceLinks?: string | null;
  deadline: string;
  revisionCount: number;
  comments?: string | null;
  status: string;
  client?: Client;
  order?: Order;
  writer?: Employee | null;
  creator?: Creator | null;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  SENT_TO_CLIENT: "bg-purple-100 text-purple-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  READY_FOR_SHOOT: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ASSIGNED: "Assigned",
  IN_REVIEW: "In Review",
  SENT_TO_CLIENT: "Sent to Client",
  REVISION_REQUIRED: "Revision Required",
  APPROVED: "Approved",
  READY_FOR_SHOOT: "Ready for Shoot",
};
const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ASSIGNED"],
  ASSIGNED: ["IN_REVIEW"],
  IN_REVIEW: ["SENT_TO_CLIENT"],
  SENT_TO_CLIENT: ["REVISION_REQUIRED", "APPROVED"],
  REVISION_REQUIRED: ["IN_REVIEW"],
  APPROVED: ["READY_FOR_SHOOT"],
  READY_FOR_SHOOT: [],
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    orderId: "",
    writerId: "",
    videoNumber: "",
    creatorId: "",
    language: "English",
    scriptText: "",
    referenceLinks: "",
    deadline: "",
    comments: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        scriptsRes,
        clientsRes,
        ordersRes,
        creatorsRes,
        employeesRes,
      ] = await Promise.all([
        fetch("/api/scripts"),
        fetch("/api/clients"),
        fetch("/api/orders"),
        fetch("/api/creators"),
        fetch("/api/employees"),
      ]);

      if (!scriptsRes.ok) {
        throw new Error("Failed to load scripts");
      }

      const scriptsData = await scriptsRes.json();

      const clientsData = clientsRes.ok
        ? await clientsRes.json()
        : {};

      const ordersData = ordersRes.ok
        ? await ordersRes.json()
        : {};

      const creatorsData = creatorsRes.ok
        ? await creatorsRes.json()
        : {};

      const employeesData = employeesRes.ok
        ? await employeesRes.json()
        : {};

      setScripts(
        Array.isArray(scriptsData)
          ? scriptsData
          : scriptsData.scripts ?? [],
      );

      setClients(
        Array.isArray(clientsData)
          ? clientsData
          : clientsData.clients ?? [],
      );

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders ?? [],
      );

      setCreators(
        Array.isArray(creatorsData)
          ? creatorsData
          : creatorsData.creators ?? [],
      );

      setEmployees(
        Array.isArray(employeesData)
          ? employeesData
          : employeesData.employees ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = form.clientId
    ? orders.filter((order) => order.clientId === form.clientId)
    : [];

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      clientId: "",
      orderId: "",
      writerId: "",
      videoNumber: "",
      creatorId: "",
      language: "English",
      scriptText: "",
      referenceLinks: "",
      deadline: "",
      comments: "",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: form.clientId,
          orderId: form.orderId,
          writerId: form.writerId || undefined,
          videoNumber: Number(form.videoNumber),
          creatorId: form.creatorId || undefined,
          language: form.language,
          scriptText: form.scriptText,
          referenceLinks: form.referenceLinks || undefined,
          deadline: form.deadline,
          comments: form.comments || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to create script",
        );
      }

      setScripts((prev) => [
        data.script ?? data,
        ...prev,
      ]);

      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create script",
      );
    } finally {
      setSaving(false);
    }
  }
  async function handleStatusChange(
  scriptId: string,
  nextStatus: string,
) {
  try {
    setError("");

    const response = await fetch(`/api/scripts/${scriptId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to update script status",
      );
    }

    setScripts((prev) =>
      prev.map((script) =>
        script.id === scriptId
          ? {
              ...script,
              status: nextStatus,
            }
          : script,
      ),
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to update script status",
    );
  }
}

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-7 w-7 text-amber-500" />
              <h1 className="text-2xl font-bold text-[#111111]">
                Scripts
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage script drafting, review and approval workflow.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" />
              Add Script
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Scripts"
            value={scripts.length}
          />

          <StatCard
            label="Draft"
            value={
              scripts.filter(
                (script) => script.status === "DRAFT",
              ).length
            }
          />

          <StatCard
            label="In Review"
            value={
              scripts.filter(
                (script) => script.status === "IN_REVIEW",
              ).length
            }
          />

          <StatCard
            label="Approved"
            value={
              scripts.filter(
                (script) =>
                  script.status === "APPROVED" ||
                  script.status === "READY_FOR_SHOOT",
              ).length
            }
          />
        </div>

        {/* Scripts table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-[#111111]">
              Script Repository
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : scripts.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <FileText className="mb-3 h-10 w-10 text-gray-300" />

              <h3 className="font-semibold text-gray-700">
                No scripts found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first script to start the workflow.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Video</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Writer</th>
                    <th className="px-5 py-3">Creator</th>
                    <th className="px-5 py-3">Language</th>
                    <th className="px-5 py-3">Deadline</th>
                    <th className="px-5 py-3">Revisions</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {scripts.map((script) => (
                    <tr
                      key={script.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-medium">
                        Video #{script.videoNumber}
                      </td>

                      <td className="px-5 py-4">
                        {script.client?.companyName ||
                          script.client?.name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        {script.order?.packageName || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {script.writer?.user?.name ||
                          "Unassigned"}
                      </td>

                      <td className="px-5 py-4">
                        {script.creator?.name ||
                          "Unassigned"}
                      </td>

                      <td className="px-5 py-4">
                        {script.language}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {new Date(
                            script.deadline,
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {script.revisionCount}
                      </td>

                     <td className="px-5 py-4">
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      STATUS_STYLES[script.status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {STATUS_LABELS[script.status] || script.status}
  </span>
</td>

<td className="px-5 py-4">
  {STATUS_TRANSITIONS[script.status]?.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {STATUS_TRANSITIONS[script.status].map((nextStatus) => (
        <button
          key={nextStatus}
          type="button"
          onClick={() => handleStatusChange(script.id, nextStatus)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {STATUS_LABELS[nextStatus]}
        </button>
      ))}
    </div>
  ) : (
    <span className="text-xs text-gray-400">
      Completed
    </span>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Script Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Add Script
                </h2>

                <p className="text-sm text-gray-500">
                  Create a new script in Draft status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Client"
                  value={form.clientId}
                  onChange={(value) => {
                    updateField("clientId", value);
                    updateField("orderId", "");
                  }}
                  options={clients.map((client) => ({
                    value: client.id,
                    label:
                      client.companyName ||
                      client.name ||
                      "Unnamed Client",
                  }))}
                  required
                />

                <SelectField
                  label="Order"
                  value={form.orderId}
                  onChange={(value) =>
                    updateField("orderId", value)
                  }
                  options={filteredOrders.map((order) => ({
                    value: order.id,
                    label: order.packageName,
                  }))}
                  disabled={!form.clientId}
                  required
                />

                <SelectField
                  label="Writer"
                  value={form.writerId}
                  onChange={(value) =>
                    updateField("writerId", value)
                  }
                  options={employees.map((employee) => ({
                    value: employee.id,
                    label: employee.user.name,
                  }))}
                />

                <InputField
                  label="Video Number"
                  type="number"
                  min="1"
                  value={form.videoNumber}
                  onChange={(value) =>
                    updateField("videoNumber", value)
                  }
                  placeholder="e.g. 1"
                  required
                />

                <SelectField
                  label="Creator"
                  value={form.creatorId}
                  onChange={(value) =>
                    updateField("creatorId", value)
                  }
                  options={creators.map((creator) => ({
                    value: creator.id,
                    label: creator.name,
                  }))}
                />

                <SelectField
                  label="Language"
                  value={form.language}
                  onChange={(value) =>
                    updateField("language", value)
                  }
                  options={[
                    { value: "English", label: "English" },
                    { value: "Hindi", label: "Hindi" },
                    {
                      value: "Hinglish",
                      label: "Hinglish",
                    },
                    { value: "Other", label: "Other" },
                  ]}
                  required
                />

                <InputField
                  label="Deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(value) =>
                    updateField("deadline", value)
                  }
                  required
                />
              </div>

              <TextAreaField
                label="Script Text"
                value={form.scriptText}
                onChange={(value) =>
                  updateField("scriptText", value)
                }
                placeholder="Write the script here..."
                rows={8}
                required
              />

              <InputField
                label="Reference Links"
                value={form.referenceLinks}
                onChange={(value) =>
                  updateField("referenceLinks", value)
                }
                placeholder="https://..."
              />

              <TextAreaField
                label="Comments"
                value={form.comments}
                onChange={(value) =>
                  updateField("comments", value)
                }
                placeholder="Internal comments..."
                rows={3}
              />

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Create Script
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </span>

      <select
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-100"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </span>

      <textarea
        value={value}
        required={required}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );
}