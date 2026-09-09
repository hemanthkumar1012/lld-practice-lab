import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-3.8-flash'

const CRITERIA = [
  'Requirement Understanding',
  'Responsibility & Cohesion',
  'Coupling',
  'Encapsulation & Abstraction',
  'Extensibility',
  'Testability',
  'Design Reasoning',
] as const

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
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { problem, code, explanation } = body ?? {}

    if (!problem || !code || !explanation) {
      return NextResponse.json(
        { error: 'Problem, code, and explanation are required.' },
        { status: 400 },
      )
    }

    const systemPrompt = `You are a senior software engineer evaluating a junior developer's low-level design submission.

Evaluate the design, not coding style alone. Be evidence-based and fair. Do not reward buzzwords unless the code or explanation demonstrates the underlying design decision.

Score these seven criteria from 0 to 100:
1. Requirement Understanding
2. Responsibility & Cohesion
3. Coupling
4. Encapsulation & Abstraction
5. Extensibility
6. Testability
7. Design Reasoning

For every criterion provide concrete evidence from the submitted code or explanation, one meaningful concern, one actionable suggestion, and confidence (High, Medium, or Low).

The overall score should reflect the quality of the seven criteria. Do not assume requirements that were not provided. Distinguish missing evidence from a genuinely poor design. Keep feedback concise enough for a learner to act on.

Return exactly seven criteria, one for each named criterion, with no duplicates.`

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: OUTPUT_SCHEMA,
          },
        }),
      },
    )

    if (!response.ok) {
      const detail = await response.text()
      return NextResponse.json(
        { error: `Gemini evaluation failed: ${detail}` },
        { status: 502 },
      )
    }

    const data = await response.json()
    const outputText = data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text ?? '')
      .join('')
      .trim()

    if (!outputText) {
      throw new Error('Gemini returned no evaluation output.')
    }

    const evaluation = JSON.parse(outputText)

    if (!isValidEvaluation(evaluation)) {
      throw new Error('Gemini returned an invalid evaluation shape.')
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected AI evaluation error.',
      },
      { status: 500 },
    )
  }
}

function isValidEvaluation(value: any): boolean {
  if (!value || typeof value !== 'object') return false
  if (!Number.isInteger(value.overallScore) || value.overallScore < 0 || value.overallScore > 100) return false
  if (typeof value.summary !== 'string') return false
  if (!Array.isArray(value.criteria) || value.criteria.length !== 7) return false

  const keys = value.criteria.map((criterion: any) => criterion.key)
  if (new Set(keys).size !== 7) return false

  return value.criteria.every((criterion: any) =>
    CRITERIA.includes(criterion.key) &&
    Number.isInteger(criterion.score) &&
    criterion.score >= 0 &&
    criterion.score <= 100 &&
    typeof criterion.evidence === 'string' &&
    typeof criterion.concern === 'string' &&
    typeof criterion.suggestion === 'string' &&
    ['High', 'Medium', 'Low'].includes(criterion.confidence),
  )
}
