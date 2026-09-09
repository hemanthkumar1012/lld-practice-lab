'use client'

import { DifficultyBadge } from '@/components/badges'
import { FeedbackReport } from '@/components/feedback-report'
import type { Attempt } from '@/lib/types'
import { ArrowLeft, ArrowUpRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AttemptDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAttempt() {
      try {
        const response = await fetch('/api/attempts', {
          cache: 'no-store',
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.error ?? 'Failed to load this attempt.',
          )
        }

        const found = (data?.attempts ?? []).find(
          (item: Attempt) => item.id === params.id,
        )

        if (!found) {
          throw new Error('Attempt not found.')
        }

        if (!cancelled) {
          setAttempt(found)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load this attempt.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAttempt()

    return () => {
      cancelled = true
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading attempt...
        </div>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">Attempt not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? 'This attempt could not be loaded.'}
          </p>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to history
        </Link>
      </div>
    )
  }

  const problemTitle =
    attempt.problemId === 'parking-lot'
      ? 'Parking Lot'
      : attempt.problemId === 'vending-machine'
        ? 'Vending Machine'
        : attempt.problemId === 'elevator-system'
          ? 'Elevator System'
          : attempt.problemId

  const difficulty =
    attempt.problemId === 'parking-lot'
      ? 'Easy'
      : attempt.problemId === 'vending-machine'
        ? 'Medium'
        : 'Hard'

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
          <DifficultyBadge difficulty={difficulty as 'Easy' | 'Medium' | 'Hard'} />

          <span className="font-mono text-xs text-muted-foreground">
            {formatDate(attempt.submittedAt)}
          </span>

          <span className="font-mono text-xs text-muted-foreground">
            {attempt.language}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {problemTitle} review
          </h1>

          <Link
            href={`/problems/${attempt.problemId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand"
          >
            Try again
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-8">
        <FeedbackReport attempt={attempt} />
      </div>
    </>
  )
}
