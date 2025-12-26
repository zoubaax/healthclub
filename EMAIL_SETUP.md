# Email Notification Setup Guide

This guide will help you set up email notifications so that admins receive an email when someone books an appointment with a doctor.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. Verify your email address

## Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Note down your **Service ID** (e.g., `service_xxxxx`)

## Step 3: Create Email Template

1. In EmailJS dashboard, go to **Email Templates**
2. Click **Create New Template**
3. Use the following template:

**Subject:**
```
New Appointment Booking - {{patient_name}}
```

**Content:**
```
Hello Admin,

A new appointment has been booked with one of your doctors.

Appointment Details:
- Patient Name: {{patient_name}}
- Patient Email: {{patient_email}}
- Patient Phone: {{patient_phone}}
- Education Level: {{education_level}}

Doctor Details:
- Doctor: {{doctor_name}}
- Specialty: {{doctor_specialty}}

Appointment Schedule:
- Date: {{appointment_date}}
- Time: {{appointment_time}}

Appointment ID: {{appointment_id}}
Booked on: {{booking_date}}

Please log in to the admin dashboard to view and manage this appointment.

Best regards,
Health Platform System
```

4. Note down your **Template ID** (e.g., `template_xxxxx`)

## Step 4: Get Your Public Key

1. In EmailJS dashboard, go to **Account** → **General**
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxx`)

## Step 5: Add Environment Variables

Add the following to your `.env` file in the `health` directory:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Admin email addresses (comma-separated)
# This is used if the database RLS policies prevent fetching admin emails
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Replace the values with your actual EmailJS credentials and admin email addresses.

**Note:** The system will try to fetch admin emails from the database first. If that fails (due to RLS policies), it will use the `VITE_ADMIN_EMAILS` environment variable instead.

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Book a test appointment
3. Check the admin email inbox for the notification

## Troubleshooting

### Emails not being sent?

1. **Check browser console** - Look for any error messages
2. **Verify environment variables** - Make sure all three EmailJS variables are set correctly
3. **Check EmailJS dashboard** - Go to **Logs** to see if emails were attempted
4. **Verify admin emails** - Make sure there are admin users in the `admin_users` table with valid email addresses

### EmailJS Free Tier Limits

- Free tier: 200 emails/month
- For production with high volume, consider upgrading to a paid plan

### Alternative: Using Supabase Edge Functions

If you prefer a backend solution, you can create a Supabase Edge Function to send emails using services like:
- Resend
- SendGrid
- AWS SES
- Nodemailer with SMTP

This would require creating an Edge Function and updating the booking form to call it.

