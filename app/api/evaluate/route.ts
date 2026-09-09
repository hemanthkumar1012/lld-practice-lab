import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

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
  type: 'object',
  additionalProperties: false,
  properties: {
    overallScore: { type: 'integer', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    criteria: {
      type: 'array',
      minItems: 7,
      maxItems: 7,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          key: { type: 'string', enum: [...CRITERIA] },
          score: { type: 'integer', minimum: 0, maximum: 100 },
          evidence: { type: 'string' },
          concern: { type: 'string' },
          suggestion: { type: 'string' },
          confidence: { type: 'string', enum: ['High', 'Medium', 'Low'] },
        },
        required: ['key', 'score', 'evidence', 'concern', 'suggestion', 'confidence'],
      },
    },
  },
  required: ['overallScore', 'summary', 'criteria'],
} as const

export async function POST(request: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured on the server.' },
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

The overall score should reflect the quality of the seven criteria. Do not assume requirements that were not provided. Distinguish missing evidence from a genuinely poor design. Keep feedback concise enough for a learner to act on.`

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

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'lld_evaluation',
            strict: true,
            schema: OUTPUT_SCHEMA,
          },
        },
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return NextResponse.json(
        { error: `OpenAI evaluation failed: ${detail}` },
        { status: 502 },
      )
    }

    const data = await response.json()
    const outputText = extractOutputText(data)

    if (!outputText) {
      throw new Error('OpenAI returned no evaluation output.')
    }

    const evaluation = JSON.parse(outputText)

    if (!isValidEvaluation(evaluation)) {
      throw new Error('OpenAI returned an invalid evaluation shape.')
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

function extractOutputText(data: any): string | null {
  if (typeof data?.output_text === 'string') {
    return data.output_text
  }

  const output = Array.isArray(data?.output) ? data.output : []

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : []

    for (const part of content) {
      if (typeof part?.text === 'string') {
        return part.text
      }
    }
  }

  return null
}

function isValidEvaluation(value: any): boolean {
  if (!value || typeof value !== 'object') return false
  if (!Number.isInteger(value.overallScore)) return false
  if (typeof value.summary !== 'string') return false
  if (!Array.isArray(value.criteria) || value.criteria.length !== 7) return false

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
