/**
 * TypeScript type definitions for Doctor-related entities
 * 
 * These types can be used if you migrate to TypeScript,
 * or as JSDoc reference for better IDE autocomplete in JavaScript files
 */

/**
 * Doctor entity from Supabase database
 */
export interface Doctor {
  /** Unique identifier for the doctor */
  id: string
  
  /** Doctor's first name */
  first_name: string
  
  /** Doctor's last name */
  last_name: string
  
  /** Doctor's specialty/field of expertise */
  specialty?: string | null
  
  /** Doctor's professional description/bio */
  description?: string | null
  
  /** URL to doctor's profile picture */
  profile_picture_url?: string | null
  
  /** Timestamp when the doctor record was created */
  created_at: string
  
  /** Timestamp when the doctor record was last updated */
  updated_at?: string | null
}

/**
 * Doctor listing component props
 */
export interface DoctorListingProps {
  /** Optional initial doctors data */
  initialDoctors?: Doctor[]
  
  /** Optional callback when doctors are loaded */
  onDoctorsLoaded?: (doctors: Doctor[]) => void
}

/**
 * Doctor card component props
 */
export interface DoctorCardProps {
  /** Doctor data to display */
  doctor: Doctor
  
  /** Optional click handler */
  onClick?: (doctor: Doctor) => void
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T
  
  /** Timestamp when data was cached */
  timestamp: number
  
  /** Expiration time in milliseconds */
  expiration: number
}

/**
 * Retry options for retryWithBackoff utility
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number
  
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number
  
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  baseDelay?: number
  
  /** Callback called on each retry attempt */
  onRetry?: (attempt: number, delay: number, error: Error) => void
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total number of cache entries */
  totalEntries: number
  
  /** Number of valid (non-expired) entries */
  validEntries: number
  
  /** Number of expired entries */
  expiredEntries: number
  
  /** Total size in bytes */
  totalSize: number
  
  /** Total size in kilobytes (formatted) */
  totalSizeKB: string
}

