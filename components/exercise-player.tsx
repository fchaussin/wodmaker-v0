"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { EnhancedNumericInput } from "@/components/enhanced-numeric-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useWorkoutEngine } from "@/hooks/use-workout-engine"

type ExerciseMode = "timed" | "manual"
type ExerciseView = "config" | "exercise"

interface ExercisePlayerConfig {
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

interface ExercisePlayerRef {
  pause: () => void
}

const ExercisePlayer = forwardRef<ExercisePlayerRef>((props, ref) => {
  const [config, setConfig] = useState<ExercisePlayerConfig>({
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

  const [singleCycle, setSingleCycle] = useState(false)

  const [view, setView] = useState<ExerciseView>("config")

  const { state, start, pause, resume, reset, advancePhase, formatTime, getPhaseColor, getPhaseText } =
    useWorkoutEngine({
      config: {
        prepareTime: config.prepareTime,
        workTime: config.mode === "timed" ? config.workTime : undefined,
        restTime: config.restTime,
        rounds: config.rounds,
        cycles: singleCycle ? 1 : config.cycles,
        restBetweenCycles: config.restBetweenCycles,
        repetitions: config.repetitions,
        load: config.load,
      },
    })

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (state.isRunning) {
        pause()
      }
    },
  }))

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
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Exercise Config</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div>
                  <Label htmlFor="mode" className="text-xs">
                    Mode
                  </Label>
                  <Select
                    value={config.mode}
                    onValueChange={(value: ExerciseMode) => setConfig((prev) => ({ ...prev, mode: value }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timed">Timed</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                  {config.mode === "timed" ? (
                    <div>
                      <Label htmlFor="workTime" className="text-xs">
                        Work (s)
                      </Label>
                      <EnhancedNumericInput
                        id="workTime"
                        value={config.workTime || 0}
                        onChange={(value) => setConfig((prev) => ({ ...prev, workTime: value }))}
                        min={1}
                        max={600}
                        label="Work Time (seconds)"
                        className="h-8"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="repetitions" className="text-xs">
                        Reps
                      </Label>
                      <EnhancedNumericInput
                        id="repetitions"
                        value={config.repetitions || 0}
                        onChange={(value) => setConfig((prev) => ({ ...prev, repetitions: value }))}
                        min={1}
                        max={100}
                        label="Repetitions"
                        className="h-8"
                      />
                    </div>
                  )}
                  {config.mode === "manual" && (
                    <div>
                      <Label htmlFor="load" className="text-xs">
                        Load (kg)
                      </Label>
                      <EnhancedNumericInput
                        id="load"
                        value={config.load || 0}
                        onChange={(value) => setConfig((prev) => ({ ...prev, load: value }))}
                        min={0}
                        max={500}
                        label="Load (kg)"
                        className="h-8"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="singleCycle"
                    checked={singleCycle}
                    onCheckedChange={(checked) => setSingleCycle(checked as boolean)}
                  />
                  <Label htmlFor="singleCycle" className="text-xs">
                    Single cycle only
                  </Label>
                </div>
              </div>

              {!singleCycle && (
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
              )}
            </div>

            <Button onClick={startExercise} className="w-full mt-4" size="sm">
              Start Exercise
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
                {!singleCycle && config.cycles > 1 && ` • Cycle ${state.currentCycle}/${config.cycles}`}
              </div>
            </div>

            {state.currentPhase === "work" && config.mode === "manual" ? (
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">{config.repetitions} Reps</div>
                {config.load && config.load > 0 && (
                  <div className="text-xl sm:text-2xl opacity-90">@ {config.load}kg</div>
                )}
              </div>
            ) : (
              <div className="text-6xl sm:text-7xl font-mono text-center font-bold">
                {formatTime(state.timeRemaining)}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {state.currentPhase === "work" && config.mode === "manual" ? (
                <Button onClick={advancePhase} size="sm" className="px-6 sm:px-8 bg-white/20 hover:bg-white/30">
                  Set Complete
                </Button>
              ) : state.currentPhase !== "finished" ? (
                <Button onClick={pauseResume} variant="secondary" size="sm" className="px-4 sm:px-6">
                  {state.isRunning ? "Pause" : "Resume"}
                </Button>
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
