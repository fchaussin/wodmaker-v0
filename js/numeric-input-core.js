/**
 * NumericInputModal - Core Module
 * Abstract, reusable component for enhanced numeric input behavior
 */
class NumericInputModal {
  constructor(inputElement) {
    this.inputElement = inputElement
    this.currentValue = Number.parseFloat(inputElement.value) || 0
    this.initialValue = this.currentValue
    this.min = Number.parseFloat(inputElement.min) || Number.NEGATIVE_INFINITY
    this.max = Number.parseFloat(inputElement.max) || Number.POSITIVE_INFINITY
    this.step = Number.parseFloat(inputElement.step) || 1

    this.modal = null
    this.displayElement = null
    this.incrementButton = null
    this.decrementButton = null

    this.longPressTimer = null
    this.longPressInterval = null
    this.longPressDelay = 500 // Initial delay before acceleration
    this.longPressSpeed = 100 // Interval for repeated increments

    this.isVisible = false

    this.bindMethods()
  }

  bindMethods() {
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.save = this.save.bind(this)
    this.cancel = this.cancel.bind(this)
    this.reset = this.reset.bind(this)
    this.increment = this.increment.bind(this)
    this.decrement = this.decrement.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleDisplayClick = this.handleDisplayClick.bind(this)
    this.startLongPress = this.startLongPress.bind(this)
    this.stopLongPress = this.stopLongPress.bind(this)
  }

  show() {
    if (this.isVisible) return

    this.currentValue = Number.parseFloat(this.inputElement.value) || 0
    this.initialValue = this.currentValue
    this.createModal()
    this.isVisible = true

    // Prevent body scroll
    document.body.style.overflow = "hidden"

    // Focus management for accessibility
    this.modal.focus()
  }

  hide() {
    if (!this.isVisible) return

    if (this.modal) {
      this.modal.remove()
      this.modal = null
    }

    this.isVisible = false
    document.body.style.overflow = ""

    // Return focus to original input
    this.inputElement.focus()
  }

