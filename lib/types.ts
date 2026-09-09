export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Confidence = 'Low' | 'Medium' | 'High'

export interface Problem {
  /** Stable slug used in URLs and as a foreign key for attempts. */
  id: string
  title: string
  difficulty: Difficulty
  category: string
  /** One-line summary shown in cards and lists. */
  summary: string
  /** Full problem statement, may contain multiple paragraphs. */
  description: string[]
  requirements: string[]
  /** LLD concepts a strong solution is expected to demonstrate. */
  concepts: string[]
  /** Prefilled Java scaffold for the editor. */
  starterCode: string
  estimatedMinutes: number
}

/**
 * The seven evaluation criteria. Order here is the canonical display order.
 */
export const CRITERION_KEYS = [
  'requirementUnderstanding',
  'responsibilityCohesion',
  'coupling',
  'encapsulationAbstraction',
  'extensibility',
  'testability',
  'designReasoning',
] as const

export type CriterionKey = (typeof CRITERION_KEYS)[number]

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  requirementUnderstanding: 'Requirement Understanding',
  responsibilityCohesion: 'Responsibility & Cohesion',
  coupling: 'Coupling',
  encapsulationAbstraction: 'Encapsulation & Abstraction',
  extensibility: 'Extensibility',
  testability: 'Testability',
  designReasoning: 'Design Reasoning',
}

export interface CriterionResult {
  key: CriterionKey
  /** Score out of 100. */
  score: number
  evidence: string
  concern: string
  suggestion: string
  confidence: Confidence
}

export interface Attempt {
  id: string
  problemId: string
  /** ISO timestamp of submission. */
  submittedAt: string
  /** Overall score out of 100. */
  overallScore: number
  language: 'Java'
  summary: string
  criteria: CriterionResult[]
}
