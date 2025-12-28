import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../common/Toast'
import LoadingSkeleton from '../common/LoadingSkeleton'
import DoctorCard from './DoctorCard'
import { retryWithBackoff } from '../../utils/retry'
import { getCachedData, setCachedData, clearCache } from '../../utils/cache'

const CACHE_KEY = 'doctors_list'
const CACHE_EXPIRATION = 60 * 60 * 1000 // 1 hour

/**
 * Optimized DoctorListing component with:
 * - Retry logic with exponential backoff
 * - Timeout protection (10 seconds)
 * - localStorage caching with expiration
 * - Performance optimizations (useCallback, useMemo)
 * - Better error handling with retry button
 * - Loading states with skeleton
 */
export default function DoctorListing() {
  const { toast, showError, hideToast } = useToast()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const hasFetchedRef = useRef(false)

  /**
   * Fetch doctors from Supabase API
   */
  const fetchDoctorsFromAPI = useCallback(async (updateState = true) => {
    const fetchFunction = async () => {
      const { data, error: supabaseError } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw new Error(supabaseError.message || 'Failed to fetch doctors')
      }

      const doctorsData = data || []

      // Cache the data
      setCachedData(CACHE_KEY, doctorsData, CACHE_EXPIRATION)

      if (updateState) {
        setDoctors(doctorsData)
        setLoading(false)
        setError(null)
        setRetryCount(0)
      }

      return doctorsData
    }

    // Use retry logic with exponential backoff and timeout
    return await retryWithBackoff(fetchFunction, {
      maxAttempts: 3,
      timeout: 10000, // 10 seconds
      baseDelay: 1000,
      onRetry: (attempt, delay, error) => {
        console.log(`Retry attempt ${attempt} after ${delay}ms. Error:`, error)
        setRetryCount(attempt)
      }
    })
  }, [])

  /**
   * Handle fetch errors with user-friendly messages
   */
  const handleFetchError = useCallback((err) => {
    console.error('Error fetching doctors:', err)
    
    const errorMessage = err.message || 'Unknown error occurred'
    let userMessage = 'Error loading doctors. Please try again.'

    if (errorMessage.includes('timeout')) {
      userMessage = 'Request timed out. Please check your connection and try again.'
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      userMessage = 'Network error. Please check your internet connection.'
    } else if (errorMessage.includes('Failed to fetch')) {
      userMessage = 'Unable to connect to the server. Please try again later.'
    }

    setError(userMessage)
    setLoading(false)
    showError(userMessage)

    // Try to load from cache as fallback
    const cachedDoctors = getCachedData(CACHE_KEY)
    if (cachedDoctors && cachedDoctors.length > 0) {
      setDoctors(cachedDoctors)
      showError('Showing cached data. Some information may be outdated.')
    }
  }, [showError])

  /**
   * Fetch doctors from Supabase with retry logic and caching
   */
  const fetchDoctors = useCallback(async (useCache = true) => {
    try {
      setLoading(true)
      setError(null)

      // Try to load from cache first
      if (useCache) {
        const cachedDoctors = getCachedData(CACHE_KEY)
        if (cachedDoctors) {
          setDoctors(cachedDoctors)
          setLoading(false)
          // Fetch fresh data in background (don't await)
          fetchDoctorsFromAPI(false).catch(handleFetchError)
          return
        }
      }

      // Fetch from API with retry logic
      await fetchDoctorsFromAPI(true)
    } catch (err) {
      handleFetchError(err)
    }
  }, [fetchDoctorsFromAPI, handleFetchError])

  /**
   * Handle manual retry
   */
  const handleRetry = useCallback(() => {
    clearCache(CACHE_KEY)
    setRetryCount(0)
    fetchDoctors(false)
  }, [fetchDoctors])

  // Initial fetch on mount - only run once
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchDoctors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Memoized empty state component
   */
  const emptyState = useMemo(() => (
    <div className="text-center py-12">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
      <p className="text-gray-400 text-sm mt-2">Please check back later or contact support.</p>
    </div>
  ), [])

  /**
   * Memoized error state component
   */
  const errorState = useMemo(() => (
    <div className="text-center py-12">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Doctors</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
      {retryCount > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Retry attempt {retryCount} of 3
        </p>
      )}
      <button
        onClick={handleRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>
    </div>
  ), [error, retryCount, handleRetry])

  /**
   * Memoized doctors grid
   */
  const doctorsGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  ), [doctors])

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Mental Health Professional
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Book a session with our qualified psychologists and take the first step towards better mental wellness
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : error ? (
          errorState
        ) : doctors.length === 0 ? (
          emptyState
        ) : (
          doctorsGrid
        )}
      </div>
    </>
  )
}
