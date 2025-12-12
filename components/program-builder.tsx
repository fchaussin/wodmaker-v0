"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Play, Users, Edit, Trash2, MoveUp, MoveDown, GripVertical, MoreVertical } from "lucide-react"
import type { Program, ProgramItem, Exercise } from "@/types/exercise"
import { ExerciseForm } from "./exercise-form"
import { EnhancedNumericInput } from "./enhanced-numeric-input"
import { ProgramPlayer } from "./program-player"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

interface ProgramBuilderProps {
  program?: Program
  onSave?: (program: Program) => void
  onStartProgram?: (program: Program) => void
}

export function ProgramBuilder({ program, onSave, onStartProgram }: ProgramBuilderProps) {
  const [currentProgram, setCurrentProgram] = useState<Program>(
    program || {
      name: "",
      restBetweenItems: 0,
      items: [],
    },
  )
  const [editingExercise, setEditingExercise] = useState<{
    exercise: Exercise
    itemIndex: number
    exerciseIndex?: number
  } | null>(null)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [targetItemIndex, setTargetItemIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [draggedItem, setDraggedItem] = useState<{ itemIndex: number; exerciseIndex?: number } | null>(null)

  const addExercise = () => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: "",
      mode: "timed",
      workTime: 30,
      restTime: 10,
      repetitions: 10,
      load: null,
      cycles: 1,
      rounds: 1,
    }
    setCurrentProgram((prev) => ({
      ...prev,
      items: [...prev.items, { type: "standalone", exercise: newExercise, rounds: 1 }],
    }))
  }

  const addGroup = () => {
    const newGroup: ProgramItem = {
      type: "group",
      exercises: [],
      rounds: 1,
      restBetweenExercises: 10,
    }
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
        if (i === itemIndex && item.type === "standalone") {
          return { ...item, rounds }
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
          return { ...item, rounds }
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
          return { ...item, restBetweenExercises }
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

  const editExerciseInGroup = (exercise: Exercise, itemIndex: number, exerciseIndex: number) => {
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
        // Editing exercise within a group
        setCurrentProgram((prev) => ({
          ...prev,
          items: prev.items.map((item, i) => {
            if (i === targetItemIndex && item.type === "group") {
              return {
                ...item,
                exercises: item.exercises.map((ex, ei) => (ei === editingExercise.exerciseIndex ? exercise : ex)),
              }
            }
            return item
          }),
        }))
      } else {
        // Editing a standalone exercise
        setCurrentProgram((prev) => ({
          ...prev,
          items: prev.items.map((item, i) => {
            if (i === targetItemIndex && item.type === "standalone") {
              return { ...item, exercise }
            }
            return item
          }),
        }))
      }
    } else {
      // Adding exercise to a group
      setCurrentProgram((prev) => ({
        ...prev,
        items: prev.items.map((item, i) => {
          if (i === targetItemIndex && item.type === "group") {
            return {
              ...item,
              exercises: [...item.exercises, exercise],
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
            exercises: item.exercises.filter((_, ei) => ei !== exerciseIndex),
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
          const exercises = [...item.exercises]
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
          return { ...item, exercises }
        }
        return item
      }),
    }))
  }

  const moveExerciseToGroup = (fromItemIndex: number, toGroupIndex: number, exerciseIndexInFrom?: number) => {
    const updated = { ...currentProgram }

    let exerciseToMove: Exercise
    let rounds = 1

    // Extract exercise from source
    if (exerciseIndexInFrom !== undefined) {
      // Moving from a group
      const sourceGroup = updated.items[fromItemIndex] as Extract<ProgramItem, { type: "group" }>
      if (sourceGroup.type !== "group") return
      exerciseToMove = sourceGroup.exercises[exerciseIndexInFrom]
      sourceGroup.exercises.splice(exerciseIndexInFrom, 1)

      // Remove group if empty
      if (sourceGroup.exercises.length === 0) {
        updated.items.splice(fromItemIndex, 1)
        // Adjust toGroupIndex if needed
        if (toGroupIndex > fromItemIndex) {
          toGroupIndex--
        }
      }
    } else {
      // Moving from standalone
      const sourceItem = updated.items[fromItemIndex] as Extract<ProgramItem, { type: "standalone" }>
      if (sourceItem.type !== "standalone") return
      exerciseToMove = sourceItem.exercise
      rounds = sourceItem.rounds
      updated.items.splice(fromItemIndex, 1)
      // Adjust toGroupIndex if needed
      if (toGroupIndex > fromItemIndex) {
        toGroupIndex--
      }
    }

    // Add to target group
    const targetGroup = updated.items[toGroupIndex] as Extract<ProgramItem, { type: "group" }>
    if (targetGroup.type === "group") {
      targetGroup.exercises.push(exerciseToMove)
    }

    setCurrentProgram(updated)
  }

  const extractExerciseToStandalone = (itemIndex: number, exerciseIndex: number) => {
    const updated = { ...currentProgram }
    const group = updated.items[itemIndex] as Extract<ProgramItem, { type: "group" }>

    if (group.type !== "group") return

    const exercise = group.exercises[exerciseIndex]
    const rounds = group.rounds

    // Remove from group
    group.exercises.splice(exerciseIndex, 1)

    // Create new standalone item
    const newStandaloneItem: ProgramItem = {
      type: "standalone",
      exercise,
      rounds,
    }

    // Insert after the group
    updated.items.splice(itemIndex + 1, 0, newStandaloneItem)

    // Remove group if empty
    if (group.exercises.length === 0) {
      updated.items.splice(itemIndex, 1)
    }

    setCurrentProgram(updated)
  }

  const handleDragStart = (e: React.DragEvent, itemIndex: number, exerciseIndex?: number) => {
    setDraggedItem({ itemIndex, exerciseIndex })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetItemIndex: number, targetExerciseIndex?: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const updated = { ...currentProgram }
    const { itemIndex: sourceItemIndex, exerciseIndex: sourceExerciseIndex } = draggedItem

    // Get source and target items
    let sourceExercise: Exercise
    let sourceRounds = 1

    // Extract source exercise
    if (sourceExerciseIndex !== undefined) {
      const sourceItem = updated.items[sourceItemIndex] as Extract<ProgramItem, { type: "group" }>
      if (sourceItem.type !== "group") return
      sourceExercise = sourceItem.exercises[sourceExerciseIndex]
      sourceRounds = sourceItem.rounds // Note: this is actually group rounds, might need adjustment if standalone has rounds
      sourceItem.exercises.splice(sourceExerciseIndex, 1)
      if (sourceItem.exercises.length === 0) {
        updated.items.splice(sourceItemIndex, 1)
        if (targetItemIndex > sourceItemIndex) targetItemIndex--
      }
    } else {
      const sourceItem = updated.items[sourceItemIndex] as Extract<ProgramItem, { type: "standalone" }>
      if (sourceItem.type !== "standalone") return
      sourceExercise = sourceItem.exercise
      sourceRounds = sourceItem.rounds
      updated.items.splice(sourceItemIndex, 1)
      if (targetItemIndex > sourceItemIndex) targetItemIndex--
    }

    // Insert at target
    if (targetExerciseIndex !== undefined) {
      const targetItem = updated.items[targetItemIndex] as Extract<ProgramItem, { type: "group" }>
      if (targetItem.type === "group") {
        targetItem.exercises.splice(targetExerciseIndex, 0, sourceExercise)
      }
    } else {
      const targetItem = updated.items[targetItemIndex]
      if (targetItem.type === "group") {
        targetItem.exercises.push(sourceExercise)
      } else {
        updated.items.splice(targetItemIndex, 0, {
          type: "standalone",
          exercise: sourceExercise,
          rounds: sourceRounds,
        })
      }
    }

    setCurrentProgram(updated)
    setDraggedItem(null)
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
    if (exercise.restTime > 0) details.push(`${exercise.restTime}s rest`)
    if (exercise.cycles > 1) details.push(`${exercise.cycles} cycles`)
    return details.join(" • ")
  }

  const getTotalExerciseCount = () => {
    return currentProgram.items.reduce((total, item) => {
      if (item.type === "standalone") return total + 1
      if (item.type === "group") return total + item.exercises.length
      return total
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
      <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
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

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {currentProgram.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No items added yet. Click "Exercise" or "Group" to start building your program.
            </div>
          ) : (
            <>
              {currentProgram.items.map((item, itemIndex) => {
                if (item.type === "standalone") {
                  const exercise = item.exercise
                  return (
                    <div
                      key={itemIndex}
                      draggable
                      onDragStart={(e) => handleDragStart(e, itemIndex)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, itemIndex)}
                      className="cursor-move"
                    >
                      <Card className="bg-card/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{exercise.name || "Unnamed Exercise"}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.rounds} round{item.rounds !== 1 ? "s" : ""} •{" "}
                                {exercise.mode === "timed" ? `${exercise.workTime}s work` : "Manual"}
                                {exercise.restTime > 0 && ` • ${exercise.restTime}s rest`}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => editStandaloneExercise(exercise, itemIndex)}>
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => moveItem(itemIndex, "up")} disabled={itemIndex === 0}>
                                  <MoveUp className="h-4 w-4" />
                                  Move Up
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => moveItem(itemIndex, "down")}
                                  disabled={itemIndex === currentProgram.items.length - 1}
                                >
                                  <MoveDown className="h-4 w-4" />
                                  Move Down
                                </DropdownMenuItem>
                                {currentProgram.items.some((i) => i.type === "group") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        <Users className="h-4 w-4" />
                                        Move to Group
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        {currentProgram.items.map((targetItem, targetIndex) =>
                                          targetItem.type === "group" ? (
                                            <DropdownMenuItem
                                              key={targetIndex}
                                              onClick={() => moveExerciseToGroup(itemIndex, targetIndex)}
                                            >
                                              Group {targetIndex + 1} ({targetItem.exercises.length} exercises)
                                            </DropdownMenuItem>
                                          ) : null,
                                        )}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => removeItem(itemIndex)}>
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                } else {
                  // Group
                  const group = item
                  const isGroupVisible = group.exercises.length > 1

                  return (
                    <Card
                      key={itemIndex}
                      className="bg-muted/30"
                      draggable={!isGroupVisible}
                      onDragStart={(e) => !isGroupVisible && handleDragStart(e, itemIndex)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, itemIndex)}
                    >
                      <CardContent className="p-3 space-y-3">
                        {isGroupVisible && (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  Group {itemIndex + 1} ({group.exercises.length} exercises)
                                </span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => addExerciseToGroup(itemIndex)}>
                                    <Plus className="h-4 w-4" />
                                    Add Exercise
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => moveItem(itemIndex, "up")}
                                    disabled={itemIndex === 0}
                                  >
                                    <MoveUp className="h-4 w-4" />
                                    Move Up
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => moveItem(itemIndex, "down")}
                                    disabled={itemIndex === currentProgram.items.length - 1}
                                  >
                                    <MoveDown className="h-4 w-4" />
                                    Move Down
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem variant="destructive" onClick={() => removeItem(itemIndex)}>
                                    <Trash2 className="h-4 w-4" />
                                    Delete Group
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                                  max={99}
                                  label="Group Rounds"
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`group-${itemIndex}-rest`} className="text-xs">
                                  Rest in Group (s)
                                </Label>
                                <EnhancedNumericInput
                                  id={`group-${itemIndex}-rest`}
                                  value={group.restBetweenExercises}
                                  onChange={(value) => updateGroupRestBetweenExercises(itemIndex, value)}
                                  min={0}
                                  max={600}
                                  label="Rest Between Exercises (seconds)"
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          {group.exercises.map((exercise, exerciseIndex) => (
                            <div
                              key={exerciseIndex}
                              draggable
                              onDragStart={(e) => handleDragStart(e, itemIndex, exerciseIndex)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, itemIndex, exerciseIndex)}
                              className="cursor-move"
                            >
                              <Card className="bg-card">
                                <CardContent className="p-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-xs truncate">
                                        {exercise.name || "Unnamed Exercise"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {exercise.mode === "timed" ? `${exercise.workTime}s work` : "Manual"}
                                        {exercise.restTime > 0 && ` • ${exercise.restTime}s rest`}
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => editExerciseInGroup(exercise, itemIndex, exerciseIndex)}
                                        >
                                          <Edit className="h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => moveExerciseInGroup(itemIndex, exerciseIndex, "up")}
                                          disabled={exerciseIndex === 0}
                                        >
                                          <MoveUp className="h-4 w-4" />
                                          Move Up
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => moveExerciseInGroup(itemIndex, exerciseIndex, "down")}
                                          disabled={exerciseIndex === group.exercises.length - 1}
                                        >
                                          <MoveDown className="h-4 w-4" />
                                          Move Down
                                        </DropdownMenuItem>
                                        {isGroupVisible && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={() => extractExerciseToStandalone(itemIndex, exerciseIndex)}
                                            >
                                              <Users className="h-4 w-4" />
                                              Move to Global
                                            </DropdownMenuItem>
                                            {currentProgram.items.some(
                                              (i, idx) => i.type === "group" && idx !== itemIndex,
                                            ) && (
                                              <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                  <Users className="h-4 w-4" />
                                                  Move to Other Group
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                  {currentProgram.items.map((targetItem, targetIndex) =>
                                                    targetItem.type === "group" && targetIndex !== itemIndex ? (
                                                      <DropdownMenuItem
                                                        key={targetIndex}
                                                        onClick={() =>
                                                          moveExerciseToGroup(itemIndex, targetIndex, exerciseIndex)
                                                        }
                                                      >
                                                        Group {targetIndex + 1} ({targetItem.exercises.length}{" "}
                                                        exercises)
                                                      </DropdownMenuItem>
                                                    ) : null,
                                                  )}
                                                </DropdownMenuSubContent>
                                              </DropdownMenuSub>
                                            )}
                                          </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          variant="destructive"
                                          onClick={() => removeExerciseFromGroup(itemIndex, exerciseIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              })}
            </>
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
