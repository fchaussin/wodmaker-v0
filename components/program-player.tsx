"use client"

import { useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkoutEngine } from "@/hooks/use-workout-engine"
import { type Program, exerciseToConfig } from "@/types/exercise"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"

interface ProgramPlayerProps {
  program: Program
  onComplete?: () => void
}

interface ProgramPlayerRef {
  pause: () => void
}

const ProgramPlayer = forwardRef<ProgramPlayerRef, ProgramPlayerProps>(({ program, onComplete }, ref) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [currentExerciseIndexInGroup, setCurrentExerciseIndexInGroup] = useState(0)
  const [currentItemRound, setCurrentItemRound] = useState(1)
  const [isRestBetweenExercises, setIsRestBetweenExercises] = useState(false)
  const [isRestBetweenItems, setIsRestBetweenItems] = useState(false)
  const [restTimeRemaining, setRestTimeRemaining] = useState(0)
  const [isProgramPaused, setIsProgramPaused] = useState(false)

  const [currentReps, setCurrentReps] = useState<number | undefined>(undefined)
  const [currentLoad, setCurrentLoad] = useState<number | undefined>(undefined)

  const currentItem = program.items[currentItemIndex]
  const currentExercise =
    currentItem?.type === "exercise"
      ? currentItem.data
      : currentItem?.type === "group"
        ? currentItem.data.exercises[currentExerciseIndexInGroup]
        : undefined

  const currentGroup = currentItem?.type === "group" ? currentItem.data : undefined

  const {
    state: workoutState,
    start,
    pause,
    resume,
    reset: resetWorkout,
    advancePhase,
    formatTime,
    getPhaseColor,
    getPhaseText,
    exerciseDuration,
  } = useWorkoutEngine({
    config: currentExercise ? exerciseToConfig(currentExercise) : ({} as any),
    onWorkoutComplete: handleExerciseComplete,
  })

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (workoutState.isRunning) {
        pause()
      }
      setIsProgramPaused(true)
    },
  }))

  function handleExerciseComplete() {
    console.log(
      `[v0] Exercise completed: ${currentExercise?.name}, Item: ${currentItemIndex + 1}, Round: ${currentItemRound}`,
    )

    if (currentItem.type === "exercise") {
      // Standalone exercise
      const exercise = currentItem.data
      if (currentItemRound < exercise.rounds) {
        // Continue rounds
        setCurrentItemRound(currentItemRound + 1)
        setTimeout(() => start(), 100)
      } else {
        // Move to next item
        moveToNextItem()
      }
    } else if (currentItem.type === "group") {
      // Group exercise
      const group = currentItem.data
      const isLastExerciseInGroup = currentExerciseIndexInGroup === group.exercises.length - 1

      if (isLastExerciseInGroup) {
        // Check if we need to repeat the group
        if (currentItemRound < group.rounds) {
          // Start rest, then repeat group
          setCurrentItemRound(currentItemRound + 1)
          setCurrentExerciseIndexInGroup(0)
          startRestBetweenExercises()
        } else {
          // Group is complete, move to next item
          moveToNextItem()
        }
      } else {
        // Move to next exercise in group
        setCurrentExerciseIndexInGroup(currentExerciseIndexInGroup + 1)
        startRestBetweenExercises()
      }
    }
  }

  function moveToNextItem() {
    const isLastItem = currentItemIndex === program.items.length - 1

    if (isLastItem) {
      // Program complete
      onComplete?.()
    } else {
      // Move to next item
      setCurrentItemIndex(currentItemIndex + 1)
      setCurrentExerciseIndexInGroup(0)
      setCurrentItemRound(1)
      startRestBetweenItems()
    }
  }

  function startRestBetweenExercises() {
    if (currentGroup) {
      setIsRestBetweenExercises(true)
      setRestTimeRemaining(currentGroup.restBetweenExercises)
    }
  }

  function startRestBetweenItems() {
    setIsRestBetweenItems(true)
    setRestTimeRemaining(program.restBetweenItems)
  }

  useEffect(() => {
    if ((isRestBetweenExercises || isRestBetweenItems) && restTimeRemaining > 0 && !isProgramPaused) {
      const timer = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            if (isRestBetweenExercises) {
              setIsRestBetweenExercises(false)
              setTimeout(() => start(), 100)
            } else if (isRestBetweenItems) {
              setIsRestBetweenItems(false)
              setTimeout(() => start(), 100)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isRestBetweenExercises, isRestBetweenItems, restTimeRemaining, isProgramPaused, start])

  useEffect(() => {
    if (currentExercise) {
      start()
    }
  }, []) // Only run on mount

  const handlePauseResume = () => {
    if (isRestBetweenExercises || isRestBetweenItems) {
      setIsProgramPaused(!isProgramPaused)
    } else {
      if (workoutState.isRunning) {
        pause()
      } else {
        resume()
      }
    }
  }

  const handleSkipRest = () => {
    if (isRestBetweenExercises) {
      setIsRestBetweenExercises(false)
      setRestTimeRemaining(0)
      start()
    } else if (isRestBetweenItems) {
      setIsRestBetweenItems(false)
      setRestTimeRemaining(0)
      start()
    }
  }

  if (!currentExercise) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No exercises in program</p>
        </CardContent>
      </Card>
    )
  }

  if (isRestBetweenExercises || isRestBetweenItems) {
    return (
      <Card className="bg-orange-600 text-white flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-sm">{program.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold mb-1">
              {isRestBetweenItems ? "REST BETWEEN ITEMS" : "REST"}
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              Item {currentItemIndex + 1}/{program.items.length} • Round {currentItemRound}
            </div>
            {isRestBetweenExercises && currentGroup && (
              <div className="text-xs sm:text-sm opacity-90 mt-1">
                Next: {currentGroup.exercises[currentExerciseIndexInGroup]?.name || "Next Exercise"}
              </div>
            )}
            {isRestBetweenItems && (
              <div className="text-xs sm:text-sm opacity-90 mt-1">
                Next:{" "}
                {program.items[currentItemIndex]?.type === "exercise"
                  ? program.items[currentItemIndex].data.name
                  : program.items[currentItemIndex]?.type === "group"
                    ? program.items[currentItemIndex].data.exercises[0]?.name
                    : "Next Item"}
              </div>
            )}
          </div>

          <div className="text-6xl sm:text-7xl font-mono text-center font-bold">{formatTime(restTimeRemaining)}</div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={handlePauseResume}
              variant="secondary"
              size="sm"
              className="px-4 sm:px-6 bg-white/20 hover:bg-white/30"
            >
              {isProgramPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              onClick={handleSkipRest}
              variant="secondary"
              size="sm"
              className="px-4 sm:px-6 bg-white/10 hover:bg-white/20"
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${getPhaseColor(workoutState.currentPhase)} text-white flex-1 flex flex-col`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-sm">{currentExercise.name}</CardTitle>
        <div className="text-center text-xs opacity-90">
          <Badge variant="secondary" className="text-xs">
            {currentExercise.mode}
          </Badge>
          {" • "}
          Item {currentItemIndex + 1}/{program.items.length}
          {currentGroup && ` • Exercise ${currentExerciseIndexInGroup + 1}/${currentGroup.exercises.length}`}
          {" • "}Round {currentItemRound}/
          {currentItem.type === "exercise" ? currentItem.data.rounds : currentGroup?.rounds}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold mb-1">{getPhaseText(workoutState.currentPhase)}</div>
          <div className="text-xs sm:text-sm opacity-90">
            Round {workoutState.currentRound}/{currentExercise.rounds}
            {currentExercise.cycles > 1 && ` • Cycle ${workoutState.currentCycle}/${currentExercise.cycles}`}
          </div>
        </div>

        {workoutState.currentPhase === "work" && currentExercise.mode === "manual" ? (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl font-medium opacity-90">Reps</div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setCurrentReps((prev) => Math.max(1, (prev || 0) - 1))}
                  size="sm"
                  variant="secondary"
                  className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="text-4xl sm:text-5xl font-bold min-w-[120px]">{currentReps}</div>
                <Button
                  onClick={() => setCurrentReps((prev) => (prev || 0) + 1)}
                  size="sm"
                  variant="secondary"
                  className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {currentLoad !== undefined && currentLoad > 0 && (
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-medium opacity-90">Load (kg)</div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setCurrentLoad((prev) => Math.max(0, (prev || 0) - 2.5))}
                    size="sm"
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="text-4xl sm:text-5xl font-bold min-w-[120px]">{currentLoad}kg</div>
                  <Button
                    onClick={() => setCurrentLoad((prev) => (prev || 0) + 2.5)}
                    size="sm"
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="text-sm opacity-75 mt-2">Duration: {formatTime(exerciseDuration)}</div>
          </div>
        ) : (
          <div className="text-6xl sm:text-7xl font-mono text-center font-bold">
            {formatTime(workoutState.timeRemaining)}
          </div>
        )}

        <div className="flex justify-center gap-3">
          {workoutState.currentPhase === "work" && currentExercise.mode === "manual" ? (
            <Button onClick={advancePhase} size="sm" className="px-6 sm:px-8 bg-white/20 hover:bg-white/30">
              Set Complete
            </Button>
          ) : workoutState.currentPhase !== "finished" ? (
            <>
              <Button onClick={handlePauseResume} variant="secondary" size="sm" className="px-4 sm:px-6">
                {workoutState.isRunning ? "Pause" : "Resume"}
              </Button>
              {(workoutState.currentPhase === "work" ||
                workoutState.currentPhase === "rest" ||
                workoutState.currentPhase === "prepare") && (
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
        </div>
      </CardContent>
    </Card>
  )
})

ProgramPlayer.displayName = "ProgramPlayer"

export { ProgramPlayer }
