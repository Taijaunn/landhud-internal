'use client'

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

function generateId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

// Simple toast implementation using console and alert for now
// Can be upgraded to a proper toast UI later
export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(
    ({ title, description, variant }: Omit<Toast, 'id'>) => {
      const id = generateId()
      
      // For now, just console log - can add UI later
      if (variant === 'destructive') {
        console.error(`[Toast Error] ${title}: ${description}`)
      } else {
        console.log(`[Toast] ${title}: ${description}`)
      }
      
      const newToast: Toast = { id, title, description, variant }
      
      setState((prev) => ({
        toasts: [...prev.toasts, newToast],
      }))

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          toasts: prev.toasts.filter((t) => t.id !== id),
        }))
      }, 3000)

      return { id, dismiss: () => {} }
    },
    []
  )

  return {
    toast,
    toasts: state.toasts,
    dismiss: (id: string) => {
      setState((prev) => ({
        toasts: prev.toasts.filter((t) => t.id !== id),
      }))
    },
  }
}
