export type ScoreTone = 'success' | 'warning' | 'destructive'

/** Maps a 0–100 score to a semantic tone used across badges and meters. */
export function scoreTone(score: number): ScoreTone {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'destructive'
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Strong'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 40) return 'Needs work'
  return 'At risk'
}

export const toneTextClass: Record<ScoreTone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
}

export const toneBgClass: Record<ScoreTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}
