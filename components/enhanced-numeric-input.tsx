"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { NumericInputModal } from "./numeric-input-modal"

interface EnhancedNumericInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
  id?: string
}

export function EnhancedNumericInput({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  className,
  id,
}: EnhancedNumericInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleInputFocus = () => {
    setIsModalOpen(true)
  }

  const handleModalChange = (newValue: number) => {
    onChange(newValue)
  }

  return (
    <>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value) || 0)}
        onFocus={handleInputFocus}
        min={min}
        max={max}
        step={step}
        className={className}
        readOnly // Prevent keyboard input, force modal usage
      />

      <NumericInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value}
        onChange={handleModalChange}
        min={min}
        max={max}
        step={step}
        label={label || "Enter value"}
      />
    </>
  )
}
