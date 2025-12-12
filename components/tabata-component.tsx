"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { EnhancedNumericInput } from "@/components/enhanced-numeric-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TabataPhase = "prepare" | "work" | "rest" | "cycleRest" | "finished"
type TabataView = "config" | "timer"

interface TabataConfig {
  prepareTime: number
  workTime: number
  restTime: number
  rounds: number
  cycles: number
  restBetweenCycles: number
}

interface TabataState {
  currentPhase: TabataPhase
  timeRemaining: number
  currentRound: number
  currentCycle: number
  isRunning: boolean
  view: TabataView
}

interface TabataComponentRef {
  pause: () => void
}

const TabataComponent = forwardRef<TabataComponentRef>((props, ref) => {
  const [config, setConfig] = useState<TabataConfig>({
    prepareTime: 5,
    workTime: 45,
    restTime: 15,
    rounds: 3,
    cycles: 4,
    restBetweenCycles: 60,
  })

  const [state, setState] = useState<TabataState>({
    currentPhase: "prepare",
    timeRemaining: 0,
    currentRound: 1,
    currentCycle: 1,
    isRunning: false,
    view: "config",
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (state.isRunning) {
        setState((prev) => ({ ...prev, isRunning: false }))
      }
    },
  }))

  const playBeep = (frequency = 800, duration = 200) => {
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
  }

  const startWorkout = () => {
    setState({
      currentPhase: "prepare",
      timeRemaining: config.prepareTime,
      currentRound: 1,
      currentCycle: 1,
      isRunning: true,
      view: "timer",
    })
  }

  const pauseResume = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }))
  }

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setState({
      currentPhase: "prepare",
      timeRemaining: 0,
      currentRound: 1,
      currentCycle: 1,
      isRunning: false,
      view: "config",
    })
  }

  const skipPhase = () => {
    setState((prev) => {
      let nextPhase: TabataPhase = prev.currentPhase
      let nextTime = 0
      let nextRound = prev.currentRound
      let nextCycle = prev.currentCycle

      switch (prev.currentPhase) {
        case "prepare":
          nextPhase = "work"
          nextTime = config.workTime
          break
        case "work":
          if (prev.currentRound < config.rounds) {
            nextPhase = "rest"
            nextTime = config.restTime
            nextRound = prev.currentRound + 1
          } else if (prev.currentCycle < config.cycles) {
            nextPhase = "cycleRest"
            nextTime = config.restBetweenCycles
            nextRound = 1
            nextCycle = prev.currentCycle + 1
          } else {
            nextPhase = "finished"
            nextTime = 0
          }
          break
        case "rest":
          nextPhase = "work"
          nextTime = config.workTime
          break
        case "cycleRest":
          nextPhase = "work"
          nextTime = config.workTime
          break
      }

      return {
        ...prev,
        currentPhase: nextPhase,
        timeRemaining: nextTime,
        currentRound: nextRound,
        currentCycle: nextCycle,
        isRunning: nextPhase !== "finished",
      }
    })
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getPhaseColor = (phase: TabataPhase) => {
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
  }

  const getPhaseText = (phase: TabataPhase) => {
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
  }

  // Timer logic
  useEffect(() => {
    if (state.isRunning && state.view === "timer") {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Phase transition logic
            let nextPhase: TabataPhase = prev.currentPhase
            let nextTime = 0
            let nextRound = prev.currentRound
            let nextCycle = prev.currentCycle

            switch (prev.currentPhase) {
              case "prepare":
                nextPhase = "work"
                nextTime = config.workTime
                playBeep(1000, 300)
                break
              case "work":
                if (prev.currentRound < config.rounds) {
                  nextPhase = "rest"
                  nextTime = config.restTime
                  nextRound = prev.currentRound + 1
                } else if (prev.currentCycle < config.cycles) {
                  nextPhase = "cycleRest"
                  nextTime = config.restBetweenCycles
                  nextRound = 1
                  nextCycle = prev.currentCycle + 1
                } else {
                  nextPhase = "finished"
                  nextTime = 0
                  playBeep(1200, 1000)
                }
                playBeep(800, 200)
                break
              case "rest":
                nextPhase = "work"
                nextTime = config.workTime
                playBeep(1000, 300)
                break
              case "cycleRest":
                nextPhase = "work"
                nextTime = config.workTime
                playBeep(1000, 300)
                break
            }

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
  }, [state.isRunning, state.view, config])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      {state.view === "config" ? (
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Tabata Config</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-4 text-sm">
              <div>
                <div>
                  <Label htmlFor="prepareTime" className="text-xs">
                    Prepare (s)
                  </Label>
                  <EnhancedNumericInput
                    id="prepareTime"
                    value={config.prepareTime}
                    onChange={(value) => setConfig((prev) => ({ ...prev, prepareTime: value }))}
                    min={0}
                    max={300}
                    label="Prepare Time (seconds)"
                    className="h-8"
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="workTime" className="text-xs">
                      Work (s)
                    </Label>
                    <EnhancedNumericInput
                      id="workTime"
                      value={config.workTime}
                      onChange={(value) => setConfig((prev) => ({ ...prev, workTime: value }))}
                      min={1}
                      max={600}
                      label="Work Time (seconds)"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restTime" className="text-xs">
                      Rest (s)
                    </Label>
                    <EnhancedNumericInput
                      id="restTime"
                      value={config.restTime}
                      onChange={(value) => setConfig((prev) => ({ ...prev, restTime: value }))}
                      min={0}
                      max={600}
                      label="Rest Time (seconds)"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <Label htmlFor="rounds" className="text-xs">
                    Rounds
                  </Label>
                  <EnhancedNumericInput
                    id="rounds"
                    value={config.rounds}
                    onChange={(value) => setConfig((prev) => ({ ...prev, rounds: value }))}
                    min={1}
                    max={50}
                    label="Rounds"
                    className="h-8"
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cycles" className="text-xs">
                      Cycles
                    </Label>
                    <EnhancedNumericInput
                      id="cycles"
                      value={config.cycles}
                      onChange={(value) => setConfig((prev) => ({ ...prev, cycles: value }))}
                      min={1}
                      max={20}
                      label="Cycles"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restBetweenCycles" className="text-xs">
                      Cycle Rest (s)
                    </Label>
                    <EnhancedNumericInput
                      id="restBetweenCycles"
                      value={config.restBetweenCycles}
                      onChange={(value) => setConfig((prev) => ({ ...prev, restBetweenCycles: value }))}
                      min={0}
                      max={600}
                      label="Rest Between Cycles (seconds)"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={startWorkout} className="w-full mt-4" size="sm">
              Start Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className={`${getPhaseColor(state.currentPhase)} text-white flex-1 flex flex-col`}>
          <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold mb-1">{getPhaseText(state.currentPhase)}</div>
              <div className="text-xs sm:text-sm opacity-90">
                Round {state.currentRound}/{config.rounds} • Cycle {state.currentCycle}/{config.cycles}
              </div>
            </div>

            <div className="text-6xl sm:text-7xl font-mono text-center font-bold">
              {formatTime(state.timeRemaining)}
            </div>

            <div className="flex justify-center gap-3">
              {state.currentPhase !== "finished" && (
                <>
                  <Button onClick={pauseResume} variant="secondary" size="sm" className="px-4 sm:px-6">
                    {state.isRunning ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    onClick={skipPhase}
                    variant="secondary"
                    size="sm"
                    className="px-4 sm:px-6 bg-white/10 hover:bg-white/20"
                  >
                    Skip
                  </Button>
                </>
              )}
              <Button
                onClick={reset}
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

TabataComponent.displayName = "TabataComponent"

export default TabataComponent
