"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NumericInputModalProps {
  isOpen: boolean
  onClose: () => void
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

export function NumericInputModal({
  isOpen,
  onClose,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label = "Value",
}: NumericInputModalProps) {
  const [currentValue, setCurrentValue] = useState(value)
  const [inputValue, setInputValue] = useState(value.toString())
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [accelerationTimer, setAccelerationTimer] = useState<NodeJS.Timeout | null>(null)
  const [accelerationRate, setAccelerationRate] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setCurrentValue(value)
      setInputValue(value.toString())
      setAccelerationRate(1)
    }
  }, [isOpen, value])

  const clearTimers = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    if (accelerationTimer) {
      clearInterval(accelerationTimer)
      setAccelerationTimer(null)
    }
    setAccelerationRate(1)
  }

  const increment = () => {
    setCurrentValue((prev) => {
      const newValue = Math.min(prev + step * accelerationRate, max)
      setInputValue(newValue.toString())
      return newValue
    })
  }

  const decrement = () => {
    setCurrentValue((prev) => {
      const newValue = Math.max(prev - step * accelerationRate, min)
      setInputValue(newValue.toString())
      return newValue
    })
  }

  const startLongPress = (action: () => void) => {
    action() // Execute immediately

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        action()
        setAccelerationRate((prev) => Math.min(prev + 0.5, 10)) // Accelerate up to 10x
      }, 100)
      setAccelerationTimer(interval)
    }, 500) // Start repeating after 500ms

    setLongPressTimer(timer)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)

    const numValue = Number.parseInt(inputVal)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue))
      setCurrentValue(clampedValue)
    }
  }

  const handleConfirm = () => {
    onChange(currentValue)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-80 max-w-[90vw]">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">{label}</h3>
          <div className="text-4xl font-mono font-bold text-blue-400 mb-4">{currentValue}</div>

          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="text-center text-xl font-mono bg-gray-800 border-gray-600 text-white"
            autoFocus
          />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 text-2xl font-bold bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            onMouseDown={() => startLongPress(decrement)}
            onMouseUp={clearTimers}
            onMouseLeave={clearTimers}
            onTouchStart={() => startLongPress(decrement)}
            onTouchEnd={clearTimers}
          >
            -
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 text-2xl font-bold bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            onMouseDown={() => startLongPress(increment)}
            onMouseUp={clearTimers}
            onMouseLeave={clearTimers}
            onTouchStart={() => startLongPress(increment)}
            onTouchEnd={clearTimers}
          >
            +
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
