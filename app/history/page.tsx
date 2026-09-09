'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/app-shell'
import { AttemptRow } from '@/components/attempt-row'
import type { Attempt } from '@/lib/types'

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAttempts() {
      try {
        const response = await fetch('/api/attempts', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load attempt history.')
        }

        const data = await response.json()
        setAttempts(data.attempts ?? [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load attempt history.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadAttempts()
  }, [])

  return (
    <>
      <PageHeader
        title="History"
        description="Every submission you have reviewed, most recent first. Open one to revisit the full criterion-by-criterion breakdown."
      />

      <div className="px-4 py-8 sm:px-8">
        {loading ? (
          <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading your attempt history...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card/50 p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : attempts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {attempts.map((attempt) => (
              <AttemptRow key={attempt.id} attempt={attempt} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground text-pretty">
              No attempts yet. Submit your first solution to start building
              your history.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