  createModal() {
    // Create modal overlay
    this.modal = document.createElement("div")
    this.modal.className = "numeric-modal-overlay"
    this.modal.setAttribute("role", "dialog")
    this.modal.setAttribute("aria-modal", "true")
    this.modal.setAttribute("aria-label", "Numeric input editor")
    this.modal.tabIndex = -1

    // Create modal content
    const modalContent = document.createElement("div")
    modalContent.className = "numeric-modal"

    // Create display section
    const displaySection = document.createElement("div")
    displaySection.className = "numeric-display"

    this.displayElement = document.createElement("div")
    this.displayElement.textContent = this.formatValue(this.currentValue)
    this.displayElement.setAttribute("role", "textbox")
    this.displayElement.setAttribute("aria-label", "Current value")
    this.displayElement.style.cursor = "pointer"
    this.displayElement.addEventListener("click", this.handleDisplayClick)

    displaySection.appendChild(this.displayElement)

    // Create controls section
    const controlsSection = document.createElement("div")
    controlsSection.className = "numeric-controls"

    // Decrement button
    this.decrementButton = document.createElement("button")
    this.decrementButton.className = "numeric-button numeric-button-decrement"
    this.decrementButton.textContent = "−"
    this.decrementButton.setAttribute("aria-label", "Decrease value")
    this.decrementButton.addEventListener("click", this.decrement)
    this.decrementButton.addEventListener("mousedown", (e) => this.startLongPress(this.decrement))
    this.decrementButton.addEventListener("mouseup", this.stopLongPress)
    this.decrementButton.addEventListener("mouseleave", this.stopLongPress)
    this.decrementButton.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.startLongPress(this.decrement)
    })
    this.decrementButton.addEventListener("touchend", this.stopLongPress)

    // Spacer
    const spacer = document.createElement("div")
    spacer.style.flex = "1"

    // Increment button
    this.incrementButton = document.createElement("button")
    this.incrementButton.className = "numeric-button numeric-button-increment"
    this.incrementButton.textContent = "+"
    this.incrementButton.setAttribute("aria-label", "Increase value")
    this.incrementButton.addEventListener("click", this.increment)
    this.incrementButton.addEventListener("mousedown", (e) => this.startLongPress(this.increment))
    this.incrementButton.addEventListener("mouseup", this.stopLongPress)
    this.incrementButton.addEventListener("mouseleave", this.stopLongPress)
    this.incrementButton.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.startLongPress(this.increment)
    })
    this.incrementButton.addEventListener("touchend", this.stopLongPress)

    controlsSection.appendChild(this.decrementButton)
    controlsSection.appendChild(spacer)
    controlsSection.appendChild(this.incrementButton)

    // Create actions section
    const actionsSection = document.createElement("div")
    actionsSection.className = "numeric-actions"

    // Reset button
    const resetButton = document.createElement("button")
    resetButton.className = "numeric-action-button destructive"
    resetButton.textContent = "Reset"
    resetButton.addEventListener("click", this.reset)

    // Cancel button
    const cancelButton = document.createElement("button")
    cancelButton.className = "numeric-action-button"
    cancelButton.textContent = "Cancel"
    cancelButton.addEventListener("click", this.cancel)

    // Save button
    const saveButton = document.createElement("button")
    saveButton.className = "numeric-action-button primary"
    saveButton.textContent = "Save"
    saveButton.addEventListener("click", this.save)

    actionsSection.appendChild(resetButton)
    actionsSection.appendChild(cancelButton)
    actionsSection.appendChild(saveButton)

    // Assemble modal
    modalContent.appendChild(displaySection)
    modalContent.appendChild(controlsSection)
    modalContent.appendChild(actionsSection)
    this.modal.appendChild(modalContent)

    // Add event listeners
    this.modal.addEventListener("keydown", this.handleKeydown)
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.cancel()
      }
    })

    // Add to DOM
    document.body.appendChild(this.modal)
  }

  formatValue(value) {
    // Handle display of values, ensuring at least 3 digits width for layout stability
    const formatted = value.toString()
    return formatted.length < 3 ? formatted.padStart(3, " ") : formatted
  }

  updateDisplay() {
    if (this.displayElement) {
      this.displayElement.textContent = this.formatValue(this.currentValue)
    }
  }

  increment() {
    const newValue = this.currentValue + this.step
    if (newValue <= this.max) {
      this.currentValue = newValue
      this.updateDisplay()
    }
  }

  decrement() {
    const newValue = this.currentValue - this.step
    if (newValue >= this.min) {
      this.currentValue = newValue
      this.updateDisplay()
    }
  }

  startLongPress(action) {
    this.stopLongPress() // Clear any existing timers

    this.longPressTimer = setTimeout(() => {
      this.longPressInterval = setInterval(action, this.longPressSpeed)
    }, this.longPressDelay)
  }

  stopLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    if (this.longPressInterval) {
      clearInterval(this.longPressInterval)
      this.longPressInterval = null
    }
  }

  handleDisplayClick() {
    // Allow direct input via native keypad
    const input = document.createElement("input")
    input.type = "number"
    input.value = this.currentValue
    input.min = this.min
    input.max = this.max
    input.step = this.step
    input.style.position = "absolute"
    input.style.opacity = "0"
    input.style.pointerEvents = "none"

    document.body.appendChild(input)
    input.focus()
    input.select()

    const handleInput = () => {
      const newValue = Number.parseFloat(input.value)
      if (!isNaN(newValue) && newValue >= this.min && newValue <= this.max) {
        this.currentValue = newValue
        this.updateDisplay()
      }
      cleanup()
    }

    const cleanup = () => {
      input.removeEventListener("blur", handleInput)
      input.removeEventListener("change", handleInput)
      document.body.removeChild(input)
      this.modal.focus()
    }

    input.addEventListener("blur", handleInput)
    input.addEventListener("change", handleInput)
  }

  save() {
    this.inputElement.value = this.currentValue

    // Trigger change event
    const event = new Event("change", { bubbles: true })
    this.inputElement.dispatchEvent(event)

    this.hide()
  }

  cancel() {
    this.currentValue = this.initialValue
    this.hide()
  }

  reset() {
    this.currentValue = Number.parseFloat(this.inputElement.defaultValue) || 0
    this.updateDisplay()
  }

  handleKeydown(e) {
    switch (e.key) {
      case "Escape":
        e.preventDefault()
        this.cancel()
        break
      case "Enter":
        e.preventDefault()
        this.save()
        break
      case "ArrowUp":
        e.preventDefault()
        this.increment()
        break
      case "ArrowDown":
        e.preventDefault()
        this.decrement()
        break
      case "r":
      case "R":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          this.reset()
        }
        break
    }
  }

  destroy() {
    this.stopLongPress()
    this.hide()
  }
}

// Export for use in binding implementation
if (typeof module !== "undefined" && module.exports) {
  module.exports = NumericInputModal
} else {
  window.NumericInputModal = NumericInputModal
}
