import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../common/Toast'

export default function DoctorListing() {
  const { toast, showError, hideToast } = useToast()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      showError('Error loading doctors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading doctors...</div>
      </div>
    )
  }

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

      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {doctor.profile_picture_url ? (
                  <img
                    src={doctor.profile_picture_url}
                    alt={`${doctor.first_name} ${doctor.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-semibold text-indigo-600">
                      {doctor.first_name[0]}{doctor.last_name[0]}
                    </span>
                  </div>
                )}
              </div>
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
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-sm">{doctor.description}</p>
                )}
                <Link
                  to={`/book/${doctor.id}`}
                  className="block w-full text-center bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}

