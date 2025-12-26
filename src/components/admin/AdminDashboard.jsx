import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    doctors: 0,
    appointments: 0,
    pendingAppointments: 0,
    availableSlots: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [doctorsRes, appointmentsRes, slotsRes] = await Promise.all([
        supabase.from('doctors').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id, status', { count: 'exact' }),
        supabase.from('time_slots').select('id', { count: 'exact', head: true }).eq('is_available', true)
      ])

      const doctorsCount = doctorsRes.count || 0
      const appointments = appointmentsRes.data || []
      const appointmentsCount = appointments.length
      const pendingCount = appointments.filter(a => a.status === 'pending').length
      const slotsCount = slotsRes.count || 0

      setStats({
        doctors: doctorsCount,
        appointments: appointmentsCount,
        pendingAppointments: pendingCount,
        availableSlots: slotsCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.doctors}</div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-2">Total Doctors</div>
          <Link to="/admin/doctors" className="text-indigo-600 text-sm hover:text-indigo-700 font-medium">
            Manage →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.appointments}</div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-2">Total Appointments</div>
          <Link to="/admin/appointments" className="text-purple-600 text-sm hover:text-purple-700 font-medium">
            View All →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingAppointments}</div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-2">Pending Appointments</div>
          <Link to="/admin/appointments" className="text-amber-600 text-sm hover:text-amber-700 font-medium">
            Review →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.availableSlots}</div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-2">Available Time Slots</div>
          <Link to="/admin/time-slots" className="text-green-600 text-sm hover:text-green-700 font-medium">
            Manage →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/doctors"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            Add New Doctor
          </Link>
          <Link
            to="/admin/time-slots"
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            Add Time Slots
          </Link>
          <Link
            to="/admin/appointments"
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            View Appointments
          </Link>
        </div>
      </div>
    </div>
  )
}

