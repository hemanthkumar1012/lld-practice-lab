import { PageHeader } from '@/components/app-shell'
import { AttemptRow } from '@/components/attempt-row'
import { ProblemCard } from '@/components/problem-card'
import { Button } from '@/components/ui/button'
import { getAttempts, getProblems } from '@/lib/data'
import { CRITERION_LABELS, CRITERION_KEYS } from '@/lib/types'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const problems = getProblems()
  const attempts = getAttempts()

  const hasAttempts = attempts.length > 0
  const avg = hasAttempts
    ? Math.round(
        attempts.reduce((sum, a) => sum + a.overallScore, 0) / attempts.length,
      )
    : null
  const best = hasAttempts
    ? Math.max(...attempts.map((a) => a.overallScore))
    : null

  const stats = [
    { label: 'Problems', value: problems.length },
    { label: 'Attempts', value: attempts.length },
    { label: 'Average score', value: avg ?? '—' },
    { label: 'Best score', value: best ?? '—' },
  ]

  return (
    <>
      <PageHeader
        title="Sharpen your low-level design instincts"
        description="Work through object-oriented design problems in Java, defend your decisions in writing, and get scored across seven criteria that matter in real design reviews."
        actions={
          <Button render={<Link href="/problems" />}>
            Browse problems
            <ArrowRight className="size-4" />
          </Button>
        }
      />

      <div className="flex flex-col gap-10 px-4 py-8 sm:px-8">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-mono text-3xl font-semibold tabular-nums">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Featured problems
              </h2>
              <p className="text-sm text-muted-foreground">
                Start with a classic and build up.
              </p>
            </div>
            <Link
              href="/problems"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Recent attempts
              </h2>
              <Link
                href="/history"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand"
              >
                History
                <ArrowRight className="size-4" />
              </Link>
            </div>
            {hasAttempts ? (
              <div className="flex flex-col gap-3">
                {attempts.slice(0, 3).map((a) => (
                  <AttemptRow key={a.id} attempt={a} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="text-sm text-muted-foreground text-pretty">
                  No attempts yet. Submit your first solution to start building
                  your history.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  render={<Link href="/problems" />}
                >
                  Pick a problem
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              Evaluation criteria
            </h2>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                Every submission is scored on the same seven dimensions, so you
                can track exactly where your designs get stronger.
              </p>
              <ol className="mt-4 flex flex-col gap-2.5">
                {CRITERION_KEYS.map((key, i) => (
                  <li key={key} className="flex items-center gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-xs text-secondary-foreground">
                      {i + 1}
                    </span>
                    {CRITERION_LABELS[key]}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
