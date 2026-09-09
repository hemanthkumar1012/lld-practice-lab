'use client'

import { FeedbackReport } from '@/components/feedback-report'
import { Button } from '@/components/ui/button'
import { evaluateSubmission } from '@/lib/evaluator'
import type { Attempt, Problem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AlertCircle, Check, Clock, Loader2, Play, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'

type EvalPhase = 'idle' | 'submitted' | 'evaluating' | 'completed' | 'failed'

const PIPELINE: { key: EvalPhase; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'evaluating', label: 'Evaluating' },
  { key: 'completed', label: 'Completed' },
]

export function PracticeWorkspace({ problem }: { problem: Problem }) {
  const [code, setCode] = useState(problem.starterCode)
  const [notes, setNotes] = useState('')
  const [phase, setPhase] = useState<EvalPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'solution' | 'feedback'>('solution')
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const timers = useRef<number[]>([])

  const isBusy = phase === 'submitted' || phase === 'evaluating'
  const hasSubmitted = phase !== 'idle'

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  function runPipeline(nextAttempt: Attempt) {
    clearTimers()
    setAttempt(nextAttempt)
    setPhase('submitted')
    setTab('feedback')
    timers.current.push(
      window.setTimeout(() => setPhase('evaluating'), 700),
      window.setTimeout(() => setPhase('completed'), 2200),
    )
  }

  function handleSubmit() {
    const codeIsEmpty = code.trim().length === 0 || code.trim() === problem.starterCode.trim()
    const notesIsEmpty = notes.trim().length === 0

    if (codeIsEmpty && notesIsEmpty) {
      setError('Add your Java solution and design reasoning before submitting.')
      return
    }
    if (codeIsEmpty) {
      setError('Your Java solution is empty. Write your design before submitting.')
      return
    }
    if (notesIsEmpty) {
      setError('Add your design reasoning — explain your key decisions and trade-offs.')
      return
    }

    setError(null)
    runPipeline(evaluateSubmission(problem, code, notes))
  }

  function handleRetry() {
    setError(null)
    runPipeline(evaluateSubmission(problem, code, notes))
  }

  function handleReset() {
    clearTimers()
    setPhase('idle')
    setAttempt(null)
    setError(null)
    setTab('solution')
  }

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex gap-1">
          <TabButton active={tab === 'solution'} onClick={() => setTab('solution')}>Solution</TabButton>
          <TabButton active={tab === 'feedback'} disabled={!hasSubmitted} onClick={() => hasSubmitted && setTab('feedback')}>Feedback</TabButton>
        </div>
        {hasSubmitted ? (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        ) : null}
      </div>

      {tab === 'solution' ? (
        <div className="flex flex-col gap-4 p-4">
          <div>
            <label htmlFor="code" className="mb-1.5 flex items-center justify-between text-sm font-medium">
              Java solution
              <span className="font-mono text-xs font-normal text-muted-foreground">{code.split('\n').length} lines</span>
            </label>
            <textarea id="code" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} className="h-80 w-full resize-y rounded-lg border border-input bg-background p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
              Design reasoning
              <span className="ml-2 font-normal text-muted-foreground">Explain your responsibilities, abstractions, trade-offs, and extensibility decisions</span>
            </label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Which responsibilities did you separate, and why? What abstractions did you introduce? What trade-offs did you make, and what did you deliberately leave out for now?" className="h-32 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          {error ? (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Your solution and reasoning are evaluated together.</p>
            <Button onClick={handleSubmit} disabled={isBusy}>
              {isBusy ? <><Loader2 className="size-4 animate-spin" />Evaluating</> : <><Play className="size-4" />Submit for review</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4"><FeedbackPanel phase={phase} attempt={attempt} onRetry={handleRetry} /></div>
      )}
    </div>
  )
}

function FeedbackPanel({ phase, attempt, onRetry }: { phase: EvalPhase; attempt: Attempt | null; onRetry: () => void }) {
  if (phase === 'idle') {
    return <div className="flex flex-col items-center gap-2 py-16 text-center"><Clock className="size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">Submit a solution to start an evaluation.</p></div>
  }

  if (phase === 'failed') {
    return <div className="flex flex-col items-center gap-3 py-16 text-center"><AlertCircle className="size-6 text-destructive" /><div><p className="text-sm font-medium">Evaluation failed</p><p className="mt-1 text-sm text-muted-foreground">Something went wrong while evaluating your solution.</p></div><Button variant="outline" size="sm" onClick={onRetry}><RotateCcw className="size-4" />Retry evaluation</Button></div>
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <ol className="flex flex-col gap-3">
        {PIPELINE.map((step) => {
          const status = stepStatus(step.key, phase)
          return <li key={step.key} className="flex items-center gap-3"><StepIcon status={status} /><span className={cn('text-sm', status === 'active' && 'font-medium text-foreground', status === 'done' && 'text-foreground', status === 'pending' && 'text-muted-foreground')}>{step.label}</span></li>
        })}
      </ol>

      {phase === 'completed' && attempt ? (
        <FeedbackReport attempt={attempt} />
      ) : (
        <p className="text-sm text-muted-foreground">Hang tight — your solution is moving through the pipeline.</p>
      )}
    </div>
  )
}

type StepState = 'done' | 'active' | 'pending'

function stepStatus(step: EvalPhase, phase: EvalPhase): StepState {
  const order: EvalPhase[] = ['submitted', 'evaluating', 'completed']
  const stepIndex = order.indexOf(step)
  const phaseIndex = order.indexOf(phase)
  if (phaseIndex > stepIndex) return 'done'
  if (phaseIndex === stepIndex) return phase === 'completed' ? 'done' : 'active'
  return 'pending'
}

function StepIcon({ status }: { status: StepState }) {
  if (status === 'done') return <span className="flex size-6 items-center justify-center rounded-full bg-success/15 text-success"><Check className="size-3.5" /></span>
  if (status === 'active') return <span className="flex size-6 items-center justify-center rounded-full bg-brand/15 text-brand"><Loader2 className="size-3.5 animate-spin" /></span>
  return <span className="flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground"><Clock className="size-3.5" /></span>
}

function TabButton({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={cn('flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors', active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground', disabled && 'cursor-not-allowed opacity-40 hover:text-muted-foreground')}>{children}</button>
}
