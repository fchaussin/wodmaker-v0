"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

type Tool = "stopwatch" | "tabata" | "strength" | "exercise"

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
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-sm sm:max-w-md mx-auto w-full">
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 p-4">{children}</div>

        {/* Bottom tab navigation */}
        <div className="flex justify-center p-4 pt-2">
          <div className="flex bg-muted rounded-lg p-1 w-full">
            <Button
              variant={currentTool === "stopwatch" ? "default" : "ghost"}
              onClick={() => handleToolChange("stopwatch")}
              className="flex-1 text-xs sm:text-sm"
            >
              Stopwatch
            </Button>
            <Button
              variant={currentTool === "tabata" ? "default" : "ghost"}
              onClick={() => handleToolChange("tabata")}
              className="flex-1 text-xs sm:text-sm"
            >
              Tabata
            </Button>
            <Button
              variant={currentTool === "strength" ? "default" : "ghost"}
              onClick={() => handleToolChange("strength")}
              className="flex-1 text-xs sm:text-sm"
            >
              Strength
            </Button>
            <Button
              variant={currentTool === "exercise" ? "default" : "ghost"}
              onClick={() => handleToolChange("exercise")}
              className="flex-1 text-xs sm:text-sm"
            >
              Exercise
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
