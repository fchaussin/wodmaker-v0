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

export interface Program {
  id: string
  name: string
  exercises: Exercise[]
  restBetweenExercises: number
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
