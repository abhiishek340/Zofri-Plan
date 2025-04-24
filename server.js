const express = require('express');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gmail API OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

async function createTransporter() {
  try {
    const { token: accessToken } = await oauth2Client.getAccessToken();
    console.log('Successfully obtained access token');
    
    // Create the transporter with explicit host and port settings
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Using port 587 (TLS) instead of 465 (SSL)
      secure: false, // false for TLS - as a boolean not string
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_EMAIL,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken,
      },
      // Enable detailed connection debugging
      debug: true,
      logger: true,
      // Set timeout higher for slower connections
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 30000, // 30 seconds
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Try alternative method using app password if OAuth fails
    if (process.env.GMAIL_APP_PASSWORD) {
      console.log('Attempting alternative authentication with app password');
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        },
        debug: true,
        logger: true
      });
    }
    
    throw error;
  }
}

// Serve a simple HTML page for testing email
app.get('/email-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Email Testing Page</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1976d2; }
        form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        label { display: block; margin-top: 10px; font-weight: bold; }
        input, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; }
        button { margin-top: 15px; background: #1976d2; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1565c0; }
      </style>
    </head>
    <body>
      <h1>Email Testing Page</h1>
      <p>Use this form to test sending emails through your server.</p>
      <form action="/email-test/send" method="POST">
        <label for="recipient">Recipient Email:</label>
        <input type="email" id="recipient" name="recipient" required />

        <label for="subject">Subject:</label>
        <input type="text" id="subject" name="subject" value="Test Email" required />

        <label for="message">Message:</label>
        <textarea id="message" name="message" rows="5" required>This is a test email from ZofriPlan.</textarea>

        <label for="senderName">Sender Name:</label>
        <input type="text" id="senderName" name="senderName" value="Test Sender" required />

        <label for="senderEmail">Sender Email:</label>
        <input type="email" id="senderEmail" name="senderEmail" value="${process.env.GMAIL_EMAIL}" required />

        <button type="submit">Send Test Email</button>
      </form>
    </body>
    </html>
  `);
});

// Handle the email test form submission
app.post('/email-test/send', async (req, res) => {
  console.log("Received email test request");
  try {
    const { recipient, subject, message, senderName, senderEmail } = req.body;
    if (!recipient || !subject || !message || !senderName || !senderEmail) {
      return res.status(400).send(`<h1>400 Bad Request</h1><p>All fields are required.</p>`);
    }

    const fromEmail = senderEmail || process.env.GMAIL_EMAIL;
    console.log(`Creating transporter for ${fromEmail}`);
    
    // Check connectivity before creating the transporter
    const dns = require('dns').promises;
    try {
      console.log('Testing DNS lookup for smtp.gmail.com');
      const addresses = await dns.lookup('smtp.gmail.com');
      console.log(`SMTP server resolved to: ${JSON.stringify(addresses)}`);
    } catch (dnsError) {
      console.error('DNS lookup failed:', dnsError);
      // Continue anyway, just for diagnostic purposes
    }
    
    const transporter = await createTransporter();
    console.log('Transporter created successfully');

    const info = await transporter.sendMail({
      from: `"${senderName}" <${fromEmail}>`,
      to: recipient,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1976d2;">Test Email</h2>
          <p>${message}</p>
          <div style="margin-top: 30px; color: #757575; font-size: 12px;">
            This is a test email from ZofriPlan Meeting Scheduler.
          </div>
        </div>
      `
    });

    console.log('Email sent successfully:', info.messageId);
    return res.status(200).send(`
      <h1>Email Sent Successfully!</h1>
      <p><strong>To:</strong> ${recipient}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message ID:</strong> ${info.messageId}</p>
    `);

  } catch (error) {
    console.error('Error sending test email:', error);
    // More detailed error logging
    if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. This could be due to:');
      console.error('1. Network connectivity issues');
      console.error('2. Firewall blocking outgoing connections');
      console.error('3. SMTP server not responding');
    }
    
    return res.status(500).send(`
      <h1>Failed to Send Email</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Error Code:</strong> ${error.code || 'N/A'}</p>
    `);
  }
});

