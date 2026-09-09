import { PageHeader } from '@/components/app-shell'
import { AttemptRow } from '@/components/attempt-row'
import { getAttempts } from '@/lib/data'

export const metadata = {
  title: 'History — LLD Practice Lab',
  description: 'Review your past design attempts and how your scores trend.',
}

export default function HistoryPage() {
  const attempts = getAttempts()

  return (
    <>
      <PageHeader
        title="History"
        description="Every submission you have reviewed, most recent first. Open one to revisit the full criterion-by-criterion breakdown."
      />
      <div className="px-4 py-8 sm:px-8">
        {attempts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {attempts.map((a) => (
              <AttemptRow key={a.id} attempt={a} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground text-pretty">
              No attempts yet. Submit your first solution to start building your
              history.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
