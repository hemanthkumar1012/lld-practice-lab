import { NextResponse } from 'next/server'
import { getProblem } from '@/lib/data'
import type { Confidence } from '@/lib/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function getHeaders() {
  return {
    apikey: SUPABASE_KEY!,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

async function supabaseFetch(
  path: string,
  options: RequestInit = {},
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase environment variables are missing.')
  }

  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers ?? {}),
    },
  })
}

async function resolveProblem(problemId: string) {
  const problem = getProblem(problemId)

  if (!problem) {
    throw new Error(`Unknown problem: ${problemId}`)
  }

  const existingResponse = await supabaseFetch(
    `lld_problems?slug=eq.${encodeURIComponent(problem.id)}&select=id,slug`,
  )

  if (!existingResponse.ok) {
    throw new Error(
      `Failed to look up problem: ${await existingResponse.text()}`,
    )
  }

  const existing = await existingResponse.json()

  if (existing.length > 0) {
    return existing[0].id as string
  }

  const createResponse = await supabaseFetch('lld_problems', {
    method: 'POST',
    body: JSON.stringify({
      title: problem.title,
      slug: problem.id,
      difficulty: problem.difficulty,
      description: problem.description.join('\n\n'),
    }),
  })

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create problem: ${await createResponse.text()}`,
    )
  }

  const created = await createResponse.json()

  if (!created.length) {
    throw new Error('Supabase did not return the created problem.')
  }

  const databaseProblemId = created[0].id as string

  const requirementsResponse = await supabaseFetch(
    'lld_requirements',
    {
      method: 'POST',
      body: JSON.stringify(
        problem.requirements.map((content, index) => ({
          problem_id: databaseProblemId,
          position: index,
          content,
        })),
      ),
    },
  )

  if (!requirementsResponse.ok) {
    throw new Error(
      `Failed to create requirements: ${await requirementsResponse.text()}`,
    )
  }

  return databaseProblemId
}

export async function GET() {
  try {
    const response = await supabaseFetch(
      'lld_attempts?select=id,problem_id,status,created_at,submitted_at,completed_at,lld_problems(slug,title),lld_submissions(code,explanation),lld_evaluations(id,status,overall_score,summary,completed_at,lld_criterion_results(criterion,score,evidence,concern,suggestion,confidence))&status=eq.COMPLETED&order=submitted_at.desc',
    )

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to load attempts: ${await response.text()}`,
        },
        { status: 500 },
      )
    }

    const rows = await response.json()

    const attempts = rows
      .map((row: any) => {
        const evaluation = Array.isArray(row.lld_evaluations)
          ? row.lld_evaluations[0]
          : row.lld_evaluations

        if (!evaluation) {
          return null
        }

        const problem = Array.isArray(row.lld_problems)
          ? row.lld_problems[0]
          : row.lld_problems

        const criteria = Array.isArray(
          evaluation.lld_criterion_results,
        )
          ? evaluation.lld_criterion_results
          : []

        return {
          id: row.id,
          problemId: problem?.slug ?? row.problem_id,
          submittedAt:
            row.submitted_at ??
            row.completed_at ??
            row.created_at,
          overallScore: evaluation.overall_score ?? 0,
          language: 'Java' as const,
          summary:
            evaluation.summary ??
            'Evaluation completed successfully.',
          criteria: criteria.map((criterion: any) => ({
            key: criterion.criterion,
            score: criterion.score,
            evidence: criterion.evidence,
            concern: criterion.concern ?? '',
            suggestion: criterion.suggestion ?? '',
            confidence: normalizeConfidence(
              criterion.confidence,
            ),
          })),
        }
      })
      .filter(Boolean)

    return NextResponse.json({ attempts })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected server error.',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      problemId,
      code,
      explanation,
      overallScore,
      summary,
      criteria,
    } = body

    if (
      !problemId ||
      !code ||
      !explanation ||
      !Array.isArray(criteria)
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required submission fields.',
        },
        { status: 400 },
      )
    }

    const databaseProblemId =
      await resolveProblem(problemId)

    const now = new Date().toISOString()

    const attemptResponse = await supabaseFetch(
      'lld_attempts',
      {
        method: 'POST',
        body: JSON.stringify({
          problem_id: databaseProblemId,
          status: 'COMPLETED',
          submitted_at: now,
          completed_at: now,
        }),
      },
    )

    if (!attemptResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to create attempt: ${await attemptResponse.text()}`,
        },
        { status: 500 },
      )
    }

    const attempts = await attemptResponse.json()
    const attempt = attempts[0]

    if (!attempt?.id) {
      throw new Error(
        'Supabase did not return the created attempt.',
      )
    }

    const submissionResponse = await supabaseFetch(
      'lld_submissions',
      {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attempt.id,
          code,
          explanation,
        }),
      },
    )

    if (!submissionResponse.ok) {
      throw new Error(
        `Failed to save submission: ${await submissionResponse.text()}`,
      )
    }

    const evaluationResponse = await supabaseFetch(
      'lld_evaluations',
      {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attempt.id,
          status: 'COMPLETED',
          overall_score: overallScore,
          summary,
          completed_at: now,
        }),
      },
    )

    if (!evaluationResponse.ok) {
      throw new Error(
        `Failed to save evaluation: ${await evaluationResponse.text()}`,
      )
    }

    const evaluations = await evaluationResponse.json()
    const evaluation = evaluations[0]

    if (!evaluation?.id) {
      throw new Error(
        'Supabase did not return the created evaluation.',
      )
    }

    const criterionRows = criteria.map(
      (criterion: {
        key: string
        score: number
        evidence: string
        concern?: string
        suggestion?: string
        confidence: Confidence | number
      }) => ({
        evaluation_id: evaluation.id,
        criterion: criterion.key,
        score: criterion.score,
        evidence: criterion.evidence,
        concern: criterion.concern ?? '',
        suggestion: criterion.suggestion ?? '',
        confidence: confidenceToNumber(
          criterion.confidence,
        ),
      }),
    )

    if (criterionRows.length > 0) {
      const criteriaResponse = await supabaseFetch(
        'lld_criterion_results',
        {
          method: 'POST',
          body: JSON.stringify(criterionRows),
        },
      )

      if (!criteriaResponse.ok) {
        throw new Error(
          `Failed to save criterion results: ${await criteriaResponse.text()}`,
        )
      }
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected server error.',
      },
      { status: 500 },
    )
  }
}

function confidenceToNumber(
  confidence: Confidence | number,
): number {
  if (typeof confidence === 'number') {
    return confidence
  }

  if (confidence === 'High') {
    return 0.9
  }

  if (confidence === 'Medium') {
    return 0.7
  }

  return 0.5
}

function normalizeConfidence(
  confidence: unknown,
): Confidence {
  if (typeof confidence === 'number') {
    if (confidence >= 0.8) {
      return 'High'
    }

    if (confidence >= 0.6) {
      return 'Medium'
    }

    return 'Low'
  }

  if (
    confidence === 'High' ||
    confidence === 'Medium' ||
    confidence === 'Low'
  ) {
    return confidence
  }

  return 'Medium'
}
