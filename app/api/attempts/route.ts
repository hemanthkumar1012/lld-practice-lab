import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function POST(request: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json(
        { error: 'Supabase environment variables are missing.' },
        { status: 500 },
      )
    }

    const body = await request.json()

    const {
      problemId,
      code,
      explanation,
      overallScore,
      summary,
      criteria,
    } = body

    if (!problemId || !code || !explanation || !criteria) {
      return NextResponse.json(
        { error: 'Missing required submission fields.' },
        { status: 400 },
      )
    }

    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }

    const attemptResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lld_attempts`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          problem_id: problemId,
          status: 'COMPLETED',
          submitted_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        }),
      },
    )

    if (!attemptResponse.ok) {
      const error = await attemptResponse.text()
      return NextResponse.json(
        { error: `Failed to create attempt: ${error}` },
        { status: 500 },
      )
    }

    const attempts = await attemptResponse.json()
    const attempt = attempts[0]

    const submissionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lld_submissions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          attempt_id: attempt.id,
          code,
          explanation,
        }),
      },
    )

    if (!submissionResponse.ok) {
      const error = await submissionResponse.text()
      return NextResponse.json(
        { error: `Failed to save submission: ${error}` },
        { status: 500 },
      )
    }

    const evaluationResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lld_evaluations`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          attempt_id: attempt.id,
          status: 'COMPLETED',
          overall_score: overallScore,
          summary,
          completed_at: new Date().toISOString(),
        }),
      },
    )

    if (!evaluationResponse.ok) {
      const error = await evaluationResponse.text()
      return NextResponse.json(
        { error: `Failed to save evaluation: ${error}` },
        { status: 500 },
      )
    }

    const evaluations = await evaluationResponse.json()
    const evaluation = evaluations[0]

    const criteriaResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lld_criterion_results`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(
          criteria.map(
            (criterion: {
              key: string
              score: number
              evidence: string
              concern: string
              suggestion: string
              confidence: number
            }) => ({
              evaluation_id: evaluation.id,
              criterion: criterion.key,
              score: criterion.score,
              evidence: criterion.evidence,
              concern: criterion.concern,
              suggestion: criterion.suggestion,
              confidence: criterion.confidence,
            }),
          ),
        ),
      },
    )

    if (!criteriaResponse.ok) {
      const error = await criteriaResponse.text()
      return NextResponse.json(
        { error: `Failed to save criterion results: ${error}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
    })
  } catch {
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 },
    )
  }
}
