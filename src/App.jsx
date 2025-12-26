import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import DoctorManagement from './components/admin/DoctorManagement'
import TimeSlotManagement from './components/admin/TimeSlotManagement'
import AppointmentsView from './components/admin/AppointmentsView'
import AdminLogin from './components/admin/AdminLogin'
import UserLayout from './components/user/UserLayout'
import DoctorListing from './components/user/DoctorListing'
import BookingForm from './components/user/BookingForm'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.warn('Supabase not configured - skipping admin check')
      setIsAdmin(false)
      setLoading(false)
      return
    }

    checkAdminSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await checkAdminStatus(session.user?.email)
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const checkAdminSession = async () => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Session check timeout, proceeding without admin check')
      setIsAdmin(false)
      setLoading(false)
    }, 5000) // 5 second timeout

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setIsAdmin(false)
        clearTimeout(timeout)
        setLoading(false)
        return
      }

      if (session && session.user?.email) {
        await checkAdminStatus(session.user.email)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking admin session:', error)
      setIsAdmin(false)
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const checkAdminStatus = async (email) => {
    if (!email) {
      setIsAdmin(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no row found
      
      // If no rows found, user is not admin (this is expected for non-admin users)
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        return
      }
      
      setIsAdmin(!!data)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <Router basename="/healthclub">
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<DoctorListing />} />
          <Route path="book/:doctorId" element={<BookingForm />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout isAdmin={isAdmin} setIsAdmin={setIsAdmin} />}>
          <Route index element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} />
          <Route path="doctors" element={isAdmin ? <DoctorManagement /> : <Navigate to="/admin/login" replace />} />
          <Route path="time-slots" element={isAdmin ? <TimeSlotManagement /> : <Navigate to="/admin/login" replace />} />
          <Route path="appointments" element={isAdmin ? <AppointmentsView /> : <Navigate to="/admin/login" replace />} />
          <Route path="login" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
