# Online Mental Health Session Booking Platform

A web-based platform for booking mental health listening sessions and psychological consultations, built with React, Vite, Tailwind CSS, and Supabase.

## Features

### User Side
- Browse available doctors with photos, descriptions, and specialties
- Select a doctor and choose an available date and time
- Book sessions online with personal information form
- View doctor profiles

### Admin Side
- Add, edit, and delete doctors/psychologists
- Upload and manage doctors' profile pictures (via URL)
- Write and update professional descriptions and specialties
- Manage available time slots for each doctor
- View and manage all booked appointments
- Update appointment status (pending, confirmed, cancelled)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy:
   - Project URL
   - Anon/public key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create all necessary tables, indexes, and policies

### 4. Set Up Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable Email authentication
3. Create an admin user:
   - Go to Authentication > Users
   - Click "Add user" and create a user with email/password
   - Then in the SQL Editor, run:
   ```sql
   INSERT INTO admin_users (email) VALUES ('your-admin-email@example.com');
   ```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
health/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorManagement.jsx
│   │   │   ├── TimeSlotManagement.jsx
│   │   │   └── AppointmentsView.jsx
│   │   └── user/
│   │       ├── UserLayout.jsx
│   │       ├── DoctorListing.jsx
│   │       └── BookingForm.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   └── main.jsx
├── supabase-schema.sql
└── package.json
```

## Usage

### For Users

1. Visit the homepage to see available doctors
2. Click "Book Session" on a doctor's card
3. Select a date and available time slot
4. Fill in your personal information
5. Submit to book your appointment

### For Admins

1. Navigate to `/admin/login`
2. Log in with your admin credentials
3. Use the dashboard to:
   - Manage doctors (add, edit, delete)
   - Add time slots for doctors
   - View and manage appointments
   - Update appointment statuses

## Database Schema

The platform uses the following main tables:

- **doctors**: Stores doctor information
- **time_slots**: Stores available time slots for each doctor
- **appointments**: Stores booked appointments
- **admin_users**: Stores admin user emails for authentication

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Public read access for doctors and time slots
- Only admins can modify doctors and time slots
- Anyone can create appointments, but only admins can view all appointments
- For production, consider adding policies for users to view their own appointments

## Image Upload

Currently, profile pictures are added via URL. For production, you should:

1. Set up Supabase Storage
2. Create a bucket for doctor images
3. Implement file upload functionality in the admin panel
4. Update the image upload handler in `DoctorManagement.jsx`

## Future Enhancements

- Email notifications for appointments
- User accounts and appointment history
- Calendar view for time slots
- Recurring time slot creation
- File upload for profile pictures
- Appointment reminders
- Video call integration

## License

This project is open source and available for use.
