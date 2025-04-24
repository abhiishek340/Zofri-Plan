/**
 * Email Service
 * Provides functionality for sending emails directly
 */

// Using server-side API endpoint for email sending via Gmail API
// The API endpoint is implemented with googleapis and nodemailer

/**
 * Send meeting invitation email to attendees
 * 
 * @param {Object} meetingDetails - Details of the meeting
 * @param {string} meetingDetails.title - Meeting title
 * @param {string} meetingDetails.description - Meeting description
 * @param {Array<string>} meetingDetails.attendees - Attendee email addresses
 * @param {string} meetingDetails.startTime - Meeting start time ISO string
 * @param {string} meetingDetails.endTime - Meeting end time ISO string
 * @param {string} meetingDetails.location - Meeting location
 * @param {Object} sender - Information about the meeting organizer
 * @param {string} sender.name - Name of the organizer
 * @param {string} sender.email - Email of the organizer
 * @returns {Promise<Array>} - Array of email sending results
 */
export const sendMeetingInvitations = async (meetingDetails, sender = { name: 'Meeting Organizer', email: 'notifications@zofriplan.com' }) => {
  // Log attempt to send emails
  console.log(`🔔 Sending meeting invitations for "${meetingDetails.title}" to ${meetingDetails.attendees.length} attendees:`, meetingDetails.attendees);
  
  try {
    // Set sender email if provided in the request
    if (sender.email === 'notifications@zofriplan.com' && meetingDetails.senderEmail) {
      sender.email = meetingDetails.senderEmail;
    }
    
    // Use the working email-test/send endpoint that has been confirmed to work
    const apiUrl = 'http://localhost:5000/email-test/send';
    console.log(`Sending email request to: ${apiUrl}`);

    // Process one email at a time using the working endpoint
    const results = [];
    
    for (const recipient of meetingDetails.attendees) {
      // Format meeting time for email display
      const formattedStartTime = new Date(meetingDetails.startTime).toLocaleString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Create message content specific for meeting invitation
      const message = `
You have been invited to a meeting: ${meetingDetails.title}

Date and Time: ${formattedStartTime}
Duration: ${calculateDuration(meetingDetails.startTime, meetingDetails.endTime)}
Location: ${meetingDetails.location || 'Not specified'}

${meetingDetails.description ? `Description: ${meetingDetails.description}` : ''}

This is an automated invitation from ZofriPlan Meeting Scheduler.
      `;
      
      // Prepare form data - similar to what the email-test form would submit
      const formData = new URLSearchParams();
      formData.append('recipient', recipient);
      formData.append('subject', `Meeting Invitation: ${meetingDetails.title}`);
      formData.append('message', message);
      formData.append('senderName', sender.name);
      
      try {
        // Send individual email using the working endpoint
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
        
        // Simply check if successful - detailed response is HTML
        if (response.ok) {
          results.push({
            status: 'success',
            recipient: recipient,
            messageId: `meeting-${Date.now()}`
          });
        } else {
          console.error(`Failed to send email to ${recipient}`);
          results.push({
            status: 'error',
            recipient: recipient,
            error: 'Failed to send email'
          });
        }
      } catch (error) {
        console.error(`Error sending to ${recipient}:`, error);
        results.push({
          status: 'error',
          recipient: recipient,
          error: error.message
        });
      }
    }
    
    console.log('Email sending results:', results);
    return results;
    
  } catch (error) {
    console.error('Error sending meeting invitations:', error);
    
    // In development, fall back to mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Falling back to mock email results in development mode');
      return meetingDetails.attendees.map(recipientEmail => ({
        status: 'success',
        recipient: recipientEmail,
        mock: true
      }));
    }
    
    throw error;
  }
};

/**
 * Calculate duration between two time strings
 * @param {string} start - Start time ISO string
 * @param {string} end - End time ISO string
 * @returns {string} - Formatted duration string
 */
function calculateDuration(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate - startDate;
  const durationMinutes = Math.round(durationMs / 60000);
  
  if (durationMinutes < 60) {
    return `${durationMinutes} minutes`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
}

/**
 * Generate a downloadable iCalendar (.ics) file for a meeting
 * This can be useful for email clients that don't automatically parse calendar events
 * 
 * @param {Object} meetingDetails - Details of the meeting
 * @returns {string} - iCalendar formatted string
 */
export const generateICalendarFile = (meetingDetails) => {
  const { title, description, startTime, endTime, location, attendees } = meetingDetails;
  
  // Format dates for iCalendar format (YYYYMMDDTHHMMSSZ)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  const startDate = formatDate(startTime);
  const endDate = formatDate(endTime);
  const now = formatDate(new Date());
  
  // Generate a unique ID for the event
  const eventId = `meeting-${Date.now()}@zofriplan.com`;
  
  // Create iCalendar content
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZofriPlan//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${eventId}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : '',
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    'STATUS:CONFIRMED',
    `ORGANIZER;CN=Meeting Organizer:mailto:notifications@zofriplan.com`,
  ];
  
  // Add attendees
  attendees.forEach(attendee => {
    icsContent.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${attendee}`);
  });
  
  // Close the event and calendar
  icsContent = [...icsContent, 'END:VEVENT', 'END:VCALENDAR'];
  
  // Filter out any empty lines and join with CRLF as required by iCalendar spec
  return icsContent.filter(line => line).join('\r\n');
}; 