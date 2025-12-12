"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EnhancedNumericInput } from "@/components/enhanced-numeric-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { type Exercise, type ExerciseMode, createDefaultExercise } from "@/types/exercise"

interface ExerciseFormProps {
  exercise?: Exercise
  onSave: (exercise: Exercise) => void
  onCancel?: () => void
  title?: string
}

export function ExerciseForm({ exercise, onSave, onCancel, title = "Exercise Configuration" }: ExerciseFormProps) {
  const [formData, setFormData] = useState<Exercise>(exercise || createDefaultExercise())
  const [singleCycle, setSingleCycle] = useState(false)

  const handleSave = () => {
    const exerciseToSave = {
      ...formData,
      cycles: singleCycle ? 1 : formData.cycles,
    }
    onSave(exerciseToSave)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="exerciseName" className="text-xs">
            Exercise Name
          </Label>
          <Input
            id="exerciseName"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter exercise name"
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="mode" className="text-xs">
            Mode
          </Label>
          <Select
            value={formData.mode}
            onValueChange={(value: ExerciseMode) => setFormData((prev) => ({ ...prev, mode: value }))}
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

        <div>
          <Label htmlFor="prepareTime" className="text-xs">
            Prepare (s)
          </Label>
          <EnhancedNumericInput
            id="prepareTime"
            value={formData.prepareTime}
            onChange={(value) => setFormData((prev) => ({ ...prev, prepareTime: value }))}
            min={0}
            max={300}
            label="Prepare Time (seconds)"
            className="h-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {formData.mode === "timed" ? (
            <div>
              <Label htmlFor="workTime" className="text-xs">
                Work (s)
              </Label>
              <EnhancedNumericInput
                id="workTime"
                value={formData.workTime || 0}
                onChange={(value) => setFormData((prev) => ({ ...prev, workTime: value }))}
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
                value={formData.repetitions || 0}
                onChange={(value) => setFormData((prev) => ({ ...prev, repetitions: value }))}
                min={1}
                max={100}
                label="Repetitions"
                className="h-8"
              />
            </div>
          )}
          {formData.mode === "manual" && (
            <div>
              <Label htmlFor="load" className="text-xs">
                Load (kg)
              </Label>
              <EnhancedNumericInput
                id="load"
                value={formData.load || 0}
                onChange={(value) => setFormData((prev) => ({ ...prev, load: value }))}
                min={0}
                max={500}
                label="Load (kg)"
                className="h-8"
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="restTime" className="text-xs">
            Rest (s)
          </Label>
          <EnhancedNumericInput
            id="restTime"
            value={formData.restTime}
            onChange={(value) => setFormData((prev) => ({ ...prev, restTime: value }))}
            min={0}
            max={600}
            label="Rest Time (seconds)"
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="rounds" className="text-xs">
            Rounds
          </Label>
          <EnhancedNumericInput
            id="rounds"
            value={formData.rounds}
            onChange={(value) => setFormData((prev) => ({ ...prev, rounds: value }))}
            min={1}
            max={50}
            label="Rounds"
            className="h-8"
          />
        </div>

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

        {!singleCycle && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cycles" className="text-xs">
                Cycles
              </Label>
              <EnhancedNumericInput
                id="cycles"
                value={formData.cycles}
                onChange={(value) => setFormData((prev) => ({ ...prev, cycles: value }))}
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
                value={formData.restBetweenCycles}
                onChange={(value) => setFormData((prev) => ({ ...prev, restBetweenCycles: value }))}
                min={0}
                max={600}
                label="Rest Between Cycles (seconds)"
                className="h-8"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1" size="sm">
            Save Exercise
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" size="sm">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
