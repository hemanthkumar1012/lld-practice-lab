# LLD Practice Lab

A focused practice platform for low-level design interviews. Learners solve a Java design problem, explain their decisions, submit, receive criterion-level feedback, and retry.

## MVP flow

**Choose problem → Design → Submit → Evaluate → Review → Retry**

### Included problems
- Parking Lot — Easy
- Vending Machine — Medium
- Elevator System — Hard

### Review rubric
- Requirement Understanding
- Responsibility & Cohesion
- Coupling
- Encapsulation & Abstraction
- Extensibility
- Testability
- Design Reasoning

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Gemini for qualitative evaluation
- Vercel deployment

## Engineering choices
The application is intentionally a small monolith. Domain concepts are separated from evaluation and persistence so future diagram submissions or human/rule-based evaluators can be introduced without rewriting the practice flow.

The evaluation API validates structured AI output and retries transient provider failures. If AI is unavailable, deterministic preflight feedback keeps the learner workflow functional and clearly labels the result.

## Local development

```bash
pnpm install
pnpm dev
```

Required environment variables for the deployed application:

```text
SUPABASE_URL
SUPABASE_KEY
GEMINI_API_KEY
```

`GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`.

## Project documents
- `RESEARCH.md` — learner/problem research and MVP rationale
- `DESIGN.md` — architecture, domain model, change tests, failure handling
- `AI_USAGE.md` — AI evaluation design and guardrails

## Submission evidence
The working application demonstrates the complete path from problem selection through submission, evaluation, structured review, persistence, history, and retry-oriented learning.
