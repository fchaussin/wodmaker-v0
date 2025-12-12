"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EnhancedNumericInput } from "@/components/enhanced-numeric-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, Play, MoveUp, MoveDown, Users } from "lucide-react"
import type { Exercise, Program } from "@/types/exercise"
import { createDefaultProgram, createDefaultExercise, createExerciseItem, createGroupItem } from "@/types/exercise"
import { ExerciseForm } from "@/components/exercise-form"
import { ProgramPlayer } from "@/components/program-player"

interface ProgramBuilderProps {
  program?: Program
  onSave?: (program: Program) => void
  onStartProgram?: (program: Program) => void
}

export function ProgramBuilder({ program, onSave, onStartProgram }: ProgramBuilderProps) {
  const [currentProgram, setCurrentProgram] = useState<Program>(program || createDefaultProgram())
  const [editingExercise, setEditingExercise] = useState<{
    exercise: Exercise
    itemIndex: number
    exerciseIndex?: number
  } | null>(null)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [targetItemIndex, setTargetItemIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const addExercise = () => {
    const newExercise = createDefaultExercise()
    setCurrentProgram((prev) => ({
      ...prev,
      items: [...prev.items, createExerciseItem(newExercise)],
    }))
  }

  const addGroup = () => {
    const newGroup = createGroupItem([], 1)
    setCurrentProgram((prev) => ({
      ...prev,
      items: [...prev.items, newGroup],
    }))
  }

  const removeItem = (itemIndex: number) => {
    setCurrentProgram((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== itemIndex),
    }))
  }

  const moveItem = (itemIndex: number, direction: "up" | "down") => {
    setCurrentProgram((prev) => {
      const items = [...prev.items]
      if (direction === "up" && itemIndex > 0) {
        ;[items[itemIndex], items[itemIndex - 1]] = [items[itemIndex - 1], items[itemIndex]]
      } else if (direction === "down" && itemIndex < items.length - 1) {
        ;[items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]]
      }
      return { ...prev, items }
    })
  }

  const updateExerciseRounds = (itemIndex: number, rounds: number) => {
    setCurrentProgram((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex && item.type === "exercise") {
          return { ...item, data: { ...item.data, rounds } }
        }
        return item
      }),
    }))
  }

  const updateGroupRounds = (itemIndex: number, rounds: number) => {
    setCurrentProgram((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex && item.type === "group") {
          return { ...item, data: { ...item.data, rounds } }
        }
        return item
      }),
    }))
  }

  const updateGroupRestBetweenExercises = (itemIndex: number, restBetweenExercises: number) => {
    setCurrentProgram((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex && item.type === "group") {
          return { ...item, data: { ...item.data, restBetweenExercises } }
        }
        return item
      }),
    }))
  }

  const editStandaloneExercise = (exercise: Exercise, itemIndex: number) => {
    setEditingExercise({ exercise, itemIndex })
    setTargetItemIndex(itemIndex)
    setShowExerciseForm(true)
  }

  const editGroupExercise = (exercise: Exercise, itemIndex: number, exerciseIndex: number) => {
    setEditingExercise({ exercise, itemIndex, exerciseIndex })
    setTargetItemIndex(itemIndex)
    setShowExerciseForm(true)
  }

  const addExerciseToGroup = (itemIndex: number) => {
    setTargetItemIndex(itemIndex)
    setEditingExercise(null)
    setShowExerciseForm(true)
  }

  const saveExercise = (exercise: Exercise) => {
    if (targetItemIndex === null) return

    if (editingExercise) {
      if (editingExercise.exerciseIndex !== undefined) {
        setCurrentProgram((prev) => ({
          ...prev,
          items: prev.items.map((item, i) => {
            if (i === targetItemIndex && item.type === "group") {
              return {
                ...item,
                data: {
                  ...item.data,
                  exercises: item.data.exercises.map((ex, ei) =>
                    ei === editingExercise.exerciseIndex ? exercise : ex,
                  ),
                },
              }
            }
            return item
          }),
        }))
      } else {
        setCurrentProgram((prev) => ({
          ...prev,
          items: prev.items.map((item, i) => {
            if (i === targetItemIndex && item.type === "exercise") {
              return { ...item, data: exercise }
            }
            return item
          }),
        }))
      }
    } else {
      setCurrentProgram((prev) => ({
        ...prev,
        items: prev.items.map((item, i) => {
          if (i === targetItemIndex && item.type === "group") {
            return {
              ...item,
              data: {
                ...item.data,
                exercises: [...item.data.exercises, exercise],
              },
            }
          }
          return item
        }),
      }))
    }
    setShowExerciseForm(false)
    setEditingExercise(null)
    setTargetItemIndex(null)
  }

  const removeExerciseFromGroup = (itemIndex: number, exerciseIndex: number) => {
    setCurrentProgram((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex && item.type === "group") {
          return {
            ...item,
            data: {
              ...item.data,
              exercises: item.data.exercises.filter((_, ei) => ei !== exerciseIndex),
            },
          }
        }
        return item
      }),
    }))
  }

  const moveExerciseInGroup = (itemIndex: number, exerciseIndex: number, direction: "up" | "down") => {
    setCurrentProgram((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex && item.type === "group") {
          const exercises = [...item.data.exercises]
          if (direction === "up" && exerciseIndex > 0) {
            ;[exercises[exerciseIndex], exercises[exerciseIndex - 1]] = [
              exercises[exerciseIndex - 1],
              exercises[exerciseIndex],
            ]
          } else if (direction === "down" && exerciseIndex < exercises.length - 1) {
            ;[exercises[exerciseIndex], exercises[exerciseIndex + 1]] = [
              exercises[exerciseIndex + 1],
              exercises[exerciseIndex],
            ]
          }
          return { ...item, data: { ...item.data, exercises } }
        }
        return item
      }),
    }))
  }

  const handleSave = () => {
    onSave?.(currentProgram)
  }

  const handleStartProgram = () => {
    setIsPlaying(true)
    onStartProgram?.(currentProgram)
  }

  const handleProgramComplete = () => {
    setIsPlaying(false)
  }

  const handleBackToBuilder = () => {
    setIsPlaying(false)
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
    if (exercise.cycles > 1) details.push(`${exercise.cycles} cycles`)
    return details.join(" • ")
  }

  const getTotalExerciseCount = () => {
    return currentProgram.items.reduce((total, item) => {
      if (item.type === "exercise") return total + 1
      return total + item.data.exercises.length
    }, 0)
  }

  if (showExerciseForm) {
    return (
      <ExerciseForm
        exercise={editingExercise?.exercise || undefined}
        onSave={saveExercise}
        onCancel={() => {
          setShowExerciseForm(false)
          setEditingExercise(null)
          setTargetItemIndex(null)
        }}
        title={editingExercise ? "Edit Exercise" : "Add Exercise"}
      />
    )
  }

  if (isPlaying) {
    return (
      <div className="flex flex-col h-full gap-2">
        <ProgramPlayer program={currentProgram} onComplete={handleProgramComplete} />
        <Button onClick={handleBackToBuilder} variant="outline" size="sm">
          Back to Builder
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full flex flex-col h-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-center text-lg">Program Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 space-y-4">
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
            <Label htmlFor="restBetweenItems" className="text-xs">
              Rest Between Items (s)
            </Label>
            <EnhancedNumericInput
              id="restBetweenItems"
              value={currentProgram.restBetweenItems}
              onChange={(value) => setCurrentProgram((prev) => ({ ...prev, restBetweenItems: value }))}
              min={0}
              max={600}
              label="Rest Between Items (seconds)"
              className="h-8"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">
              Items ({currentProgram.items.length}) • Exercises ({getTotalExerciseCount()})
            </Label>
            <div className="flex gap-2">
              <Button onClick={addExercise} size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                <Plus className="h-3 w-3 mr-1" />
                Exercise
              </Button>
              <Button onClick={addGroup} size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                <Users className="h-3 w-3 mr-1" />
                Group
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {currentProgram.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No items added yet. Click "Exercise" or "Group" to start building your program.
            </div>
          ) : (
            <div className="space-y-3">
              {currentProgram.items.map((item, itemIndex) => {
                if (item.type === "exercise") {
                  const exercise = item.data
                  return (
                    <Card key={`exercise-${itemIndex}`} className="border-2">
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{exercise.name}</span>
                              <Badge variant="secondary" className="text-xs h-4 px-1">
                                {exercise.mode}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">{formatExerciseDetails(exercise)}</div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label htmlFor={`exercise-${itemIndex}-rounds`} className="text-xs">
                                  Rounds
                                </Label>
                                <EnhancedNumericInput
                                  id={`exercise-${itemIndex}-rounds`}
                                  value={exercise.rounds}
                                  onChange={(value) => updateExerciseRounds(itemIndex, value)}
                                  min={1}
                                  max={20}
                                  label="Exercise Rounds"
                                  className="h-7"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => moveItem(itemIndex, "up")}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              disabled={itemIndex === 0}
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => moveItem(itemIndex, "down")}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              disabled={itemIndex === currentProgram.items.length - 1}
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => editStandaloneExercise(exercise, itemIndex)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => removeItem(itemIndex)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                } else {
                  const group = item.data
                  return (
                    <Card key={`group-${itemIndex}`} className="border-2 border-primary/30">
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Users className="h-4 w-4 text-primary" />
                            <div>
                              <div className="text-sm font-medium">
                                Group {itemIndex + 1}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {group.exercises.length} exercises
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => moveItem(itemIndex, "up")}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              disabled={itemIndex === 0}
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => moveItem(itemIndex, "down")}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              disabled={itemIndex === currentProgram.items.length - 1}
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => removeItem(itemIndex)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`group-${itemIndex}-rounds`} className="text-xs">
                              Rounds
                            </Label>
                            <EnhancedNumericInput
                              id={`group-${itemIndex}-rounds`}
                              value={group.rounds}
                              onChange={(value) => updateGroupRounds(itemIndex, value)}
                              min={1}
                              max={20}
                              label="Group Rounds"
                              className="h-7"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`group-${itemIndex}-rest`} className="text-xs">
                              Rest Between (s)
                            </Label>
                            <EnhancedNumericInput
                              id={`group-${itemIndex}-rest`}
                              value={group.restBetweenExercises}
                              onChange={(value) => updateGroupRestBetweenExercises(itemIndex, value)}
                              min={0}
                              max={600}
                              label="Rest Between Exercises"
                              className="h-7"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Exercises</Label>
                            <Button
                              onClick={() => addExerciseToGroup(itemIndex)}
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 bg-transparent"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>

                          {group.exercises.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-xs">
                              No exercises in this group
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {group.exercises.map((exercise, exerciseIndex) => (
                                <Card key={exercise.id} className="p-2 bg-muted/30">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium">
                                          {exerciseIndex + 1}. {exercise.name}
                                        </span>
                                        <Badge variant="secondary" className="text-xs h-4 px-1">
                                          {exercise.mode}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {formatExerciseDetails(exercise)}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        onClick={() => moveExerciseInGroup(itemIndex, exerciseIndex, "up")}
                                        size="sm"
                                        variant="ghost"
                                        className="h-5 w-5 p-0"
                                        disabled={exerciseIndex === 0}
                                      >
                                        <MoveUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => moveExerciseInGroup(itemIndex, exerciseIndex, "down")}
                                        size="sm"
                                        variant="ghost"
                                        className="h-5 w-5 p-0"
                                        disabled={exerciseIndex === group.exercises.length - 1}
                                      >
                                        <MoveDown className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => editGroupExercise(exercise, itemIndex, exerciseIndex)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-5 w-5 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => removeExerciseFromGroup(itemIndex, exerciseIndex)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
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
                      </div>
                    </Card>
                  )
                }
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 flex-shrink-0">
          {onStartProgram && getTotalExerciseCount() > 0 && (
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
