# Design Note — LLD Practice Lab

## Overall approach

I kept the application as one Next.js application because the assignment is small and has one main workflow. I did not want to spend the two-day window building infrastructure that the learner would never see.

The browser handles the practice experience. API routes handle evaluation and persistence. Supabase stores the problems, attempts, submissions, and evaluation results.

```text
Problem Library
      ↓
Practice Workspace
      ↓
Submit
      ↓
Evaluation
   ↙       ↘
Rules      Gemini
   \       /
    Structured Feedback
           ↓
        Supabase
           ↓
      History / Retry
```

## Main objects

- **Problem** — the LLD question, requirements, difficulty, and concepts.
- **Attempt** — one try by a learner for a problem.
- **Submission** — the evidence submitted for an attempt. Right now this is Java code and written reasoning.
- **Evaluation** — the review produced for an attempt.
- **CriterionResult** — one criterion's score and supporting feedback.
- **Evaluator** — the boundary around evaluation so the practice flow does not depend on one evaluator.

The important part is that these responsibilities are separate without turning the project into a complicated architecture.

## Change test A — if submissions become diagrams

I did not make the practice page depend on a specific editor type. The current submission is code plus written reasoning. If I add a diagram submission later, I can add another submission representation without changing the basic attempt/history flow.

## Change test B — if the evaluator changes

The learner should not care whether the review came from Gemini, deterministic rules, or a human reviewer. The UI consumes the same evaluation shape. That means another evaluator can be added without rebuilding the practice flow.

## Evaluation lifecycle

The UI shows:

**Submitted → Evaluating → Completed**

A failed evaluation can also be shown as a failure state. The important thing is that a temporary AI problem should not be treated as the learner's problem. The API retries transient Gemini failures and uses deterministic feedback as a fallback.

## Why I did not use microservices

There is one main workflow, very little traffic, and a two-day deadline. A monolith is easier to build, debug, and deploy here. I still kept the evaluation and persistence responsibilities separate so the design can grow later if the product actually needs it.

## Database

The LLD data is kept in its own tables:

`lld_problems` → `lld_requirements`

`lld_attempts` → `lld_submissions`

`lld_attempts` → `lld_evaluations` → `lld_criterion_results`

Attempts can reference an authenticated Supabase user. Row-level security is enabled on the LLD tables. The current anonymous policies are suitable for this assignment demo, but I would tighten them before opening the application to real multi-user traffic.

## Failure handling

Gemini output is validated before it is used. The evaluator expects all seven criteria and checks their score ranges and fields. If Gemini is unavailable, the application falls back to deterministic preflight feedback instead of leaving the learner with a broken submission flow.
