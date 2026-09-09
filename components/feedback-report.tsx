import { ConfidenceBadge, ScoreBadge } from '@/components/badges'
import { ScoreMeter, ScoreRing } from '@/components/score-meter'
import { CRITERION_LABELS, type Attempt } from '@/lib/types'
import { Check, TriangleAlert, ArrowUpRight } from 'lucide-react'

export function FeedbackReport({ attempt }: { attempt: Attempt }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-8">
        <ScoreRing score={attempt.overallScore} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            Overall assessment
          </h3>
          <p className="mt-1 leading-relaxed text-pretty">{attempt.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {attempt.criteria.map((c) => (
              <div key={c.key} className="flex flex-col gap-1">
                <span className="truncate text-xs text-muted-foreground">
                  {CRITERION_LABELS[c.key]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {c.score}
                  </span>
                  <ScoreMeter score={c.score} className="w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {attempt.criteria.map((c) => (
          <article
            key={c.key}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium">{CRITERION_LABELS[c.key]}</h4>
              <ScoreBadge score={c.score} />
            </div>
            <ScoreMeter score={c.score} className="mt-3" />
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <Check className="size-3.5" />
                  Evidence
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {c.evidence}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-warning">
                  <TriangleAlert className="size-3.5" />
                  Concern
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {c.concern}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-brand">
                  <ArrowUpRight className="size-3.5" />
                  Suggestion
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {c.suggestion}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-border pt-3">
              <ConfidenceBadge confidence={c.confidence} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
