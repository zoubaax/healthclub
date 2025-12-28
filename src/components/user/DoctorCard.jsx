import { memo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

/**
 * DoctorCard component with lazy loading images and fallbacks
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const DoctorCard = memo(function DoctorCard({ doctor }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoading(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
  }, [])

  const initials = `${doctor.first_name?.[0] || ''}${doctor.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
      {/* Image container with lazy loading */}
      <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {doctor.profile_picture_url && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={doctor.profile_picture_url}
              alt={`${doctor.first_name} ${doctor.last_name}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
              decoding="async"
            />
          </>
        ) : (
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-semibold text-indigo-600">
              {initials || 'DR'}
            </span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Dr. {doctor.first_name} {doctor.last_name}
        </h2>
        
        {doctor.specialty && (
          <p className="text-indigo-600 font-medium mb-3 text-sm">
            {doctor.specialty}
          </p>
        )}
        
        {doctor.description && (
          <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-sm">
            {doctor.description}
          </p>
        )}
        
        <Link
          to={`/book/${doctor.id}`}
          className="block w-full text-center bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Book Session
        </Link>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if doctor data actually changed
  return (
    prevProps.doctor.id === nextProps.doctor.id &&
    prevProps.doctor.first_name === nextProps.doctor.first_name &&
    prevProps.doctor.last_name === nextProps.doctor.last_name &&
    prevProps.doctor.specialty === nextProps.doctor.specialty &&
    prevProps.doctor.description === nextProps.doctor.description &&
    prevProps.doctor.profile_picture_url === nextProps.doctor.profile_picture_url
  )
})

export default DoctorCard

