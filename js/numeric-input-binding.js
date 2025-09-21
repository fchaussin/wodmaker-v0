/**
 * NumericInputBinding - Binding Implementation
 * Automatically applies NumericInputModal to all number inputs
 */
class NumericInputBinding {
  constructor() {
    this.instances = new Map()
    this.observer = null
    this.isInitialized = false

    this.bindMethods()
  }

  bindMethods() {
    this.handleFocus = this.handleFocus.bind(this)
    this.handleMutation = this.handleMutation.bind(this)
    this.init = this.init.bind(this)
    this.destroy = this.destroy.bind(this)
  }

  init() {
    if (this.isInitialized) return

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init())
      return
    }

    // Scan existing inputs
    this.scanForInputs()

    // Set up mutation observer for dynamically added inputs
    this.setupMutationObserver()

    this.isInitialized = true
    console.log("[NumericInputBinding] Initialized")
  }

  scanForInputs() {
    const inputs = document.querySelectorAll('input[type="number"]')
    inputs.forEach((input) => this.bindInput(input))
  }

  bindInput(input) {
    // Skip if already bound
    if (this.instances.has(input)) return

    // Skip if explicitly disabled
    if (input.hasAttribute("data-numeric-modal-disabled")) return

    // Create and store instance
    const instance = new window.NumericInputModal(input)
    this.instances.set(input, instance)

    // Add focus listener
    input.addEventListener("focus", this.handleFocus)

    // Add visual indicator (optional)
    input.style.cursor = "pointer"
    input.title = input.title || "Tap to open numeric keypad"

    console.log("[NumericInputBinding] Bound input:", input)
  }

  unbindInput(input) {
    const instance = this.instances.get(input)
    if (instance) {
      instance.destroy()
      this.instances.delete(input)
      input.removeEventListener("focus", this.handleFocus)

      // Remove visual indicator
      input.style.cursor = ""
      if (input.title === "Tap to open numeric keypad") {
        input.title = ""
      }

      console.log("[NumericInputBinding] Unbound input:", input)
    }
  }

  handleFocus(event) {
    const input = event.target
    const instance = this.instances.get(input)

    if (instance) {
      // Small delay to ensure focus is properly set
      setTimeout(() => {
        instance.show()
      }, 10)
    }
  }

  setupMutationObserver() {
    this.observer = new MutationObserver(this.handleMutation)

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["type"],
    })
  }

  handleMutation(mutations) {
    mutations.forEach((mutation) => {
      // Handle added nodes
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a number input
            if (node.matches && node.matches('input[type="number"]')) {
              this.bindInput(node)
            }

            // Check for number inputs within the added node
            const inputs = node.querySelectorAll && node.querySelectorAll('input[type="number"]')
            if (inputs) {
              inputs.forEach((input) => this.bindInput(input))
            }
          }
        })

        // Handle removed nodes
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a number input
            if (node.matches && node.matches('input[type="number"]')) {
              this.unbindInput(node)
            }

            // Check for number inputs within the removed node
            const inputs = node.querySelectorAll && node.querySelectorAll('input[type="number"]')
            if (inputs) {
              inputs.forEach((input) => this.unbindInput(input))
            }
          }
        })
      }

      // Handle attribute changes (type attribute)
      if (mutation.type === "attributes" && mutation.attributeName === "type") {
        const element = mutation.target
        if (element.type === "number") {
          this.bindInput(element)
        } else {
          this.unbindInput(element)
        }
      }
    })
  }

  destroy() {
    if (!this.isInitialized) return

    // Clean up all instances
    this.instances.forEach((instance, input) => {
      this.unbindInput(input)
    })

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    this.isInitialized = false
    console.log("[NumericInputBinding] Destroyed")
  }

  // Public API methods
  enable(input) {
    if (input && input.type === "number") {
      input.removeAttribute("data-numeric-modal-disabled")
      this.bindInput(input)
    }
  }

  disable(input) {
    if (input) {
      input.setAttribute("data-numeric-modal-disabled", "true")
      this.unbindInput(input)
    }
  }

  refresh() {
    this.scanForInputs()
  }
}

// Auto-initialize when script loads
let numericInputBinding

function initNumericInputBinding() {
  if (!numericInputBinding) {
    numericInputBinding = new NumericInputBinding()
    numericInputBinding.init()
  }
  return numericInputBinding
}

// Initialize immediately
initNumericInputBinding()

// Export for manual control if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NumericInputBinding, initNumericInputBinding }
} else {
  window.NumericInputBinding = NumericInputBinding
  window.initNumericInputBinding = initNumericInputBinding
  window.numericInputBinding = numericInputBinding
}
