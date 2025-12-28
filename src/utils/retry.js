/**
 * Retry utility with exponential backoff and timeout
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of retry attempts (default: 3)
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {number} options.baseDelay - Base delay in milliseconds for exponential backoff (default: 1000)
 * @param {Function} options.onRetry - Callback called on each retry attempt
 * @returns {Promise} - Promise that resolves with the function result
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    timeout = 10000,
    baseDelay = 1000,
    onRetry = null
  } = options

  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${timeout}ms`))
        }, timeout)
      })

      // Race between the function and timeout
      const result = await Promise.race([fn(), timeoutPromise])
      return result
    } catch (error) {
      lastError = error

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt - 1)
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, delay, error)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All attempts failed
  throw lastError
}

