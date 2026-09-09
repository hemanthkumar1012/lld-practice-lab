# Deployment Readiness

The repository is intended to be deployable as a single Next.js application.

## Required production configuration

Set these environment variables in Vercel for the Production environment:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key
- `GEMINI_API_KEY` — Gemini API key
- `GEMINI_MODEL` — optional; defaults to `gemini-3.6-flash`

Do not commit secrets to GitHub. `.env*.local` files are ignored by Git.

## Supabase

The required LLD tables are:

- `lld_problems`
- `lld_requirements`
- `lld_attempts`
- `lld_submissions`
- `lld_evaluations`
- `lld_criterion_results`

The existing application expects these tables to be present in the configured Supabase project.

## Production smoke test

After deployment:

1. Open the home page.
2. Open Problems.
3. Open Parking Lot.
4. Enter Java code and design reasoning.
5. Submit.
6. Confirm Submitted → Evaluating → Completed is visible.
7. Confirm the overall score and all seven criterion results appear.
8. Refresh History and confirm the attempt persists.
9. Open the saved attempt and confirm evidence, concerns, suggestions, and confidence are visible.
10. Submit another attempt and confirm it is stored separately.

## AI failure behavior

If Gemini is unavailable or not configured, the evaluation endpoint falls back to deterministic preflight feedback so the learner can still complete the practice flow.

## Final deployment note

No application feature requires a separate worker, queue, container, or microservice. The project is intentionally a small monolith suitable for Vercel deployment.
