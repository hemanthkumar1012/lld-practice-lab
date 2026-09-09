import { PageHeader } from '@/components/app-shell'
import { ProblemCard } from '@/components/problem-card'
import { getProblems } from '@/lib/data'
import { difficultyRank } from '@/lib/data'

export const metadata = {
  title: 'Problems — LLD Practice Lab',
  description:
    'Browse low-level design problems to practice, from parking lots to elevator systems.',
}

export default function ProblemsPage() {
  const problems = [...getProblems()].sort(
    (a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty),
  )

  return (
    <>
      <PageHeader
        title="Problems"
        description="Each problem is a self-contained object-oriented design exercise. Pick one, model the domain in Java, and defend your decisions."
      />
      <div className="px-4 py-8 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      </div>
    </>
  )
}
