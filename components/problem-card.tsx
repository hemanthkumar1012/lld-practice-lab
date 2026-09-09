import { CategoryTag, DifficultyBadge } from '@/components/badges'
import type { Problem } from '@/lib/types'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      href={`/problems/${problem.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/50"
    >
      <div className="flex items-center justify-between gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {problem.estimatedMinutes}m
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">
        {problem.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
        {problem.summary}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <CategoryTag label={problem.category} />
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
          Practice
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
