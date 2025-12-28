import { memo } from 'react'

/**
 * LoadingSkeleton component with shimmer animation
 * Used for displaying loading states while data is being fetched
 */
const LoadingSkeleton = memo(function LoadingSkeleton({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="h-64 bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          {/* Content skeleton */}
          <div className="p-6 space-y-4">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4">
              <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            {/* Subtitle skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/2">
              <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full">
                <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-5/6">
                <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-4/6">
                <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-10 bg-gray-200 rounded-lg mt-6">
              <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

export default LoadingSkeleton

