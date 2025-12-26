import emailjs from '@emailjs/browser'
import { supabase } from './supabase'

// Initialize EmailJS with your public key
// You'll need to set these in your .env file
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// Admin emails from environment variable (comma-separated)
// Alternative to fetching from database if RLS policies prevent it
const ADMIN_EMAILS_ENV = import.meta.env.VITE_ADMIN_EMAILS

// Initialize EmailJS (with error handling)
let emailjsInitialized = false
if (EMAILJS_PUBLIC_KEY) {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY)
    emailjsInitialized = true
  } catch (error) {
    console.warn('Failed to initialize EmailJS:', error)
  }
}

/**
 * Fetches all admin email addresses
 * Tries database first, falls back to environment variable
 */
export async function getAdminEmails() {
  // First, try to get from environment variable (comma-separated)
  if (ADMIN_EMAILS_ENV) {
    const emails = ADMIN_EMAILS_ENV.split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)
    if (emails.length > 0) {
      return emails
    }
  }

  // Fallback: try to fetch from database
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email')

    if (error) {
      console.warn('Could not fetch admin emails from database (RLS may be blocking):', error.message)
      return []
    }

    const emails = data?.map(admin => admin.email) || []
    if (emails.length > 0) {
      return emails
    }
  } catch (error) {
    console.warn('Error fetching admin emails from database:', error)
  }

  return []
}

/**
 * Sends email notification to admins when a new appointment is booked
 * @param {Object} appointmentData - The appointment data
 * @param {Object} doctorData - The doctor data
 */
export async function sendAdminNotification(appointmentData, doctorData) {
  // Check if EmailJS is configured
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !emailjsInitialized) {
    console.warn('⚠️ EmailJS is not configured. Email notifications will not be sent.')
    console.warn('To enable email notifications:')
    console.warn('1. Set up EmailJS account at https://www.emailjs.com/')
    console.warn('2. Add these to your .env file:')
    console.warn('   VITE_EMAILJS_SERVICE_ID=your_service_id')
    console.warn('   VITE_EMAILJS_TEMPLATE_ID=your_template_id')
    console.warn('   VITE_EMAILJS_PUBLIC_KEY=your_public_key')
    console.warn('   VITE_ADMIN_EMAILS=your-admin@email.com')
    console.warn('3. Restart your development server')
    return { success: false, error: 'EmailJS not configured' }
  }

  // Validate required data
  if (!appointmentData || !doctorData) {
    console.warn('Missing appointment or doctor data for email notification')
    return { success: false, error: 'Missing data' }
  }

  try {
    // Get all admin emails
    const adminEmails = await getAdminEmails()

    if (adminEmails.length === 0) {
      console.warn('⚠️ No admin emails found. Email notification skipped.')
      console.warn('To fix this:')
      console.warn('1. Add admin emails to your .env file: VITE_ADMIN_EMAILS=admin@example.com')
      console.warn('2. Or ensure admin_users table has email addresses and RLS allows reading them')
      return { success: false, error: 'No admin emails found' }
    }

    console.log(`📧 Sending email notification to ${adminEmails.length} admin(s):`, adminEmails)

    // Format the appointment date and time
    const appointmentDate = new Date(appointmentData.date || new Date()).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Prepare email template parameters
    const templateParams = {
      to_email: adminEmails.join(','), // EmailJS will handle multiple recipients
      admin_emails: adminEmails.join(', '),
      patient_name: `${appointmentData.patient_first_name} ${appointmentData.patient_last_name}`,
      patient_email: appointmentData.patient_email,
      patient_phone: appointmentData.patient_phone,
      doctor_name: `Dr. ${doctorData.first_name} ${doctorData.last_name}`,
      doctor_specialty: doctorData.specialty || 'N/A',
      appointment_date: appointmentDate,
      appointment_time: `${appointmentData.start_time} - ${appointmentData.end_time}`,
      education_level: appointmentData.education_level || 'Not specified',
      appointment_id: appointmentData.id || 'N/A',
      booking_date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Send email to all admins
    // Note: EmailJS free tier allows sending to one recipient at a time
    // For multiple recipients, we'll send separate emails
    const emailPromises = adminEmails.map(adminEmail => {
      return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          ...templateParams,
          to_email: adminEmail,
          to_name: 'Admin'
        }
      )
    })

    const results = await Promise.allSettled(emailPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    if (successful > 0) {
      console.log(`✅ Successfully sent ${successful} email notification(s) to admin(s)`)
    }
    
    if (failed > 0) {
      console.error(`❌ Failed to send ${failed} email notification(s)`)
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to send email to ${adminEmails[index]}:`, result.reason)
          if (result.reason?.text) {
            console.error('Error details:', result.reason.text)
          }
        }
      })
    }

    return {
      success: successful > 0,
      sent: successful,
      failed: failed,
      total: adminEmails.length
    }
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error: error.message }
  }
}

