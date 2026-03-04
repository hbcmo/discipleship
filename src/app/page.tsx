'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10">
        <header className="flex flex-col gap-10 rounded-3xl border border-blue-200 bg-white/80 p-10 shadow-sm backdrop-blur">
          <nav className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="HBC Logo" className="h-12 w-12 rounded-lg" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Harmony Baptist Church
                </p>
                <p className="text-sm text-zinc-700">
                  Discipleship Ministry
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/login">
                <button className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                  Sign In
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Create Account
                </button>
              </Link>
            </div>
          </nav>

          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl font-semibold leading-tight text-zinc-900 md:text-5xl">
                Growing together in Christ
              </h1>
              <p className="text-lg leading-8 text-zinc-600">
                Harmony Baptist Church's discipleship platform connects mentors with disciples. 
                Experience guided study, meaningful accountability, and spiritual transformation 
                through personalized one-on-one relationships.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
                  Personalized discipleship
                </span>
                <span className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white">
                  Scripture & prayer focus
                </span>
                <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
                  Progress tracking
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                  This week's focus
                </p>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  Week 1
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                Knowing Jesus Through Scripture
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Begin your journey into God's Word. Study passages, reflect on truth, and apply Scripture to your daily life.
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  "Daily Scripture reading",
                  "Reflection questions",
                  "Prayer guide",
                  "Discipleship actions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm"
                  >
                    <span className="text-zinc-700">{item}</span>
                    <span className="text-blue-600">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">For Disciplers</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Mentor role
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Guide your disciplees through customized study plans. Share insights, encourage spiritual growth, and track progress.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Assign customized study plans",
                "Track disciplee progress",
                "Share insights & feedback",
                "Stay connected through messaging",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"
                >
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-sm text-zinc-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">For Disciplees</h2>
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                Learn role
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Receive personalized guidance from your discipler. Complete weekly assignments, reflect on Scripture, and grow spiritually.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Receive weekly study plans",
                "Track your spiritual habits",
                "Communicate with your discipler",
                "Grow in God's Word",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                >
                  <span className="text-zinc-600 font-bold">✓</span>
                  <span className="text-sm text-zinc-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Messaging",
              description:
                "Stay connected with your discipler or disciplees through secure messaging and prayer requests.",
            },
            {
              title: "Study Plans",
              description:
                "Receive structured study plans based on Scripture, with reflection prompts and discussion guides.",
            },
            {
              title: "Progress Tracking",
              description:
                "Track spiritual habits and growth milestones with weekly check-ins and meaningful feedback.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Begin your discipleship journey
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-700">
                Whether you're mentoring or being mentored, we're here to support your spiritual growth in Christ.
              </p>
            </div>
            <Link href="/auth/signup">
              <button className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white whitespace-nowrap hover:bg-blue-700">
                Get Started
              </button>
            </Link>
          </div>
        </section>

        <footer className="flex flex-col gap-4 rounded-3xl border border-blue-200 bg-white p-6 text-sm text-zinc-700">
          <p className="font-semibold text-zinc-700">About This Platform</p>
          <p>
            This platform is inspired by the discipleship principles found in "Deep Discipleship" by J.T. English.
            The study materials and content within this platform are sample content created for demonstration purposes.
            Disciplers are encouraged to customize and adapt all materials for their specific ministry context.
          </p>
        </footer>
      </div>
    </div>
  );
}
