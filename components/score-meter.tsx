import { cn } from '@/lib/utils'
import { scoreLabel, scoreTone, toneBgClass, toneTextClass } from '@/lib/score'

export function ScoreMeter({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const tone = scoreTone(score)
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-muted', className)}>
      <div
        className={cn('h-full rounded-full transition-all', toneBgClass[tone])}
        style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
      />
    </div>
  )
}

export function ScoreRing({
  score,
  size = 132,
}: {
  score: number
  size?: number
}) {
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference
  const tone = scoreTone(score)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall score ${score} out of 100, ${scoreLabel(score)}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all', toneTextClass[tone])}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono text-3xl font-semibold tabular-nums',
            toneTextClass[tone],
          )}
        >
          {score}
        </span>
        <span className="text-xs text-muted-foreground">{scoreLabel(score)}</span>
      </div>
    </div>
  )
}
