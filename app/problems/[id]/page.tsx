import { CategoryTag, DifficultyBadge } from '@/components/badges'
import { PracticeWorkspace } from '@/components/practice-workspace'
import { getAttemptsForProblem, getProblem, getProblems } from '@/lib/data'
import { scoreLabel } from '@/lib/score'
import { ArrowLeft, Clock, ListChecks, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return getProblems().map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const problem = getProblem(id)
  if (!problem) return { title: 'Problem not found — LLD Practice Lab' }
  return {
    title: `${problem.title} — LLD Practice Lab`,
    description: problem.summary,
  }
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const problem = getProblem(id)
  if (!problem) notFound()

  const priorAttempts = getAttemptsForProblem(problem.id)

  return (
    <>
      <div className="border-b border-border px-4 py-6 sm:px-8">
        <Link
          href="/problems"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All problems
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <DifficultyBadge difficulty={problem.difficulty} />
          <CategoryTag label={problem.category} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {problem.estimatedMinutes}m
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance">
          {problem.title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
          {problem.summary}
        </p>
      </div>

      <div className="grid gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="flex flex-col gap-8 lg:sticky lg:top-8">
          <section className="flex flex-col gap-3">
            {problem.description.map((para, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-muted-foreground text-pretty"
              >
                {para}
              </p>
            ))}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="size-4 text-brand" />
              Requirements
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {problem.requirements.map((req, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                  <span className="text-pretty">{req}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="size-4 text-brand" />
              Concepts under review
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {problem.concepts.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          </section>

          {priorAttempts.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold">
                Your past attempts
              </h2>
              <ul className="flex flex-col gap-2">
                {priorAttempts.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/attempts/${a.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm transition-colors hover:border-brand/50"
                    >
                      <span className="text-muted-foreground">
                        {new Date(a.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {scoreLabel(a.overallScore)}
                        </span>
                        <span className="font-mono font-semibold tabular-nums">
                          {a.overallScore}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <PracticeWorkspace problem={problem} />
      </div>
    </>
  )
}
