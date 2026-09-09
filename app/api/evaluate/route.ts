import { NextResponse } from 'next/server'
import { evaluateSubmission } from '@/lib/evaluator'
import { CRITERION_KEYS, type Attempt, type CriterionKey } from '@/lib/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash'
const GEMINI_MAX_ATTEMPTS = 2

const OUTPUT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    overallScore: { type: 'INTEGER' },
    summary: { type: 'STRING' },
    criteria: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          key: { type: 'STRING' },
          score: { type: 'INTEGER' },
          evidence: { type: 'STRING' },
          concern: { type: 'STRING' },
          suggestion: { type: 'STRING' },
          confidence: { type: 'STRING' },
        },
        required: ['key', 'score', 'evidence', 'concern', 'suggestion', 'confidence'],
      },
    },
  },
  required: ['overallScore', 'summary', 'criteria'],
} as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { problem, code, explanation } = body ?? {}

    if (!problem || !code || !explanation) {
      return NextResponse.json(
        { error: 'Problem, code, and explanation are required.' },
        { status: 400 },
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(withFallbackMessage(evaluateSubmission(problem, code, explanation)))
    }

    try {
      const evaluation = await evaluateWithGemini(problem, code, explanation)
      return NextResponse.json(evaluation)
    } catch {
      const fallback = evaluateSubmission(problem, code, explanation)
      return NextResponse.json(withFallbackMessage(fallback))
    }
  } catch {
    return NextResponse.json(
      { error: 'Unable to evaluate this submission right now. Please try again.' },
      { status: 500 },
    )
  }
}

async function evaluateWithGemini(problem: any, code: string, explanation: string): Promise<Attempt> {
  const systemPrompt = `You are a senior software engineer evaluating a junior developer's low-level design submission.

Evaluate the design, not coding style alone. Be evidence-based and fair. Do not reward buzzwords unless the code or explanation demonstrates the underlying design decision.

Score these seven criteria from 0 to 100:
1. requirementUnderstanding — Requirement Understanding
2. responsibilityCohesion — Responsibility & Cohesion
3. coupling — Coupling
4. encapsulationAbstraction — Encapsulation & Abstraction
5. extensibility — Extensibility
6. testability — Testability
7. designReasoning — Design Reasoning

For every criterion provide concrete evidence from the submitted code or explanation, one meaningful concern, one actionable suggestion, and confidence (High, Medium, or Low).

The overall score should reflect the quality of the seven criteria. Do not assume requirements that were not provided. Distinguish missing evidence from a genuinely poor design. Keep feedback concise enough for a learner to act on.

Return exactly these seven criterion keys, each exactly once: ${CRITERION_KEYS.join(', ')}.`

  const userPrompt = `PROBLEM
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description:
${Array.isArray(problem.description) ? problem.description.join('\n') : problem.description}

Requirements:
${Array.isArray(problem.requirements) ? problem.requirements.map((item: string) => `- ${item}`).join('\n') : ''}

SUBMITTED JAVA CODE
${code}

DESIGN REASONING
${explanation}`

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: OUTPUT_SCHEMA,
            },
          }),
        },
      )

      if (!response.ok) {
        const detail = await response.text()
        const error = new Error(`Gemini evaluation failed: ${detail}`)
        lastError = error
        if (response.status >= 500 && attempt < GEMINI_MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 800))
          continue
        }
        throw error
      }

      const data = await response.json()
      const outputText = data?.candidates?.[0]?.content?.parts
        ?.map((part: any) => part?.text ?? '')
        .join('')
        .trim()

      if (!outputText) throw new Error('Gemini returned no evaluation output.')

      const evaluation = JSON.parse(outputText)
      if (!isValidEvaluation(evaluation)) {
        throw new Error('Gemini returned an invalid evaluation shape.')
      }

      return {
        id: `ai-attempt-${Date.now()}`,
        problemId: problem.id,
        submittedAt: new Date().toISOString(),
        overallScore: evaluation.overallScore,
        language: 'Java',
        summary: evaluation.summary,
        criteria: evaluation.criteria,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Gemini evaluation failed.')
      if (attempt < GEMINI_MAX_ATTEMPTS && lastError.message.includes('fetch')) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        continue
      }
      if (attempt === GEMINI_MAX_ATTEMPTS) break
    }
  }

  throw lastError ?? new Error('Gemini evaluation failed.')
}

function isValidEvaluation(value: any): boolean {
  if (!value || typeof value !== 'object') return false
  if (!Number.isInteger(value.overallScore) || value.overallScore < 0 || value.overallScore > 100) return false
  if (typeof value.summary !== 'string') return false
  if (!Array.isArray(value.criteria) || value.criteria.length !== 7) return false

  const keys = value.criteria.map((criterion: any) => criterion.key)
  if (new Set(keys).size !== 7) return false
  if (!CRITERION_KEYS.every((key) => keys.includes(key))) return false

  return value.criteria.every((criterion: any) =>
    CRITERION_KEYS.includes(criterion.key as CriterionKey) &&
    Number.isInteger(criterion.score) &&
    criterion.score >= 0 &&
    criterion.score <= 100 &&
    typeof criterion.evidence === 'string' &&
    typeof criterion.concern === 'string' &&
    typeof criterion.suggestion === 'string' &&
    ['High', 'Medium', 'Low'].includes(criterion.confidence),
  )
}

function withFallbackMessage(attempt: Attempt): Attempt {
  return {
    ...attempt,
    summary: 'Deterministic preflight used because AI review was temporarily unavailable. This feedback is based on the submission checks and is not an AI judgment.',
  }
}
