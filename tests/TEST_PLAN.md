# Test Plan

The project keeps the test surface small and focused on the learner's critical path. The goal is to verify behavior that would break the product, not to maximize test count.

## Acceptance checks

| Area | Check | Expected result |
|---|---|---|
| Problem library | Open each of the three problems | Problem statement, requirements, concepts, and Java editor load correctly |
| Submission | Submit Java code and design explanation | Attempt is created and evaluation starts |
| Validation | Submit with missing code or explanation | API returns a clear 400 validation error |
| Evaluation | Valid submission reaches evaluation | Seven rubric criteria and an overall score are returned |
| AI failure | Gemini is unavailable | Deterministic preflight feedback is returned instead of breaking the practice flow |
| Persistence | Refresh after a completed submission | Attempt remains visible in History and Dashboard |
| Feedback | Open an attempt | Evidence, concern, suggestion, confidence, and criterion scores are visible |
| Retry | Start another attempt for the same problem | New submission is treated as a separate attempt |
| History | Open History with no attempts | Empty state is shown instead of fabricated scores |
| Responsive UI | Use desktop and narrow browser widths | Core navigation and submission flow remain usable |

## Change tests

### A — Submission representation can change
The practice flow should not depend on a diagram editor. Today a submission contains Java code and written reasoning. A future `DiagramSubmission` can be added behind the submission boundary without changing problem selection, attempts, history, or evaluation orchestration.

### B — Evaluator can change
The practice flow calls the evaluation boundary rather than depending directly on Gemini. A future rule-based-only or human evaluator can implement the same responsibility without rewriting the learner workflow.

## Manual smoke test

1. Open `/problems`.
2. Select **Parking Lot**.
3. Enter Java code and a short design explanation.
4. Submit and wait for the result state.
5. Confirm all seven criteria are shown.
6. Open the attempt from History.
7. Return to the problem and submit a second attempt.
8. Confirm both attempts remain in History.

For a demo, the most important invariant is: **a learner can submit, receive useful feedback, revisit it, and try again even when the external AI provider has a temporary failure.**
