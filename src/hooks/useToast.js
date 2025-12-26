import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type, duration })
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message) => showToast(message, 'success'),
    showError: (message) => showToast(message, 'error', 5000),
    showWarning: (message) => showToast(message, 'warning'),
    showInfo: (message) => showToast(message, 'info')
  }
}

