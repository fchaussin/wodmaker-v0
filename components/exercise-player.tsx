"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkoutEngine } from "@/hooks/use-workout-engine"
import { type Exercise, exerciseToConfig } from "@/types/exercise"
import { ExerciseForm } from "@/components/exercise-form"

type ExerciseView = "config" | "exercise"

interface ExercisePlayerProps {
  exercise?: Exercise
  onExerciseUpdate?: (exercise: Exercise) => void
}

interface ExercisePlayerRef {
  pause: () => void
}

const ExercisePlayer = forwardRef<ExercisePlayerRef, ExercisePlayerProps>(({ exercise, onExerciseUpdate }, ref) => {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(
    exercise || {
      id: crypto.randomUUID(),
      name: "Quick Exercise",
      mode: "timed",
      prepareTime: 5,
      workTime: 45,
      restTime: 15,
      rounds: 3,
      cycles: 4,
      restBetweenCycles: 60,
      repetitions: 12,
      load: 30,
    },
  )

  const [singleCycle, setSingleCycle] = useState(false)
  const [view, setView] = useState<ExerciseView>("config")

  const {
    state,
    start,
    pause,
    resume,
    reset,
    advancePhase,
    formatTime,
    getPhaseColor,
    getPhaseText,
    exerciseDuration,
  } = useWorkoutEngine({
    config: {
      ...exerciseToConfig(currentExercise),
      cycles: singleCycle ? 1 : currentExercise.cycles,
    },
  })

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (state.isRunning) {
        pause()
      }
    },
  }))

  const handleExerciseSave = (updatedExercise: Exercise) => {
    setCurrentExercise(updatedExercise)
    onExerciseUpdate?.(updatedExercise)
  }

  const startExercise = () => {
    setView("exercise")
    start()
  }

  const handleReset = () => {
    reset()
    setView("config")
  }

  const pauseResume = () => {
    if (state.isRunning) {
      pause()
    } else {
      resume()
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {view === "config" ? (
        <div className="flex-1 flex flex-col">
          <ExerciseForm exercise={currentExercise} onSave={handleExerciseSave} title="Exercise Configuration" />
          <div className="mt-4">
            <Button onClick={startExercise} className="w-full" size="sm">
              Start Exercise
            </Button>
          </div>
        </div>
      ) : (
        <Card className={`${getPhaseColor(state.currentPhase)} text-white flex-1 flex flex-col`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm">{currentExercise.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold mb-1">{getPhaseText(state.currentPhase)}</div>
              <div className="text-xs sm:text-sm opacity-90">
                Round {state.currentRound}/{currentExercise.rounds}
                {!singleCycle &&
                  currentExercise.cycles > 1 &&
                  ` • Cycle ${state.currentCycle}/${currentExercise.cycles}`}
              </div>
            </div>

            {state.currentPhase === "work" && currentExercise.mode === "manual" ? (
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">{currentExercise.repetitions} Reps</div>
                {currentExercise.load && currentExercise.load > 0 && (
                  <div className="text-xl sm:text-2xl opacity-90">@ {currentExercise.load}kg</div>
                )}
                <div className="text-sm opacity-75 mt-2">Duration: {formatTime(exerciseDuration)}</div>
              </div>
            ) : (
              <div className="text-6xl sm:text-7xl font-mono text-center font-bold">
                {formatTime(state.timeRemaining)}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {state.currentPhase === "work" && currentExercise.mode === "manual" ? (
                <Button onClick={advancePhase} size="sm" className="px-6 sm:px-8 bg-white/20 hover:bg-white/30">
                  Set Complete
                </Button>
              ) : state.currentPhase !== "finished" ? (
                <>
                  <Button onClick={pauseResume} variant="secondary" size="sm" className="px-4 sm:px-6">
                    {state.isRunning ? "Pause" : "Resume"}
                  </Button>
                  {(state.currentPhase === "work" ||
                    state.currentPhase === "rest" ||
                    state.currentPhase === "prepare") && (
                    <Button
                      onClick={advancePhase}
                      variant="secondary"
                      size="sm"
                      className="px-4 sm:px-6 bg-white/10 hover:bg-white/20"
                    >
                      Skip
                    </Button>
                  )}
                </>
              ) : null}

              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-4 sm:px-6"
              >
                {state.currentPhase === "finished" ? "New" : "End"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

ExercisePlayer.displayName = "ExercisePlayer"

export default ExercisePlayer
