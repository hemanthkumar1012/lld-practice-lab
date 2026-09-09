import type { Attempt, Difficulty, Problem } from '@/lib/types'

/**
 * Static content layer for the MVP.
 *
 * Problems are real, curated content. Attempts are NOT seeded — they only
 * exist once a learner submits a solution and a real evaluation runs. Every
 * read goes through a small function (getProblems, getAttempt, etc.) so the UI
 * never touches the raw arrays directly. When Supabase + AI evaluation land,
 * only the bodies of these functions change — the call sites and return types
 * stay the same.
 */

/**
 * Learners start from a blank slate. The template is only a short comment
 * prompt — never a reference solution — so the work and the design decisions
 * are entirely the learner's own.
 */
const STARTER_TEMPLATE = `// Design your solution here.
// Think about responsibilities, abstractions, and extensibility.
`

const PROBLEMS: Problem[] = [
  {
    id: 'parking-lot',
    title: 'Parking Lot',
    difficulty: 'Easy',
    category: 'Systems Modeling',
    summary:
      'Design a multi-level parking lot that handles different vehicle sizes, spot allocation, ticketing, and fee calculation.',
    description: [
      'Design the object model for a parking lot that spans multiple levels. Vehicles of different sizes arrive, are assigned an appropriate spot, receive a ticket, and are charged based on how long they stayed.',
      'Focus on a clean domain model and clear separation between allocation, ticketing, and pricing. The design should make it easy to change the pricing rules or add a new vehicle type later.',
    ],
    requirements: [
      'Support motorcycles, cars, and trucks, each fitting into compatible spot sizes.',
      'The lot has multiple levels, each with a fixed number of spots per size.',
      'Assign an available spot on vehicle entry and free it on exit.',
      'Issue a ticket at entry that records the spot and entry time.',
      'Calculate the fee at exit using a configurable pricing strategy.',
      'Expose whether the lot (or a given size) is full.',
    ],
    concepts: [
      'Encapsulation of spot/level state',
      'Strategy pattern for pricing',
      'Enum-driven vehicle/spot compatibility',
      'Single Responsibility across allocation vs. billing',
      'Open/Closed for new vehicle types',
    ],
    starterCode: STARTER_TEMPLATE,
    estimatedMinutes: 35,
  },
  {
    id: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'Medium',
    category: 'State Machines',
    summary:
      'Model a vending machine as an explicit state machine that accepts coins, dispenses products, tracks inventory, and returns change.',
    description: [
      'Design a vending machine that transitions through clear states as a customer inserts money, selects a product, and receives it along with any change.',
      'The core challenge is modeling behavior that depends on current state without a tangle of conditionals. Inventory and coin handling should be cohesive and independently testable.',
    ],
    requirements: [
      'Accept coins of several denominations and track the running balance.',
      'Allow selecting a product only when enough money has been inserted.',
      'Dispense the product and return the correct change, then reset.',
      'Reject selection when the product is out of stock or funds are insufficient.',
      'Allow the customer to cancel and refund inserted money at any time.',
      'Track inventory per product slot and support restocking.',
    ],
    concepts: [
      'State pattern for machine transitions',
      'Cohesion between inventory and money handling',
      'Guarding invalid transitions',
      'Abstraction over payment/change logic',
      'Testability of each state in isolation',
    ],
    starterCode: STARTER_TEMPLATE,
    estimatedMinutes: 45,
  },
  {
    id: 'elevator-system',
    title: 'Elevator System',
    difficulty: 'Hard',
    category: 'Concurrency & Scheduling',
    summary:
      'Design a controller for a building with multiple elevators, dispatching cars to hall calls with a pluggable scheduling strategy.',
    description: [
      'Design the object model and control flow for a bank of elevators serving a multi-floor building. Hall calls (up/down on a floor) and cabin calls (a floor button inside a car) must both be served efficiently.',
      'The dispatcher decides which car answers a hall call. The scheduling policy should be swappable without touching the car or controller internals, and the model should leave room for concurrency concerns.',
    ],
    requirements: [
      'Support N elevator cars serving F floors.',
      'Handle hall calls (floor + direction) and cabin calls (target floor).',
      'A dispatcher assigns a hall call to the most suitable car.',
      'Each car tracks its current floor, direction, and pending stops.',
      'The scheduling strategy must be replaceable (e.g. nearest-car, look).',
      'Expose car movement so the system can advance one step at a time.',
    ],
    concepts: [
      'Strategy pattern for dispatching/scheduling',
      'Separation of controller vs. car responsibilities',
      'Low coupling between dispatcher and scheduling policy',
      'Modeling direction/state transitions',
      'Extensibility for new scheduling algorithms',
    ],
    starterCode: STARTER_TEMPLATE,
    estimatedMinutes: 60,
  },
]

/**
 * No attempts exist until a learner submits a real solution. This stays empty
 * on purpose — invented scores would misrepresent the learner's history. When
 * persistence lands, this becomes a query against the attempts table.
 */
const ATTEMPTS: Attempt[] = []

// --- Read API (swap these bodies for Supabase/AI later) ---------------------

export function getProblems(): Problem[] {
  return PROBLEMS
}

export function getProblem(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id)
}

export function getAttempts(): Attempt[] {
  return [...ATTEMPTS].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  )
}

export function getAttemptsForProblem(problemId: string): Attempt[] {
  return getAttempts().filter((a) => a.problemId === problemId)
}

export function getAttempt(id: string): Attempt | undefined {
  return ATTEMPTS.find((a) => a.id === id)
}

export function difficultyRank(d: Difficulty): number {
  return d === 'Easy' ? 0 : d === 'Medium' ? 1 : 2
}
