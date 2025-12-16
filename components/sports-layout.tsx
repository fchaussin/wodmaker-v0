"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

type Tool = "stopwatch" | "tabata" | "strength" | "exercise" | "program"

interface SportsLayoutProps {
  children: React.ReactNode
  currentTool: Tool
  onToolChange: (tool: Tool) => void
  onTabSwitch?: () => void
}

export default function SportsLayout({ children, currentTool, onToolChange, onTabSwitch }: SportsLayoutProps) {
  const handleToolChange = (tool: Tool) => {
    if (onTabSwitch) {
      onTabSwitch()
    }
    onToolChange(tool)
  }

  return (
    <div className="bg-background text-foreground flex flex-col relative">
      <div className="flex-1 flex flex-col max-w-sm sm:max-w-md mx-auto w-full h-full min-h-dvh">
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 p-4 mb-auto">{children}</div>

        {/* Bottom tab navigation */}
        <div className="flex justify-center p-4 pt-2 sticky bottom-0 left-0">
          <div className="grid grid-cols-5 bg-muted rounded-lg p-1 w-full gap-1">
            <Button
              variant={currentTool === "stopwatch" ? "default" : "ghost"}
              onClick={() => handleToolChange("stopwatch")}
              className="text-xs"
            >
              Timer
            </Button>
            <Button
              variant={currentTool === "tabata" ? "default" : "ghost"}
              onClick={() => handleToolChange("tabata")}
              className="text-xs"
            >
              Tabata
            </Button>
            <Button
              variant={currentTool === "strength" ? "default" : "ghost"}
              onClick={() => handleToolChange("strength")}
              className="text-xs"
            >
              Strength
            </Button>
            <Button
              variant={currentTool === "exercise" ? "default" : "ghost"}
              onClick={() => handleToolChange("exercise")}
              className="text-xs"
            >
              Exercise
            </Button>
            <Button
              variant={currentTool === "program" ? "default" : "ghost"}
              onClick={() => handleToolChange("program")}
              className="text-xs"
            >
              Program
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
