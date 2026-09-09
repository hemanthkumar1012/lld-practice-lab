# Design Note — LLD Practice Lab

## Architecture
A small Next.js monolith is sufficient for the two-day MVP. The browser renders the practice flow; API routes own persistence and evaluation orchestration; Supabase PostgreSQL stores attempts and structured evaluation results.

```text
Problem Library
      ↓
Practice Workspace
      ↓
Submit
      ↓
/api/evaluate ── deterministic preflight
      │
      └────────── Gemini qualitative review
      ↓
Structured Feedback
      ↓
Supabase persistence
      ↓
History / Retry
```

## Domain model
- **Problem** — prompt, requirements, difficulty, concepts.
- **Attempt** — one learner run through a problem and its lifecycle.
- **Submission** — code plus design reasoning; isolated so another evidence format can be added later.
- **Evaluation** — one result for an attempt.
- **CriterionResult** — score plus evidence, concern, suggestion, confidence.
- **Evaluator** — abstraction for deterministic, AI, or future human evaluation.

## Change test A — text to diagram
The submission concept is kept separate from the attempt. Today the UI sends Java code and text reasoning. A future `DiagramSubmission` can carry a diagram representation without changing the attempt/history concepts or the practice flow.

## Change test B — evaluator replacement
Evaluation is treated as a separate responsibility. The flow does not depend on Gemini-specific output; it consumes the common evaluation shape. A future `HumanEvaluator` or stronger rule-based evaluator can replace or complement the AI implementation without rewriting the practice workflow.

## Evaluation lifecycle
The UI communicates `Submitted → Evaluating → Completed` and can surface `Failed`. The MVP persists the completed result once evaluation returns. If Gemini is missing or temporarily unavailable, deterministic preflight feedback keeps the learner flow usable rather than losing the submission.

## Why not microservices?
The product has one narrow workflow, low scale, and a two-day implementation constraint. A monolith reduces deployment, debugging, and operational complexity while preserving clean domain boundaries in code.

## Data model
`lld_problems` → `lld_requirements`

`lld_attempts` → `lld_submissions`

`lld_attempts` → `lld_evaluations` → `lld_criterion_results`

Attempts reference an authenticated user when available. Row-level security is enabled on the LLD tables; production hardening should narrow anonymous policies before a real multi-user launch.

## Failure handling
Gemini failures are not presented as learner failures. The evaluation route retries transient provider errors once and then falls back to deterministic feedback. Invalid AI output is rejected by schema validation rather than being persisted as trustworthy feedback.