// Meeting invitation endpoint
function generateICalendarContent(meetingDetails) {
  const { title, description, startTime, endTime, location, organizer, attendees } = meetingDetails;
  const formatDate = d => new Date(d).toISOString().replace(/-|:|\.\d+/g, '');
  const now = formatDate(new Date());
  const eventId = `meeting-${Date.now()}@zofriplan.com`;

  let lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZofriPlan//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${eventId}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : '',
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    `ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}`,
  ];

  attendees.forEach(a => {
    lines.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${a}`);
  });

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.filter(l => l).join('\r\n');
}

// Add a simplified version of the email sending API
// This will be used by the Schedule Meeting functionality
app.post('/api/send-email', async (req, res) => {
  console.log('Received request to /api/send-email');
  
  try {
    const { 
      meetingDetails,
      sender = { name: 'Meeting Organizer', email: process.env.GMAIL_EMAIL }
    } = req.body;

    console.log('Meeting details:', meetingDetails);
    console.log('Sender:', sender);

    const { title, description, attendees, startTime, endTime, location } = meetingDetails;

    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({ error: 'At least one attendee is required' });
    }

    // Create transport - use the same transporter as the email-test/send endpoint
    const transporter = await createTransporter();
    
    // Format meeting time for email display
    const formattedStartTime = new Date(startTime).toLocaleString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate iCalendar content for the meeting
    const icsContent = generateICalendarContent({
      title,
      description,
      startTime,
      endTime,
      location,
      organizer: sender,
      attendees
    });

    // Send emails to all attendees using the simplified approach
    const emailPromises = attendees.map(async (recipientEmail) => {
      // Email content - similar to the test email but with meeting specific details
      const mailOptions = {
        from: `"${sender.name}" <${process.env.GMAIL_EMAIL || sender.email}>`,
        to: recipientEmail,
        subject: `Meeting Invitation: ${title}`,
        text: `
You have been invited to a meeting: ${title}

Date and Time: ${formattedStartTime}
Location: ${location || 'Not specified'}

${description ? `Description: ${description}` : ''}

This is an automated invitation from ZofriPlan Meeting Scheduler.
`,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #1976d2;">Meeting Invitation</h2>
  <h3>${title}</h3>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
    <div style="margin-bottom: 10px;">
      <strong>Date and Time:</strong> ${formattedStartTime}
    </div>
    <div style="margin-bottom: 10px;">
      <strong>Location:</strong> ${location || 'Not specified'}
    </div>
    ${description ? `
    <div style="margin-top: 15px;">
      <strong>Description:</strong><br>
      ${description.replace(/\n/g, '<br>')}
    </div>` : ''}
  </div>
  
  <div style="margin-top: 30px; color: #757575; font-size: 12px;">
    This is an automated invitation from ZofriPlan Meeting Scheduler.
  </div>
</div>
`,
        // Attach iCalendar file
        alternatives: [
          {
            contentType: 'text/calendar; method=REQUEST',
            content: Buffer.from(icsContent),
          }
        ],
        icalEvent: {
          filename: 'invite.ics',
          method: 'REQUEST',
          content: icsContent
        }
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        return {
          status: 'success',
          recipient: recipientEmail,
          messageId: info.messageId
        };
      } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        return {
          status: 'error',
          recipient: recipientEmail,
          error: error.message
        };
      }
    });

    const results = await Promise.all(emailPromises);
    
    // Check if any emails failed
    const failedEmails = results.filter(result => result.status === 'error');
    
    if (failedEmails.length > 0) {
      // Some emails failed
      return res.status(207).json({
        message: `${results.length - failedEmails.length} of ${results.length} emails sent successfully`,
        results
      });
    }
    
    // All emails sent successfully
    return res.status(200).json({
      message: 'All meeting invitations sent successfully',
      results
    });
    
  } catch (error) {
    console.error('Error sending meeting invitations:', error);
    return res.status(500).json({ 
      error: 'Failed to send meeting invitations',
      details: error.message 
    });
  }
});

// Simple health check
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is working properly!' });
});

// Static asset serving for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// Add a route to test simple SMTP connectivity
app.get('/smtp-test', (req, res) => {
  const net = require('net');
  const testPorts = [25, 465, 587];
  const results = {};
  
  Promise.all(testPorts.map(port => {
    return new Promise(resolve => {
      const socket = net.createConnection({
        host: 'smtp.gmail.com',
        port: port,
        timeout: 5000
      });
      
      socket.on('connect', () => {
        results[port] = 'Connected successfully';
        socket.end();
        resolve();
      });
      
      socket.on('timeout', () => {
        results[port] = 'Connection timed out';
        socket.destroy();
        resolve();
      });
      
      socket.on('error', (err) => {
        results[port] = `Error: ${err.message}`;
        resolve();
      });
    });
  })).then(() => {
    res.json({
      message: 'SMTP Connection Test Results',
      results
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email test interface available at: http://localhost:${PORT}/email-test`);
  console.log(`SMTP test interface available at: http://localhost:${PORT}/smtp-test`);
});