# AI Usage

I used AI as part of the implementation, mainly to speed up development and to help with the qualitative evaluation part of the product. I did not make the whole application depend on AI output.

## Where AI is used

Gemini reviews a learner's LLD submission. The server sends the selected problem, its requirements, the submitted Java code, and the learner's design reasoning.

The model reviews seven areas:

1. Requirement Understanding
2. Responsibility & Cohesion
3. Coupling
4. Encapsulation & Abstraction
5. Extensibility
6. Testability
7. Design Reasoning

For each area I ask for a score, evidence, concern, suggestion, and confidence. This makes the feedback easier to display and gives the learner something concrete to work on.

## Why I used AI here

Simple rules are useful for checking obvious signals such as whether an interface or dependency injection is present. They are much weaker at deciding whether the responsibility split actually makes sense or whether an abstraction is useful.

I therefore used deterministic checks as the baseline and Gemini for the qualitative part of the review.

## Guardrails

- The Gemini API key stays on the server.
- The API expects JSON and validates the response before showing it to the learner.
- Scores must be between 0 and 100.
- Exactly the seven expected criteria must be returned.
- The evaluator is instructed to use evidence from the submission instead of rewarding design buzzwords.
- If Gemini is unavailable, deterministic feedback is returned so the main practice flow still works.
- AI feedback is presented as review guidance, not as an unquestionable answer.

## Development use

I also used AI assistance during development for implementation ideas, debugging, UI/content iteration, and documentation. I reviewed the generated changes against the actual project requirements and kept the architecture intentionally small for the two-day assignment.
