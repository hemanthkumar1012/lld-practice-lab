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
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  async function runAiEvaluation() {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, code, explanation: notes }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.error ?? 'AI evaluation failed.')
    }
    return data as Attempt
  }

  async function saveAttempt(nextAttempt: Attempt) {
    const response = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: nextAttempt.problemId,
        code,
        explanation: notes,
        overallScore: nextAttempt.overallScore,
        summary: nextAttempt.summary,
        criteria: nextAttempt.criteria,
      }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error ?? 'Failed to save your attempt.')
    if (!data?.attemptId) throw new Error('The evaluation was saved, but no attempt ID was returned.')
    return data.attemptId as string
  }

  async function runPipeline() {
    clearTimers()
    setError(null)
    setPhase('submitted')
    setTab('feedback')

    const evaluatingTimer = window.setTimeout(() => setPhase('evaluating'), 700)
    const evaluationTimer = window.setTimeout(async () => {
      try {
        let nextAttempt: Attempt

        try {
          nextAttempt = await runAiEvaluation()
        } catch (aiError) {
          nextAttempt = evaluateSubmission(problem, code, notes)
          nextAttempt.summary = `${nextAttempt.summary} AI review was temporarily unavailable, so deterministic preflight feedback was used instead.`
          setError(
            aiError instanceof Error
              ? `AI review unavailable. Showing deterministic feedback instead. ${aiError.message}`
              : 'AI review unavailable. Showing deterministic feedback instead.',
          )
        }

        setAttempt(nextAttempt)
        await saveAttempt(nextAttempt)
        setPhase('completed')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Evaluation failed.')
        setPhase('failed')
      }
    }, 1400)

    timers.current.push(evaluatingTimer, evaluationTimer)
  }

  function handleSubmit() {
    setError(null)
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

    runPipeline()
  }

  function handleRetry() {
    runPipeline()
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
        {hasSubmitted ? <Button variant="ghost" size="sm" onClick={handleReset}><RotateCcw className="size-4" />Reset</Button> : null}
      </div>

      {tab === 'solution' ? (
        <div className="flex flex-col gap-4 p-4">
          <div>
            <label htmlFor="code" className="mb-1.5 flex items-center justify-between text-sm font-medium">
              Java solution
              <span className="font-mono text-xs font-normal text-muted-foreground">{code.split('\n').length} lines</span>
            </label>
            <textarea id="code" value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} disabled={isBusy} className="h-80 w-full resize-y rounded-lg border border-input bg-background p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60" />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
              Design reasoning
              <span className="ml-2 font-normal text-muted-foreground">Explain your responsibilities, abstractions, trade-offs, and extensibility decisions</span>
            </label>
            <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isBusy} placeholder="Which responsibilities did you separate, and why? What abstractions did you introduce? What trade-offs did you make, and what did you deliberately leave out for now?" className="h-32 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60" />
          </div>

          {error ? <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span className="break-words">{error}</span></div> : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">AI review is preferred; deterministic preflight feedback is used automatically if AI is temporarily unavailable.</p>
            <Button onClick={handleSubmit} disabled={isBusy}>
              {isBusy ? <><Loader2 className="size-4 animate-spin" />Evaluating</> : <><Play className="size-4" />Submit for review</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4"><FeedbackPanel phase={phase} attempt={attempt} error={error} onRetry={handleRetry} /></div>
      )}
    </div>
  )
}

function FeedbackPanel({ phase, attempt, error, onRetry }: { phase: EvalPhase; attempt: Attempt | null; error: string | null; onRetry: () => void }) {
  if (phase === 'idle') return <div className="flex flex-col items-center gap-2 py-16 text-center"><Clock className="size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">Submit a solution to start an evaluation.</p></div>
  if (phase === 'failed') return <div className="flex flex-col items-center gap-4 py-16 text-center"><AlertCircle className="size-7 text-destructive" /><div className="max-w-2xl"><p className="text-sm font-medium">Evaluation failed</p><p className="mt-2 break-words text-sm text-muted-foreground">{error ?? 'Something went wrong while evaluating your submission.'}</p></div><Button variant="outline" size="sm" onClick={onRetry}><RotateCcw className="size-4" />Retry evaluation</Button></div>

  return <div className="flex flex-col gap-6 py-4"><ol className="flex flex-col gap-3">{PIPELINE.map((step) => { const status = stepStatus(step.key, phase); return <li key={step.key} className="flex items-center gap-3"><StepIcon status={status} /><span className={cn('text-sm', status === 'active' && 'font-medium text-foreground', status === 'done' && 'text-foreground', status === 'pending' && 'text-muted-foreground')}>{step.label}</span></li> })}</ol>{phase === 'completed' && attempt ? <FeedbackReport attempt={attempt} /> : <p className="text-sm text-muted-foreground">Your submission is being reviewed by the evaluation pipeline.</p>}</div>
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
