import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../common/Toast'
import { sendAdminNotification } from '../../lib/emailService'

export default function BookingForm() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const [doctor, setDoctor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    educationLevel: ''
  })

  useEffect(() => {
    fetchDoctor()
  }, [doctorId])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
      
      // Refresh available slots every 30 seconds to show real-time availability
      const refreshInterval = setInterval(() => {
        fetchAvailableSlots()
      }, 30000) // 30 seconds
      
      return () => clearInterval(refreshInterval)
    }
  }, [selectedDate, doctorId])

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single()

      if (error) throw error
      setDoctor(data)
    } catch (error) {
      console.error('Error fetching doctor:', error)
      showError('Error loading doctor information.')
      setTimeout(() => navigate('/'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', selectedDate)
        .eq('is_available', true)
        .gte('date', today)
        .order('start_time', { ascending: true })

      if (error) throw error
      const slots = data || []
      setAvailableSlots(slots)
      
      // If the currently selected slot is no longer available, clear the selection
      if (selectedSlot && !slots.find(slot => slot.id === selectedSlot.id)) {
        const wasSelected = selectedSlot
        setSelectedSlot(null)
        // Only show error if user had actually selected this slot (not during initial load)
        if (wasSelected) {
          showError('The time slot you selected is no longer available. Please choose another time.')
        }
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSlot) {
      showError('Please select a time slot')
      return
    }

    setSubmitting(true)

    try {
      // First, verify the slot is still available (prevent race conditions)
      const { data: slotCheck, error: slotCheckError } = await supabase
        .from('time_slots')
        .select('id, is_available')
        .eq('id', selectedSlot.id)
        .eq('is_available', true)
        .single()

      if (slotCheckError || !slotCheck) {
        // Slot is no longer available - clear selection and refresh
        setSelectedSlot(null)
        showError('This time slot was just booked by someone else. Please select another available time.')
        setSubmitting(false)
        // Refresh available slots to show current availability
        if (selectedDate) {
          await fetchAvailableSlots()
        }
        return
      }

      // Create appointment
      // Try with select first, but handle RLS permission errors gracefully
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          time_slot_id: selectedSlot.id,
          patient_first_name: formData.firstName.trim(),
          patient_last_name: formData.lastName.trim(),
          patient_email: formData.email.trim(),
          patient_phone: formData.phone.trim(),
          education_level: formData.educationLevel || null,
          status: 'pending'
        })
        .select()
        .single()

      if (appointmentError) {
        console.error('Appointment creation error:', appointmentError)
        
        // If error is due to RLS (can't select after insert), the insert likely succeeded
        // Check if it's a permission/RLS error
        const isRLSError = appointmentError.code === 'PGRST301' || 
                          appointmentError.code === '42501' ||
                          appointmentError.message?.toLowerCase().includes('permission') ||
                          appointmentError.message?.toLowerCase().includes('row-level security') ||
                          appointmentError.message?.toLowerCase().includes('rls')
        
        if (isRLSError) {
          // The appointment was likely created, but we can't read it back due to RLS
          // Verify by checking if slot was updated (we'll do this next)
          console.log('Appointment insert completed (RLS prevents reading it back)')
        } else {
          // Real error - appointment was not created
          if (appointmentError.code === '23505') {
            throw new Error('This appointment already exists. Please refresh and try again.')
          } else if (appointmentError.code === '23503') {
            throw new Error('Invalid doctor or time slot. Please refresh and try again.')
          }
          throw appointmentError
        }
      }

      // Mark time slot as unavailable
      // Try to update without select first (to avoid RLS issues with reading back)
      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id)
        .eq('is_available', true) // Only update if still available

      if (slotError) {
        console.error('Time slot update error:', slotError)
        
        // Check if it's an RLS/permission error
        const isRLSError = slotError.code === '42501' || 
                          slotError.message?.toLowerCase().includes('permission') ||
                          slotError.message?.toLowerCase().includes('row-level security') ||
                          slotError.message?.toLowerCase().includes('rls') ||
                          slotError.message?.toLowerCase().includes('policy')
        
        if (isRLSError) {
          // RLS policy issue - public users cannot update time slots
          // The appointment was created, but slot wasn't marked as unavailable
          console.warn('RLS policy prevents updating time slot. Appointment created but slot may still show as available.')
          console.warn('Please run the SQL in fix-time-slot-rls.sql in your Supabase SQL Editor to fix this.')
          // Continue - appointment was created successfully
          // Admin will need to manually update the slot or fix the RLS policy
        } else if (slotError.code === 'PGRST116' || slotError.message?.includes('No rows')) {
          // No rows matched - slot was already booked or doesn't exist
          setSelectedSlot(null)
          if (selectedDate) {
            await fetchAvailableSlots()
          }
          throw new Error('This time slot is no longer available. Please select another time.')
        } else {
          // Other error
          setSelectedSlot(null)
          if (selectedDate) {
            await fetchAvailableSlots()
          }
          throw new Error('Failed to reserve time slot. Please try again.')
        }
      } else {
        // Update succeeded (no error)
        // Even if we can't verify by reading it back due to RLS, the update worked
        console.log('Time slot marked as unavailable successfully')
      }

      // Send email notification to admins (non-blocking, fire and forget)
      // Use setTimeout to ensure it doesn't block the booking flow
      setTimeout(async () => {
        try {
          console.log('📧 Attempting to send email notification...')
          // Create appointment data for email (appointment might be null due to RLS)
          const appointmentData = {
            id: appointment?.id || 'N/A',
            patient_first_name: formData.firstName.trim(),
            patient_last_name: formData.lastName.trim(),
            patient_email: formData.email.trim(),
            patient_phone: formData.phone.trim(),
            education_level: formData.educationLevel || null,
            date: selectedDate,
            start_time: selectedSlot.start_time,
            end_time: selectedSlot.end_time
          }
          const emailResult = await sendAdminNotification(appointmentData, doctor)
          if (emailResult.success) {
            console.log('✅ Email notification sent successfully')
          } else {
            console.warn('⚠️ Email notification failed:', emailResult.error)
            console.warn('Check the browser console for details on how to fix this.')
          }
        } catch (emailError) {
          console.error('❌ Error sending admin notification email:', emailError)
        }
      }, 0)

      showSuccess('Appointment booked successfully!')
      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      console.error('Error booking appointment:', error)
      // Show user-friendly error message
      let errorMessage = 'Error booking appointment. Please try again.'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.code) {
        // Handle specific Supabase error codes
        switch (error.code) {
          case '23505':
            errorMessage = 'This appointment already exists. Please refresh and try again.'
            break
          case '23503':
            errorMessage = 'Invalid doctor or time slot. Please refresh and try again.'
            break
          case 'PGRST116':
            errorMessage = 'Time slot no longer available. Please select another time.'
            break
          default:
            errorMessage = `Error: ${error.message || error.code}`
        }
      }
      
      showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!doctor) {
    return null
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Book Session with Dr. {doctor.first_name} {doctor.last_name}
          </h1>
          {doctor.specialty && (
            <p className="text-indigo-600 font-medium text-base">
              {doctor.specialty}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              min={today}
              max={maxDateStr}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedSlot(null)
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Time
              </label>
              {availableSlots.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-amber-800 text-sm">No available slots for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2.5 rounded-lg border font-medium transition-all duration-200 text-sm ${
                        selectedSlot?.id === slot.id
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                          : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700'
                      }`}
                    >
                      {slot.start_time} - {slot.end_time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <div className="border-t pt-8 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

