export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-2xl font-bold tracking-tight">
            Leadyfy<span className="text-[#F59E0B]">.</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d97706]"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full bg-[#F59E0B]/10 px-4 py-2 text-sm font-semibold text-[#d97706]">
            Production & Client Management Platform
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Manage your entire
            <span className="text-[#F59E0B]"> production workflow </span>
            in one place.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Leadyfy OS helps teams manage clients, orders, scripts, creators,
            shoots, videos, payments, tasks and final deliveries from one
            centralized platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/login"
              className="rounded-xl bg-[#111111] px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800"
            >
              Login to Leadyfy
            </a>

            <a
              href="/register"
              className="rounded-xl border border-gray-300 px-6 py-3.5 font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              Create Account
            </a>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
              Platform
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Everything your team needs
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Connect the complete production lifecycle from lead and
              onboarding to final delivery and reporting.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Clients",
                description:
                  "Manage client accounts, onboarding, assets and communication.",
              },
              {
                title: "Orders",
                description:
                  "Track packages, orders and production progress in one place.",
              },
              {
                title: "Scripts",
                description:
                  "Create, assign, review and approve scripts with clients.",
              },
              {
                title: "Creators",
                description:
                  "Manage creator profiles, availability and assignments.",
              },
              {
                title: "Shoots",
                description:
                  "Organize shoot schedules, checklists and production activity.",
              },
              {
                title: "Videos",
                description:
                  "Track editing, QA, client review, revisions and delivery.",
              },
              {
                title: "Payments",
                description:
                  "Manage payments, expenses and creator payouts.",
              },
              {
                title: "Reports",
                description:
                  "Monitor operational activity, tasks and business metrics.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/10 font-bold text-[#d97706]">
                  {item.title.charAt(0)}
                </div>

                <h3 className="text-lg font-bold">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-[#111111] px-8 py-14 text-white md:px-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
            Workflow
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            From lead to final delivery
          </h2>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "Lead",
              "Onboarding",
              "Order",
              "Scripting",
              "Creator Match",
              "Shoot",
              "Editing",
              "Client Review",
              "Revisions",
              "Final Delivery",
              "Payout & Reports",
            ].map((step) => (
              <div
                key={step}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-gray-200"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-sm text-gray-500">
          <span>© 2026 Leadyfy OS</span>
          <span>Production Management Platform</span>
        </div>
      </footer>
    </main>
  );
}