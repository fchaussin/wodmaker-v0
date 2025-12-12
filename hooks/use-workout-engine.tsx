"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type WorkoutPhase = "prepare" | "work" | "rest" | "cycleRest" | "finished"

interface WorkoutConfig {
  prepareTime: number
  workTime?: number // Optional for manual mode
  restTime: number
  rounds: number
  cycles?: number // Made cycles optional
  restBetweenCycles?: number // Made cycle rest optional
  // Additional fields for strength training
  repetitions?: number
  load?: number
}

interface WorkoutState {
  currentPhase: WorkoutPhase
  timeRemaining: number
  currentRound: number
  currentCycle: number
  isRunning: boolean
  isActive: boolean
}

interface UseWorkoutEngineOptions {
  config: WorkoutConfig
  onPhaseChange?: (phase: WorkoutPhase) => void
  onWorkoutComplete?: () => void
}

export function useWorkoutEngine({ config, onPhaseChange, onWorkoutComplete }: UseWorkoutEngineOptions) {
  const [state, setState] = useState<WorkoutState>({
    currentPhase: "prepare",
    timeRemaining: 0,
    currentRound: 1,
    currentCycle: 1,
    isRunning: false,
    isActive: false,
  })

  const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(null)
  const [exerciseDuration, setExerciseDuration] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const exerciseTimerRef = useRef<NodeJS.Timeout | null>(null)

  const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000)
  }, [])

  useEffect(() => {
    if (state.currentPhase === "work" && state.isRunning && !config.workTime) {
      // Manual exercise - track timing
      if (!exerciseStartTime) {
        setExerciseStartTime(Date.now())
        setExerciseDuration(0)
      }

      exerciseTimerRef.current = setInterval(() => {
        if (exerciseStartTime) {
          setExerciseDuration(Math.floor((Date.now() - exerciseStartTime) / 1000))
        }
      }, 1000)
    } else {
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current)
      }
      if (state.currentPhase !== "work") {
        setExerciseStartTime(null)
        setExerciseDuration(0)
      }
    }

    return () => {
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current)
      }
    }
  }, [state.currentPhase, state.isRunning, config.workTime, exerciseStartTime])

  const start = useCallback(() => {
    setState({
      currentPhase: "prepare",
      timeRemaining: config.prepareTime,
      currentRound: 1,
      currentCycle: 1,
      isRunning: true,
      isActive: true,
    })
    setExerciseStartTime(null)
    setExerciseDuration(0)
  }, [config.prepareTime])

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }))
  }, [])

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }))
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current)
    }
    setState({
      currentPhase: "prepare",
      timeRemaining: 0,
      currentRound: 1,
      currentCycle: 1,
      isRunning: false,
      isActive: false,
    })
    setExerciseStartTime(null)
    setExerciseDuration(0)
  }, [])

  const advancePhase = useCallback(() => {
    if (state.currentPhase === "work" && !config.workTime && exerciseStartTime) {
      const duration = Math.floor((Date.now() - exerciseStartTime) / 1000)
      console.log(
        `[v0] Manual exercise completed - Duration: ${duration}s, Round: ${state.currentRound}, Cycle: ${state.currentCycle}`,
      )
    }

    setState((prev) => {
      let nextPhase: WorkoutPhase = "rest"
      let nextTime = config.restTime
      let nextRound = prev.currentRound
      let nextCycle = prev.currentCycle

      if (prev.currentRound < config.rounds) {
        nextRound = prev.currentRound + 1
      } else if ((config.cycles || 1) > 1 && prev.currentCycle < (config.cycles || 1)) {
        nextPhase = "cycleRest"
        nextTime = config.restBetweenCycles || 0
        nextRound = 1
        nextCycle = prev.currentCycle + 1
      } else {
        nextPhase = "finished"
        nextTime = 0
        playBeep(1200, 1000)
        onWorkoutComplete?.()
      }

      playBeep(800, 200)
      onPhaseChange?.(nextPhase)

      return {
        ...prev,
        currentPhase: nextPhase,
        timeRemaining: nextTime,
        currentRound: nextRound,
        currentCycle: nextCycle,
        isRunning: nextPhase !== "finished",
      }
    })
  }, [
    config,
    playBeep,
    onPhaseChange,
    onWorkoutComplete,
    state.currentPhase,
    state.currentRound,
    state.currentCycle,
    exerciseStartTime,
  ])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [])

  const getPhaseColor = useCallback((phase: WorkoutPhase) => {
    switch (phase) {
      case "prepare":
        return "bg-blue-600"
      case "work":
        return "bg-green-600"
      case "rest":
        return "bg-orange-600"
      case "cycleRest":
        return "bg-purple-600"
      case "finished":
        return "bg-gray-600"
      default:
        return "bg-gray-600"
    }
  }, [])

  const getPhaseText = useCallback((phase: WorkoutPhase) => {
    switch (phase) {
      case "prepare":
        return "PREPARE"
      case "work":
        return "WORK"
      case "rest":
        return "REST"
      case "cycleRest":
        return "CYCLE REST"
      case "finished":
        return "FINISHED"
      default:
        return ""
    }
  }, [])

  useEffect(() => {
    if (state.isRunning && state.isActive) {
      // For manual mode (no workTime), don't auto-advance work phase
      const isManualWorkPhase = state.currentPhase === "work" && !config.workTime

      if (!isManualWorkPhase) {
        intervalRef.current = setInterval(() => {
          setState((prev) => {
            if (prev.timeRemaining <= 1) {
              // Phase transition logic
              let nextPhase: WorkoutPhase = prev.currentPhase
              let nextTime = 0
              let nextRound = prev.currentRound
              let nextCycle = prev.currentCycle

              switch (prev.currentPhase) {
                case "prepare":
                  nextPhase = "work"
                  nextTime = config.workTime || 0
                  playBeep(1000, 300)
                  break
                case "work":
                  if (prev.currentRound < config.rounds) {
                    nextPhase = "rest"
                    nextTime = config.restTime
                    nextRound = prev.currentRound + 1
                  } else if ((config.cycles || 1) > 1 && prev.currentCycle < (config.cycles || 1)) {
                    nextPhase = "cycleRest"
                    nextTime = config.restBetweenCycles || 0
                    nextRound = 1
                    nextCycle = prev.currentCycle + 1
                  } else {
                    nextPhase = "finished"
                    nextTime = 0
                    playBeep(1200, 1000)
                    onWorkoutComplete?.()
                  }
                  playBeep(800, 200)
                  break
                case "rest":
                  nextPhase = "work"
                  nextTime = config.workTime || 0
                  playBeep(1000, 300)
                  break
                case "cycleRest":
                  nextPhase = "work"
                  nextTime = config.workTime || 0
                  playBeep(1000, 300)
                  break
              }

              onPhaseChange?.(nextPhase)

              return {
                ...prev,
                currentPhase: nextPhase,
                timeRemaining: nextTime,
                currentRound: nextRound,
                currentCycle: nextCycle,
                isRunning: nextPhase !== "finished",
              }
            } else {
              // Countdown beeps for last 3 seconds
              if (prev.timeRemaining <= 3 && prev.timeRemaining > 0) {
                playBeep(600, 100)
              }
              return { ...prev, timeRemaining: prev.timeRemaining - 1 }
            }
          })
        }, 1000)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.isActive, state.currentPhase, config, playBeep, onPhaseChange, onWorkoutComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current)
      }
    }
  }, [])

  return {
    state,
    start,
    pause,
    resume,
    reset,
    advancePhase, // For manual mode
    formatTime,
    getPhaseColor,
    getPhaseText,
    exerciseDuration,
  }
}
