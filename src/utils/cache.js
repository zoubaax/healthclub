/**
 * localStorage caching utility with expiration
 */

const CACHE_PREFIX = 'health_app_'
const DEFAULT_EXPIRATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Get cached data if it exists and hasn't expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/missing
 */
export function getCachedData(key) {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null

    const { data, timestamp, expiration } = JSON.parse(cached)
    const now = Date.now()
    const age = now - timestamp

    // Check if cache has expired
    if (age > expiration) {
      // Remove expired cache
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }

    return data
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

/**
 * Set data in cache with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expirationMs - Expiration time in milliseconds (default: 1 hour)
 */
export function setCachedData(key, data, expirationMs = DEFAULT_EXPIRATION) {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiration: expirationMs
    }
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))
  } catch (error) {
    console.error('Error writing to cache:', error)
    // Handle quota exceeded error gracefully
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old cache entries')
      clearOldCacheEntries()
      // Try once more
      try {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError)
      }
    }
  }
}

/**
 * Clear a specific cache entry
 * @param {string} key - Cache key to clear
 */
export function clearCache(key) {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`)
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Clear all cache entries with the app prefix
 */
export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing all cache:', error)
  }
}

/**
 * Clear old/expired cache entries to free up space
 */
function clearOldCacheEntries() {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    let cleared = 0

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { timestamp, expiration } = JSON.parse(cached)
            const age = now - timestamp
            if (age > expiration) {
              localStorage.removeItem(key)
              cleared++
            }
          }
        } catch (error) {
          // If we can't parse it, remove it
          localStorage.removeItem(key)
          cleared++
        }
      }
    })

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired cache entries`)
    }
  } catch (error) {
    console.error('Error clearing old cache entries:', error)
  }
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
    const now = Date.now()
    let totalSize = 0
    let expiredCount = 0
    let validCount = 0

    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          totalSize += cached.length
          const { timestamp, expiration } = JSON.parse(cached)
          const age = now - timestamp
          if (age > expiration) {
            expiredCount++
          } else {
            validCount++
          }
        }
      } catch (error) {
        // Skip invalid entries
      }
    })

    return {
      totalEntries: cacheKeys.length,
      validEntries: validCount,
      expiredEntries: expiredCount,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2)
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return null
  }
}

