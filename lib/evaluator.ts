import {
  CRITERION_KEYS,
  type Attempt,
  type Confidence,
  type CriterionKey,
  type Problem,
} from '@/lib/types'

const CHECKS: Record<CriterionKey, string[]> = {
  requirementUnderstanding: ['vehicle', 'spot', 'ticket', 'fee', 'level'],
  responsibilityCohesion: ['responsibility', 'separate', 'allocation', 'ticket', 'pricing'],
  coupling: ['interface', 'dependency', 'decouple', 'coupling'],
  encapsulationAbstraction: ['private', 'interface', 'enum', 'abstract', 'encapsulat'],
  extensibility: ['strategy', 'extensib', 'new vehicle', 'open/closed', 'without modifying'],
  testability: ['test', 'inject', 'dependency', 'interface', 'separate'],
  designReasoning: ['why', 'trade-off', 'tradeoff', 'decision', 'because'],
}

const LABELS: Record<CriterionKey, string> = {
  requirementUnderstanding: 'requirement understanding',
  responsibilityCohesion: 'responsibility and cohesion',
  coupling: 'coupling',
  encapsulationAbstraction: 'encapsulation and abstraction',
  extensibility: 'extensibility',
  testability: 'testability',
  designReasoning: 'design reasoning',
}

function scoreCriterion(key: CriterionKey, text: string, problem: Problem) {
  const normalized = text.toLowerCase()
  const matches = CHECKS[key].filter((term) => normalized.includes(term))
  const requirementMatches = problem.requirements.filter((requirement) => {
    const words = requirement.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 4)
    return words.some((word) => normalized.includes(word))
  }).length

  let score = 35 + Math.min(matches.length * 8, 40)
  if (key === 'requirementUnderstanding') score += Math.min(requirementMatches * 4, 25)
  if (text.length >= 450) score += 8
  if (text.length >= 900) score += 5
  score = Math.max(0, Math.min(100, score))

  const evidence = matches.length
    ? `Found explicit evidence for ${LABELS[key]}: ${matches.slice(0, 3).join(', ')}.`
    : `No strong explicit signal for ${LABELS[key]} was detected by the rule-based evaluator.`

  const concern = score >= 75
    ? 'No major issue detected by the deterministic checks; deeper semantic review is still useful.'
    : 'The submission has limited explicit evidence for this criterion.'

  const suggestion = score >= 75
    ? `Explain one concrete ${LABELS[key]} decision and the change it protects against.`
    : `Add a concrete ${LABELS[key]} decision and explain why it belongs in the model.`

  const confidence: Confidence = matches.length >= 3 ? 'High' : matches.length >= 1 ? 'Medium' : 'Low'
  return { key, score, evidence, concern, suggestion, confidence }
}

export function evaluateSubmission(problem: Problem, code: string, notes: string): Attempt {
  const combined = `${code}\n${notes}`
  const criteria = CRITERION_KEYS.map((key) => scoreCriterion(key, combined, problem))
  const overallScore = Math.round(criteria.reduce((sum, result) => sum + result.score, 0) / criteria.length)

  return {
    id: `attempt-${Date.now()}`,
    problemId: problem.id,
    submittedAt: new Date().toISOString(),
    overallScore,
    language: 'Java',
    summary: `Rule-based preflight score: ${overallScore}/100. The evaluator checked explicit design signals across the seven rubric criteria. This is deterministic feedback, not an AI judgment.`,
    criteria,
  }
}
