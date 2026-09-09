# Research Note — LLD Practice Lab

## Learner problem
Most LLD practice is passive: a learner reads a prompt, writes code, and gets little evidence about whether the design decisions were good. The useful learning loop is **problem → design → submission → review → retry**.

## Observed patterns
- Interview-style LLD tasks are evaluated on more than compilation: requirements, responsibility boundaries, coupling, abstraction, extensibility, testability, and reasoning matter.
- Feedback is more useful when it cites evidence from the submission instead of giving a generic score.
- A score without a next action does not create a strong retry loop.
- AI is useful for qualitative design judgment, but deterministic checks are better for objective signals and resilience.
- Evaluation may be slow or unavailable, so the product needs explicit evaluation states and a safe fallback.

## Product implication
The MVP should stay narrow: three curated Java LLD problems, a code editor, written design reasoning, one submission, structured feedback, and attempt history. A diagram editor, social features, leaderboards, and distributed services are intentionally out of scope.

## Evaluation approach
The platform separates deterministic preflight checks from AI review. Deterministic checks provide predictable baseline feedback. Gemini reviews design quality and returns a strict seven-criterion structure: criterion, score, evidence, concern, suggestion, and confidence.

## Success signal
A successful learner session ends with a concrete improvement target and an easy path to retry the same problem. The primary metric is therefore completed reviewed attempts and repeat attempts, not page views.
