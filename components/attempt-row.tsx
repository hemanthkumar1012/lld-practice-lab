import { ScoreBadge } from '@/components/badges'
import { ScoreMeter } from '@/components/score-meter'
import { getProblem } from '@/lib/data'
import { scoreLabel } from '@/lib/score'
import type { Attempt } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AttemptRow({ attempt }: { attempt: Attempt }) {
  const problem = getProblem(attempt.problemId)
  return (
    <Link
      href={`/attempts/${attempt.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-brand/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">
            {problem?.title ?? attempt.problemId}
          </h3>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {formatDate(attempt.submittedAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {attempt.summary}
        </p>
      </div>
      <div className="hidden w-40 flex-col gap-1 md:flex">
        <span className="text-xs text-muted-foreground">
          {scoreLabel(attempt.overallScore)}
        </span>
        <ScoreMeter score={attempt.overallScore} />
      </div>
      <ScoreBadge score={attempt.overallScore} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
