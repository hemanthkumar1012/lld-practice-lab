# Research Note — LLD Practice Lab

## What I was trying to solve

I wanted the platform to feel like an actual LLD practice session rather than just another code editor. The main problem I focused on was the gap between submitting a design and knowing what to improve next.

My target loop is:

**Pick a problem → think/design → submit → get useful feedback → review → try again**

## What I found useful for the MVP

- LLD interviews are not only about whether the code works. Responsibility, coupling, abstraction, extensibility, testability, and the reasoning behind the design matter too.
- A score by itself is not very useful. The feedback should point to something in the submitted code or explanation.
- The learner should get a clear next step instead of a long generic review.
- AI is useful for the parts that are difficult to judge with simple rules, especially design trade-offs and responsibility boundaries.
- The external evaluator can be slow or unavailable, so the application should not completely break when that happens.

## What I decided to build

For the two-day assignment I kept the scope small:

- 3 LLD problems: Parking Lot, Vending Machine, Elevator System
- Java code editor
- Written design explanation
- Submission and evaluation
- Seven review criteria
- Attempt history and retry
- Supabase persistence
- Gemini-assisted qualitative feedback

I deliberately did not build a diagram editor, leaderboard, social features, or microservices. Those would add work without improving the main learning loop for this MVP.

## Feedback approach

I split evaluation into two parts. Deterministic checks give a predictable baseline, while Gemini handles qualitative design review. The final feedback is structured as a score, evidence, concern, suggestion, and confidence for each criterion.

## What success means

For me, the important outcome is not how many pages a learner visits. It is whether someone can finish a problem, understand what was weak in the design, and immediately make another attempt with that feedback in mind.
