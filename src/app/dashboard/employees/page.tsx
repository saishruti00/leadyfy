"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Loader2,
  Mail,
  Plus,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

interface Employee {
  id: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

interface EmployeeForm {
  name: string;
  email: string;
  password: string;
}

const initialForm: EmployeeForm = {
  name: "",
  email: "",
  password: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadEmployees() {
    try {
      setError("");

      const response = await fetch("/api/employees");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }

      setEmployees(Array.isArray(data.employees) ? data.employees : []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch employees",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const activeEmployees = employees.filter(
    (employee) => employee.user.isActive,
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => !employee.user.isActive,
  ).length;

  function handleChange(
    field: keyof EmployeeForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeForm() {
    if (submitting) return;

    setShowForm(false);
    setForm(initialForm);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create employee");
      }

      setMessage("Employee created successfully.");
      setForm(initialForm);

      await loadEmployees();

      setTimeout(() => {
        setShowForm(false);
        setMessage("");
      }, 1000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create employee",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Employee Directory
            </h1>

            <p className="mt-2 text-slate-500">
              Manage and view your organization employees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setMessage("");
              setError("");
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Add Employee
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an employee account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              <Field
                label="Name"
                value={form.name}
                placeholder="Enter employee name"
                onChange={(value) => handleChange("name", value)}
                required
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                placeholder="employee@example.com"
                onChange={(value) => handleChange("email", value)}
                required
              />

              <Field
                label="Password"
                type="password"
                value={form.password}
                placeholder="Minimum 6 characters"
                onChange={(value) => handleChange("password", value)}
                required
              />

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {submitting ? "Creating..." : "Create Employee"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            title="Active Employees"
            value={activeEmployees}
            icon={<UserCheck className="h-5 w-5" />}
          />

          <StatCard
            title="Inactive Employees"
            value={inactiveEmployees}
            icon={<UserX className="h-5 w-5" />}
          />
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Employees
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No employees found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add an employee to get started.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {employee.user.name}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          {employee.user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                          {employee.user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            employee.user.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {employee.user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(
                          employee.user.createdAt,
                        ).toLocaleDateString("en-IN")}
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
  type = "text",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}