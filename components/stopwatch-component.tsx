"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StopwatchComponentRef {
  pause: () => void
}

const StopwatchComponent = forwardRef<StopwatchComponentRef>((props, ref) => {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (isRunning) {
        stop()
      }
    },
  }))

  const start = () => {
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 10)
    }, 10)
  }

  const stop = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const reset = () => {
    setTime(0)
    setLaps([])
  }

  const recordLap = () => {
    setLaps((prev) => [...prev, time])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = Math.floor((time % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg">Stopwatch</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="text-4xl sm:text-5xl font-mono text-center font-bold">{formatTime(time)}</div>

        <div className="flex justify-center gap-2">
          <Button onClick={isRunning ? stop : start} size="sm" className="px-4 sm:px-6">
            {isRunning ? "Stop" : "Start"}
          </Button>
          <Button
            onClick={recordLap}
            disabled={!isRunning}
            variant="outline"
            size="sm"
            className="px-3 sm:px-4 bg-transparent"
          >
            Lap
          </Button>
          <Button
            onClick={reset}
            disabled={isRunning}
            variant="outline"
            size="sm"
            className="px-3 sm:px-4 bg-transparent"
          >
            Reset
          </Button>
        </div>

        {laps.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col">
            <h3 className="font-semibold text-center text-sm mb-2">Laps</h3>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {laps.map((lap, index) => (
                <div key={index} className="flex justify-between bg-muted p-2 rounded text-sm">
                  <span>Lap {index + 1}</span>
                  <span className="font-mono">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

StopwatchComponent.displayName = "StopwatchComponent"

export default StopwatchComponent
