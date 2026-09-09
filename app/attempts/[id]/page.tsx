import { DifficultyBadge } from '@/components/badges'
import { FeedbackReport } from '@/components/feedback-report'
import { getAttempt, getProblem } from '@/lib/data'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const attempt = getAttempt(id)
  if (!attempt) return { title: 'Attempt not found — LLD Practice Lab' }
  const problem = getProblem(attempt.problemId)
  return {
    title: `${problem?.title ?? 'Attempt'} review — LLD Practice Lab`,
    description: attempt.summary,
  }
}

export default async function AttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const attempt = getAttempt(id)
  if (!attempt) notFound()

  const problem = getProblem(attempt.problemId)

  return (
    <>
      <div className="border-b border-border px-4 py-6 sm:px-8">
        <Link
          href="/history"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          History
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {problem ? <DifficultyBadge difficulty={problem.difficulty} /> : null}
          <span className="font-mono text-xs text-muted-foreground">
            {formatDate(attempt.submittedAt)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {attempt.language}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {problem?.title ?? attempt.problemId} review
          </h1>
          {problem ? (
            <Link
              href={`/problems/${problem.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand"
            >
              Try again
              <ArrowUpRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-8 sm:px-8">
        <FeedbackReport attempt={attempt} />
      </div>
    </>
  )
}
