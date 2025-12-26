# Quick Email Setup Checklist

Follow these steps to enable email notifications:

## ✅ Step 1: Create EmailJS Account
- [ ] Go to [emailjs.com](https://www.emailjs.com/) and sign up
- [ ] Verify your email address

## ✅ Step 2: Set Up Email Service
- [ ] In EmailJS dashboard → **Email Services** → **Add New Service**
- [ ] Choose your email provider (Gmail, Outlook, etc.)
- [ ] Connect your email account
- [ ] Copy your **Service ID** (e.g., `service_xxxxx`)

## ✅ Step 3: Create Email Template
- [ ] Go to **Email Templates** → **Create New Template**
- [ ] Copy the template from `EMAIL_SETUP.md` (lines 24-56)
- [ ] Paste into EmailJS template editor
- [ ] Copy your **Template ID** (e.g., `template_xxxxx`)

## ✅ Step 4: Get Public Key
- [ ] Go to **Account** → **General**
- [ ] Copy your **Public Key**

## ✅ Step 5: Create .env File
- [ ] Create `.env` file in the `health` directory
- [ ] Add these lines (replace with your actual values):

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_ADMIN_EMAILS=your-admin@email.com
```

## ✅ Step 6: Restart Server
- [ ] Stop your development server (Ctrl+C)
- [ ] Start again: `npm run dev`

## ✅ Step 7: Test
- [ ] Open browser console (F12)
- [ ] Book a test appointment
- [ ] Look for: `✅ Successfully sent email notification(s)`
- [ ] Check your email inbox (and spam folder)

## 🎉 Done!

If you see `✅ Successfully sent email notification(s)` in the console, emails are working!

**Having issues?** See `EMAIL_TROUBLESHOOTING.md` for detailed help.

