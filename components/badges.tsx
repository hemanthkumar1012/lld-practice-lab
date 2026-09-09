import { cn } from '@/lib/utils'
import { scoreTone, toneTextClass } from '@/lib/score'
import type { Confidence, Difficulty } from '@/lib/types'

const difficultyClass: Record<Difficulty, string> = {
  Easy: 'text-success border-success/30 bg-success/10',
  Medium: 'text-warning border-warning/30 bg-warning/10',
  Hard: 'text-destructive border-destructive/30 bg-destructive/10',
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        difficultyClass[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  )
}

export function ScoreBadge({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const tone = scoreTone(score)
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 font-mono text-sm font-semibold tabular-nums',
        toneTextClass[tone],
        className,
      )}
    >
      {score}
      <span className="text-[10px] font-normal text-muted-foreground">/100</span>
    </span>
  )
}

const confidenceClass: Record<Confidence, string> = {
  High: 'text-success',
  Medium: 'text-warning',
  Low: 'text-muted-foreground',
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          'size-1.5 rounded-full bg-current',
          confidenceClass[confidence],
        )}
        aria-hidden
      />
      {confidence} confidence
    </span>
  )
}

export function CategoryTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-secondary-foreground">
      {label}
    </span>
  )
}
