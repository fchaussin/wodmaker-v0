export type ExerciseMode = "timed" | "manual"

export interface Exercise {
  id: string
  name: string
  mode: ExerciseMode
  prepareTime: number
  workTime?: number // Only for timed mode
  restTime: number
  rounds: number
  cycles: number
  restBetweenCycles: number
  // Manual mode specific
  repetitions?: number
  load?: number
}

export interface ExerciseGroup {
  id: string
  name?: string // Optional name for the group
  exercises: Exercise[]
  rounds: number // Number of times to repeat this group
  restBetweenExercises: number // Rest time between exercises within the group
}

export type ProgramItem = { type: "exercise"; data: Exercise } | { type: "group"; data: ExerciseGroup }

export interface Program {
  id: string
  name: string
  items: ProgramItem[] // Changed from groups to items
  restBetweenItems: number // Rest time between items (exercises or groups)
}

export interface ExerciseConfig {
  mode: ExerciseMode
  prepareTime: number
  workTime?: number
  restTime: number
  rounds: number
  cycles: number
  restBetweenCycles: number
  repetitions?: number
  load?: number
}

export const createDefaultExercise = (name = "New Exercise"): Exercise => ({
  id: crypto.randomUUID(),
  name,
  mode: "timed",
  prepareTime: 5,
  workTime: 45,
  restTime: 15,
  rounds: 3,
  cycles: 4,
  restBetweenCycles: 60,
  repetitions: 12,
  load: 30,
})

export const exerciseToConfig = (exercise: Exercise): ExerciseConfig => ({
  mode: exercise.mode,
  prepareTime: exercise.prepareTime,
  workTime: exercise.workTime,
  restTime: exercise.restTime,
  rounds: exercise.rounds,
  cycles: exercise.cycles,
  restBetweenCycles: exercise.restBetweenCycles,
  repetitions: exercise.repetitions,
  load: exercise.load,
})

export const createDefaultGroup = (exercise?: Exercise): ExerciseGroup => ({
  id: crypto.randomUUID(),
  exercises: exercise ? [exercise] : [],
  rounds: 1,
  restBetweenExercises: 60,
})

export const createDefaultProgram = (name = "New Program"): Program => ({
  id: crypto.randomUUID(),
  name,
  items: [{ type: "exercise", data: createDefaultExercise() }],
  restBetweenItems: 60,
})

export const createExerciseItem = (exercise: Exercise): ProgramItem => ({
  type: "exercise",
  data: exercise,
})

export const createGroupItem = (exercises: Exercise[], rounds = 1): ProgramItem => ({
  type: "group",
  data: {
    id: crypto.randomUUID(),
    exercises,
    rounds,
    restBetweenExercises: 60,
  },
})
