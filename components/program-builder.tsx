"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EnhancedNumericInput } from "@/components/enhanced-numeric-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, Play, MoveUp, MoveDown } from "lucide-react"
import type { Exercise, Program } from "@/types/exercise"
import { ExerciseForm } from "@/components/exercise-form"

interface ProgramBuilderProps {
  program?: Program
  onSave?: (program: Program) => void
  onStartProgram?: (program: Program) => void
}

export function ProgramBuilder({ program, onSave, onStartProgram }: ProgramBuilderProps) {
  const [currentProgram, setCurrentProgram] = useState<Program>(
    program || {
      id: crypto.randomUUID(),
      name: "New Program",
      exercises: [],
      restBetweenExercises: 60,
    },
  )

  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [showExerciseForm, setShowExerciseForm] = useState(false)

  const addExercise = () => {
    setEditingExercise(null)
    setShowExerciseForm(true)
  }

  const editExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setShowExerciseForm(true)
  }

  const saveExercise = (exercise: Exercise) => {
    if (editingExercise) {
      // Update existing exercise
      setCurrentProgram((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => (ex.id === exercise.id ? exercise : ex)),
      }))
    } else {
      // Add new exercise
      setCurrentProgram((prev) => ({
        ...prev,
        exercises: [...prev.exercises, exercise],
      }))
    }
    setShowExerciseForm(false)
    setEditingExercise(null)
  }

  const removeExercise = (exerciseId: string) => {
    setCurrentProgram((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }))
  }

  const moveExercise = (exerciseId: string, direction: "up" | "down") => {
    setCurrentProgram((prev) => {
      const exercises = [...prev.exercises]
      const index = exercises.findIndex((ex) => ex.id === exerciseId)

      if (direction === "up" && index > 0) {
        ;[exercises[index], exercises[index - 1]] = [exercises[index - 1], exercises[index]]
      } else if (direction === "down" && index < exercises.length - 1) {
        ;[exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]]
      }

      return { ...prev, exercises }
    })
  }

  const handleSave = () => {
    onSave?.(currentProgram)
  }

  const handleStartProgram = () => {
    onStartProgram?.(currentProgram)
  }

  const formatExerciseDetails = (exercise: Exercise) => {
    const details = []
    if (exercise.mode === "timed") {
      details.push(`${exercise.workTime}s work`)
    } else {
      details.push(`${exercise.repetitions} reps`)
      if (exercise.load) details.push(`${exercise.load}kg`)
    }
    details.push(`${exercise.restTime}s rest`)
    details.push(`${exercise.rounds} rounds`)
    if (exercise.cycles > 1) details.push(`${exercise.cycles} cycles`)
    return details.join(" • ")
  }

  if (showExerciseForm) {
    return (
      <ExerciseForm
        exercise={editingExercise || undefined}
        onSave={saveExercise}
        onCancel={() => {
          setShowExerciseForm(false)
          setEditingExercise(null)
        }}
        title={editingExercise ? "Edit Exercise" : "Add Exercise"}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg">Program Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="programName" className="text-xs">
            Program Name
          </Label>
          <Input
            id="programName"
            value={currentProgram.name}
            onChange={(e) => setCurrentProgram((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter program name"
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="restBetweenExercises" className="text-xs">
            Rest Between Exercises (s)
          </Label>
          <EnhancedNumericInput
            id="restBetweenExercises"
            value={currentProgram.restBetweenExercises}
            onChange={(value) => setCurrentProgram((prev) => ({ ...prev, restBetweenExercises: value }))}
            min={0}
            max={600}
            label="Rest Between Exercises (seconds)"
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Exercises ({currentProgram.exercises.length})</Label>
            <Button onClick={addExercise} size="sm" variant="outline" className="h-7 px-2 bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>

          {currentProgram.exercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No exercises added yet. Click "Add" to create your first exercise.
            </div>
          ) : (
            <div className="space-y-2">
              {currentProgram.exercises.map((exercise, index) => (
                <Card key={exercise.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {index + 1}. {exercise.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {exercise.mode}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatExerciseDetails(exercise)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => moveExercise(exercise.id, "up")}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        disabled={index === 0}
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => moveExercise(exercise.id, "down")}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        disabled={index === currentProgram.exercises.length - 1}
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      <Button onClick={() => editExercise(exercise)} size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => removeExercise(exercise.id)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {onStartProgram && currentProgram.exercises.length > 0 && (
            <Button onClick={handleStartProgram} className="flex-1" size="sm">
              <Play className="h-3 w-3 mr-1" />
              Start Program
            </Button>
          )}
          {onSave && (
            <Button onClick={handleSave} variant="outline" size="sm">
              Save Program
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
