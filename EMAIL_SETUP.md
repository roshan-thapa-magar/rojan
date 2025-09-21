# Email Setup for Barber Shop App

## Overview
This app now includes automatic email notifications that send appointment details to all barbers when a new appointment is created.

## Setup Instructions

### 1. Create Environment Variables
Create a `.env.local` file in your project root with the following variables:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail App Password Setup
For Gmail, you need to use an App Password, not your regular password:

1. **Enable 2-Factor Authentication** on your Google account
2. Go to **Google Account settings** > **Security** > **App passwords**
3. Generate a new app password for "Mail"
4. Use that password in your `.env.local` file

### 3. How It Works
- When a new appointment is created, the system automatically:
  - Finds all active barbers in the database
  - Sends an email notification to each barber
  - Includes appointment details (client info, service, date/time)

### 4. Email Content
Each barber receives an email with:
- Client name, email, and phone
- Service requested
- Appointment date and time
- Assigned barber (if specified)

### 5. Testing
To test the email functionality:
1. Make sure your environment variables are set
2. Create a new appointment through the app
3. Check your barber email accounts for notifications

### 6. Troubleshooting
- Check console logs for email errors
- Verify environment variables are correct
- Ensure Gmail app password is properly generated
- Check that barbers exist in the database with role="barber"

## Security Notes
- Never commit your `.env.local` file to version control
- Use app passwords instead of regular passwords
- The email system is designed to fail gracefully if emails can't be sent
