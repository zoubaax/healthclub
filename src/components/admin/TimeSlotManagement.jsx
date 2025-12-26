import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function TimeSlotManagement() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    doctor_id: '',
    date: '',
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor) {
      fetchTimeSlots()
    }
  }, [selectedDoctor])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
        .order('first_name')

      if (error) throw error
      setDoctors(data || [])
      if (data && data.length > 0 && !selectedDoctor) {
        setSelectedDoctor(data[0].id)
        setFormData({ ...formData, doctor_id: data[0].id })
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeSlots = async () => {
    if (!selectedDoctor) return

    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*, doctors(first_name, last_name)')
        .eq('doctor_id', selectedDoctor)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setTimeSlots(data || [])
    } catch (error) {
      console.error('Error fetching time slots:', error)
      setTimeSlots([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Create multiple slots if needed (for recurring schedules)
      const { error } = await supabase
        .from('time_slots')
        .insert([{
          doctor_id: formData.doctor_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_available: true
        }])

      if (error) throw error
      alert('Time slot added successfully!')
      resetForm()
      fetchTimeSlots()
    } catch (error) {
      console.error('Error adding time slot:', error)
      alert('Error adding time slot. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this time slot?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Time slot deleted successfully!')
      fetchTimeSlots()
    } catch (error) {
      console.error('Error deleting time slot:', error)
      alert('Error deleting time slot. Please try again.')
    }
  }

  const handleToggleAvailability = async (slot) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id)

      if (error) throw error
      fetchTimeSlots()
    } catch (error) {
      console.error('Error updating slot:', error)
      alert('Error updating time slot.')
    }
  }

  const resetForm = () => {
    setFormData({
      doctor_id: selectedDoctor,
      date: '',
      start_time: '',
      end_time: ''
    })
    setShowForm(false)
  }

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (doctors.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No doctors found. Please add doctors first.</p>
          <a href="/admin/doctors" className="text-blue-600 hover:underline">
            Go to Doctor Management
          </a>
        </div>
      </div>
    )
  }

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    const date = slot.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time Slot Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Time Slot'}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Doctor
        </label>
        <select
          value={selectedDoctor}
          onChange={(e) => {
            setSelectedDoctor(e.target.value)
            setFormData({ ...formData, doctor_id: e.target.value })
          }}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.first_name} {doctor.last_name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Time Slot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Time Slot
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {Object.keys(slotsByDate).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No time slots found. Add time slots for the selected doctor.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(slotsByDate)
              .sort((a, b) => new Date(a[0]) - new Date(b[0]))
              .map(([date, slots]) => (
                <div key={date} className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-md border-2 ${
                          slot.is_available
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {slot.is_available ? 'Available' : 'Booked'}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAvailability(slot)}
                            className={`text-xs px-2 py-1 rounded ${
                              slot.is_available
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {slot.is_available ? 'Mark Unavailable' : 'Mark Available'}
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

