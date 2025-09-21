"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

type StrengthPhase = "prepare" | "work" | "rest" | "cycleRest" | "finished"
type StrengthView = "config" | "workout"

interface StrengthConfig {
  prepareTime: number
  repetitions: number
  load: number
  restTime: number
  rounds: number
  cycles: number
  restBetweenCycles: number
}

interface StrengthState {
  currentPhase: StrengthPhase
  timeRemaining: number
  currentRound: number
  currentCycle: number
  isRunning: boolean
  view: StrengthView
}

interface StrengthComponentRef {
  pause: () => void
}

const StrengthComponent = forwardRef<StrengthComponentRef>((props, ref) => {
  const [config, setConfig] = useState<StrengthConfig>({
    prepareTime: 5,
    repetitions: 12,
    load: 30,
    restTime: 60,
    rounds: 3,
    cycles: 3,
    restBetweenCycles: 60,
  })

  const [state, setState] = useState<StrengthState>({
    currentPhase: "prepare",
    timeRemaining: 0,
    currentRound: 1,
    currentCycle: 1,
    isRunning: false,
    view: "config",
  })

  const [singleCycle, setSingleCycle] = useState(false)

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
      view: "workout",
    })
  }

  const completeSet = () => {
    setState((prev) => {
      let nextPhase: StrengthPhase = "rest"
      let nextTime = config.restTime
      let nextRound = prev.currentRound
      let nextCycle = prev.currentCycle

      if (prev.currentRound < config.rounds) {
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getPhaseColor = (phase: StrengthPhase) => {
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

  const getPhaseText = (phase: StrengthPhase) => {
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

  useEffect(() => {
    if (state.isRunning && state.view === "workout" && state.currentPhase !== "work") {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            const nextPhase: StrengthPhase = "work"
            const nextTime = 0

            if (prev.currentPhase === "prepare") {
              playBeep(1000, 300)
            } else if (prev.currentPhase === "rest") {
              playBeep(1000, 300)
            } else if (prev.currentPhase === "cycleRest") {
              playBeep(1000, 300)
            }

            return {
              ...prev,
              currentPhase: nextPhase,
              timeRemaining: nextTime,
            }
          } else {
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
  }, [state.isRunning, state.view, state.currentPhase])

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
            <CardTitle className="text-center text-lg">Strength Config</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-4 text-sm">
              <div>
                <div>
                  <Label htmlFor="strengthPrepareTime" className="text-xs">
                    Prepare (s)
                  </Label>
                  <Input
                    id="strengthPrepareTime"
                    type="number"
                    value={config.prepareTime}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        prepareTime: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    min="0"
                    className="h-8"
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="repetitions" className="text-xs">
                      Reps
                    </Label>
                    <Input
                      id="repetitions"
                      type="number"
                      value={config.repetitions}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          repetitions: Number.parseInt(e.target.value) || 1,
                        }))
                      }
                      min="1"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="load" className="text-xs">
                      Load (kg)
                    </Label>
                    <Input
                      id="load"
                      type="number"
                      value={config.load}
                      onChange={(e) => setConfig((prev) => ({ ...prev, load: Number.parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="strengthRestTime" className="text-xs">
                      Rest (s)
                    </Label>
                    <Input
                      id="strengthRestTime"
                      type="number"
                      value={config.restTime}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, restTime: Number.parseInt(e.target.value) || 0 }))
                      }
                      min="0"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strengthRounds" className="text-xs">
                      Rounds
                    </Label>
                    <Input
                      id="strengthRounds"
                      type="number"
                      value={config.rounds}
                      onChange={(e) => setConfig((prev) => ({ ...prev, rounds: Number.parseInt(e.target.value) || 1 }))}
                      min="1"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="singleCycle"
                      checked={singleCycle}
                      onCheckedChange={(checked) => {
                        setSingleCycle(checked as boolean)
                        if (checked) {
                          setConfig((prev) => ({ ...prev, cycles: 1 }))
                        }
                      }}
                    />
                    <Label htmlFor="singleCycle" className="text-xs">
                      Single cycle only
                    </Label>
                  </div>
                  {!singleCycle && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="strengthCycles" className="text-xs">
                          Cycles
                        </Label>
                        <Input
                          id="strengthCycles"
                          type="number"
                          value={config.cycles}
                          onChange={(e) =>
                            setConfig((prev) => ({ ...prev, cycles: Number.parseInt(e.target.value) || 1 }))
                          }
                          min="1"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="strengthRestBetweenCycles" className="text-xs">
                          Cycle Rest (s)
                        </Label>
                        <Input
                          id="strengthRestBetweenCycles"
                          type="number"
                          value={config.restBetweenCycles}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              restBetweenCycles: Number.parseInt(e.target.value) || 0,
                            }))
                          }
                          min="0"
                          className="h-8"
                        />
                      </div>
                    </div>
                  )}
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
                Round {state.currentRound}/{config.rounds}
                {!singleCycle && ` • Cycle ${state.currentCycle}/${config.cycles}`}
              </div>
            </div>

            {state.currentPhase === "work" ? (
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">{config.repetitions} Reps</div>
                {config.load > 0 && <div className="text-xl sm:text-2xl opacity-90">@ {config.load}kg</div>}
              </div>
            ) : (
              <div className="text-6xl sm:text-7xl font-mono text-center font-bold">
                {formatTime(state.timeRemaining)}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {state.currentPhase === "work" ? (
                <Button onClick={completeSet} size="sm" className="px-6 sm:px-8 bg-white/20 hover:bg-white/30">
                  Set Complete
                </Button>
              ) : state.currentPhase !== "finished" ? (
                <div className="h-9"></div>
              ) : null}
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

StrengthComponent.displayName = "StrengthComponent"

export default StrengthComponent
