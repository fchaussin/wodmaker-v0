"use client"

import { useState, useRef } from "react"
import SportsLayout from "@/components/sports-layout"
import StopwatchComponent from "@/components/stopwatch-component"
import TabataComponent from "@/components/tabata-component"
import StrengthComponent from "@/components/strength-component"
import ExercisePlayer from "@/components/exercise-player"
import { ProgramBuilder } from "@/components/program-builder"

type Tool = "stopwatch" | "tabata" | "strength" | "exercise" | "program"

export default function SportsUtilityApp() {
  const [currentTool, setCurrentTool] = useState<Tool>("stopwatch")

  // Refs to access component methods for pausing timers
  const stopwatchRef = useRef<{ pause: () => void } | null>(null)
  const tabataRef = useRef<{ pause: () => void } | null>(null)
  const strengthRef = useRef<{ pause: () => void } | null>(null)
  const exerciseRef = useRef<{ pause: () => void } | null>(null)

  const handleTabSwitch = () => {
    if (stopwatchRef.current) {
      stopwatchRef.current.pause()
    }
    if (tabataRef.current) {
      tabataRef.current.pause()
    }
    if (strengthRef.current) {
      strengthRef.current.pause()
    }
    if (exerciseRef.current) {
      exerciseRef.current.pause()
    }
  }

  return (
    <SportsLayout currentTool={currentTool} onToolChange={setCurrentTool} onTabSwitch={handleTabSwitch}>
      {currentTool === "stopwatch" && <StopwatchComponent ref={stopwatchRef} />}
      {currentTool === "tabata" && <TabataComponent ref={tabataRef} />}
      {currentTool === "strength" && <StrengthComponent ref={strengthRef} />}
      {currentTool === "exercise" && <ExercisePlayer ref={exerciseRef} />}
      {currentTool === "program" && <ProgramBuilder />}
    </SportsLayout>
  )
}
