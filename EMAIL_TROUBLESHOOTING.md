# Email Notification Troubleshooting

If bookings are working but you're not receiving email notifications, follow these steps:

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (Press F12)
2. Go to the **Console** tab
3. Book a test appointment
4. Look for messages starting with 📧, ✅, ⚠️, or ❌

### Common Console Messages:

- **⚠️ EmailJS is not configured** → You need to set up EmailJS (see Step 2)
- **⚠️ No admin emails found** → You need to configure admin emails (see Step 3)
- **✅ Successfully sent email** → Email was sent, check spam folder
- **❌ Failed to send email** → Check EmailJS configuration

## Step 2: Set Up EmailJS (If Not Done)

If you see "EmailJS is not configured", you need to:

1. **Create EmailJS Account**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Sign up for a free account
   - Verify your email

2. **Create Email Service**
   - In EmailJS dashboard → **Email Services**
   - Click **Add New Service**
   - Choose your email provider (Gmail, Outlook, etc.)
   - Connect your email account
   - Note your **Service ID** (e.g., `service_xxxxx`)

3. **Create Email Template**
   - Go to **Email Templates** → **Create New Template**
   - Use the template from `EMAIL_SETUP.md`
   - Note your **Template ID** (e.g., `template_xxxxx`)

4. **Get Public Key**
   - Go to **Account** → **General**
   - Find your **Public Key**

5. **Add to .env File**
   Create or update `.env` file in the `health` directory:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   VITE_ADMIN_EMAILS=your-admin@email.com
   ```

6. **Restart Development Server**
   - Stop your server (Ctrl+C)
   - Start again: `npm run dev`

## Step 3: Configure Admin Emails

If you see "No admin emails found", you need to set admin email addresses.

### Option 1: Environment Variable (Recommended)

Add to your `.env` file:
```env
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Option 2: Database

Make sure you have admin users in the `admin_users` table:
```sql
INSERT INTO admin_users (email) VALUES ('your-admin@email.com');
```

**Note:** If RLS policies prevent reading admin emails from the database, use the environment variable method instead.

## Step 4: Verify EmailJS Configuration

Check that all environment variables are loaded:

1. In browser console, type:
   ```javascript
   console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID)
   console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
   console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'Set' : 'Not set')
   console.log('Admin Emails:', import.meta.env.VITE_ADMIN_EMAILS)
   ```

2. If any show as `undefined`, your `.env` file is not being loaded:
   - Make sure `.env` is in the `health` directory (not parent directory)
   - Make sure variable names start with `VITE_`
   - Restart your development server after changing `.env`

## Step 5: Check EmailJS Dashboard

1. Go to your EmailJS dashboard
2. Click on **Logs** in the sidebar
3. Look for recent email attempts
4. Check if emails were sent or if there are errors

## Step 6: Check Spam Folder

Sometimes emails end up in spam. Check:
- Spam/Junk folder
- Promotions tab (Gmail)
- All Mail folder

## Step 7: Test Email Template

1. In EmailJS dashboard → **Email Templates**
2. Click on your template
3. Click **Test** button
4. Enter a test email address
5. Click **Send Test Email**
6. Check if you receive the test email

## Common Issues

### Issue: "EmailJS not configured"
**Solution:** Follow Step 2 above to set up EmailJS

### Issue: "No admin emails found"
**Solution:** Follow Step 3 above to configure admin emails

### Issue: "Failed to send email" in console
**Possible causes:**
- Invalid Service ID, Template ID, or Public Key
- Email service not properly connected in EmailJS
- Template variables don't match
- EmailJS free tier limit reached (200 emails/month)

**Solution:**
1. Verify all IDs and keys in `.env` file
2. Check EmailJS dashboard → Logs for error details
3. Verify email service is connected
4. Check template variables match the code

### Issue: Email sent but not received
**Possible causes:**
- Email in spam folder
- Wrong email address
- Email provider blocking emails

**Solution:**
1. Check spam folder
2. Verify admin email address is correct
3. Check EmailJS logs to see where email was sent
4. Try a different email address

### Issue: Environment variables not loading
**Solution:**
1. Make sure `.env` file is in `health` directory
2. Variable names must start with `VITE_`
3. Restart development server after changing `.env`
4. Clear browser cache and reload

## Quick Test

To quickly test if email is working:

1. Open browser console (F12)
2. Book a test appointment
3. Look for these messages:
   - `📧 Attempting to send email notification...`
   - `📧 Sending email notification to X admin(s)`
   - `✅ Successfully sent X email notification(s)`

If you see all three, the email was sent successfully. Check your inbox (and spam folder).

## Still Not Working?

1. **Check EmailJS Logs** - Go to EmailJS dashboard → Logs
2. **Check Browser Console** - Look for error messages
3. **Verify .env File** - Make sure all variables are set correctly
4. **Test EmailJS Template** - Use the Test button in EmailJS dashboard
5. **Check Email Service Connection** - Make sure your email service is connected in EmailJS

## Need Help?

If you're still having issues:
1. Copy the exact error message from browser console
2. Check EmailJS dashboard → Logs for details
3. Verify all configuration steps were completed
4. Make sure you restarted the development server after changing `.env`

