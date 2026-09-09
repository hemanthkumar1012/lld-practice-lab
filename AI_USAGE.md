# AI Usage

## Where AI is used
Gemini is used only for qualitative review of a learner's LLD submission. The server sends the problem, requirements, Java code, and design reasoning to the model.

## Structured output
The evaluator requires seven fixed criteria:

1. Requirement Understanding
2. Responsibility & Cohesion
3. Coupling
4. Encapsulation & Abstraction
5. Extensibility
6. Testability
7. Design Reasoning

Each result contains a score, evidence, concern, suggestion, and confidence.

## Guardrails
- The API key is server-side only and is never sent to the browser.
- AI output is parsed as JSON and validated before it reaches the UI.
- Scores are bounded from 0–100 and all seven criteria must appear exactly once.
- The prompt tells the evaluator not to reward buzzwords without evidence.
- Deterministic preflight is used when AI is unavailable, and that feedback is explicitly labeled as deterministic rather than AI judgment.
- The system does not claim that AI feedback is infallible; learners should treat suggestions as review guidance.

## Why AI instead of only rules?
Rules can detect explicit signals such as interfaces, dependency injection, or tests, but they are weak at judging whether responsibilities are actually coherent or whether an abstraction is justified. AI is used for that qualitative layer while deterministic checks provide resilience and predictable baseline feedback.
