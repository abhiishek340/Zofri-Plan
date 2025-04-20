/**
 * Calendar Service
 * Handles Google Calendar API integration for fetching events and creating meetings
 */
import config from '../config';

// Google API client configuration (Initialization moved to index.js)

/**
 * Create a calendar event and send invites to attendees
 * @param {Object} meetingDetails - Meeting details
 * @returns {Promise<Object>} - Created event
 */
export const createCalendarEvent = async (meetingDetails) => {
  try {
    // If using mock data or in development mode, don't try to call the API
    if (config.useMockData) {
      console.log("Creating mock calendar event:", meetingDetails);
      
      // Create a mock event
      const mockEvent = {
        id: 'mock-event-id-' + Date.now(),
        summary: meetingDetails.title,
        description: meetingDetails.description || '',
        start: {
          dateTime: new Date(meetingDetails.startTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(meetingDetails.endTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: meetingDetails.attendees.map(email => ({ email })),
        location: meetingDetails.location || 'Virtual Meeting',
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/'
      };
      
      // Add to local storage for persistence between page refreshes
      const storedEvents = JSON.parse(localStorage.getItem('mockCalendarEvents') || '[]');
      storedEvents.push(mockEvent);
      localStorage.setItem('mockCalendarEvents', JSON.stringify(storedEvents));
      
      return mockEvent;
    }

    // Ensure GAPI client is loaded and initialized
    if (!window.gapi?.client?.calendar) {
      console.error("Google Calendar API client not ready. Cannot create real event.");
      throw new Error("Google Calendar API client not ready");
    }
    
    console.log("Creating real Google Calendar event");
    
    // Get access token from localStorage
    const accessToken = localStorage.getItem('googleAccessToken');
    if (!accessToken) {
      console.error('No access token found. Please sign in again.');
      throw new Error('No access token found. Please sign in again.');
    }
    
    // Set auth token for API requests
    window.gapi.client.setToken({ access_token: accessToken });
    
    // Prepare event resource
    const event = {
      summary: meetingDetails.title,
      description: meetingDetails.description || '',
      start: {
        dateTime: new Date(meetingDetails.startTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(meetingDetails.endTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: meetingDetails.attendees.map(email => ({ email })),
      location: meetingDetails.location || 'Virtual Meeting',
      reminders: {
        useDefault: true
      }
    };
    
    console.log("Sending event to Google Calendar:", event);
    
    // Make API request
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendNotifications: true,
      sendUpdates: 'all' // Send email notifications to attendees
    });
    
    console.log("Event created successfully:", response.result);
    
    // Also save to local storage to ensure it appears in the UI immediately
    const storedEvents = JSON.parse(localStorage.getItem('mockCalendarEvents') || '[]');
    storedEvents.push({
      ...response.result,
      source: 'google' // Mark this as a Google Calendar event
    });
    localStorage.setItem('mockCalendarEvents', JSON.stringify(storedEvents));
    
    return response.result;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    
    // For development/demo purposes, fallback to creating a mock event if API fails
    if (!config.useMockData) {
      console.warn("Google Calendar API failed, falling back to mock data");
      
      // Create a mock event
      const mockEvent = {
        id: 'mock-event-id-' + Date.now(),
        summary: meetingDetails.title,
        description: meetingDetails.description || '',
        start: {
          dateTime: new Date(meetingDetails.startTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(meetingDetails.endTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: meetingDetails.attendees.map(email => ({ email })),
        location: meetingDetails.location || 'Virtual Meeting',
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/',
        source: 'mock_fallback' // Mark this as a fallback mock event
      };
      
      // Add to local storage for persistence between page refreshes
      const storedEvents = JSON.parse(localStorage.getItem('mockCalendarEvents') || '[]');
      storedEvents.push(mockEvent);
      localStorage.setItem('mockCalendarEvents', JSON.stringify(storedEvents));
      
      return mockEvent;
    }
    
    throw error;
  }
};

/**
 * Fetch calendar events from the user's primary calendar
 * @param {number} days - Number of days to fetch events for
 * @returns {Promise<Array>} - Array of calendar events
 */
export const fetchCalendarEvents = async (days = 7) => {
  try {
    // Check locally stored events first (for events created in this session)
    const storedEvents = JSON.parse(localStorage.getItem('mockCalendarEvents') || '[]');
    
    // If using mock data, return mock events
    if (config.useMockData) {
      console.log("Using mock calendar events");
      
      // Combine stored mock events with predefined mock events
      const mockEvents = getMockEvents();
      const combinedEvents = [...storedEvents, ...mockEvents];
      
      // Filter out duplicates
      const uniqueEvents = combinedEvents.filter((event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
      );
      
      // Sort by start time
      uniqueEvents.sort((a, b) => {
        const aTime = new Date(a.start.dateTime || a.start.date).getTime();
        const bTime = new Date(b.start.dateTime || b.start.date).getTime();
        return aTime - bTime;
      });
      
      return uniqueEvents;
    }

    // Ensure GAPI client is loaded and initialized
    if (!window.gapi?.client?.calendar) {
      console.error("Google Calendar API client not ready. Cannot fetch real events.");
      throw new Error("Google Calendar API client not ready");
    }
    
    console.log("Fetching real Google Calendar events");
    
    // Get access token from localStorage
    const accessToken = localStorage.getItem('googleAccessToken');
    if (!accessToken) {
      console.error('No access token found. Please sign in again.');
      throw new Error('No access token found. Please sign in again.');
    }
    
    // Set auth token for API requests
    window.gapi.client.setToken({ access_token: accessToken });
    
    // Calculate time range for query
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);
    
    // Make API request
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    console.log("Fetched Google Calendar events:", response.result.items);
    
    // Merge Google Calendar events with locally stored events
    const googleEvents = response.result.items || [];
    
    // Filter out any stored events that also appear in the Google Calendar response
    // (to avoid duplicates)
    const googleEventIds = new Set(googleEvents.map(event => event.id));
    const filteredStoredEvents = storedEvents.filter(event => 
      !googleEventIds.has(event.id) && event.source !== 'google'
    );
    
    // Combine Google events with any remaining local events
    const allEvents = [...googleEvents, ...filteredStoredEvents];
    
    // Update localStorage with the merged list
    localStorage.setItem('mockCalendarEvents', JSON.stringify(filteredStoredEvents));
    
    // Sort by start time
    allEvents.sort((a, b) => {
      const aTime = new Date(a.start.dateTime || a.start.date).getTime();
      const bTime = new Date(b.start.dateTime || b.start.date).getTime();
      return aTime - bTime;
    });
    
    return allEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    
    if (!config.useMockData) {
      console.warn("Google Calendar API failed, falling back to mock data");
      
      // For development/demo purposes, return mock data if API fails
      const mockEvents = getMockEvents();
      const storedEvents = JSON.parse(localStorage.getItem('mockCalendarEvents') || '[]');
      
      // Combine stored mock events with predefined mock events
      const combinedEvents = [...storedEvents, ...mockEvents];
      
      // Filter out duplicates
      const uniqueEvents = combinedEvents.filter((event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
      );
      
      // Sort by start time
      uniqueEvents.sort((a, b) => {
        const aTime = new Date(a.start.dateTime || a.start.date).getTime();
        const bTime = new Date(b.start.dateTime || b.start.date).getTime();
        return aTime - bTime;
      });
      
      return uniqueEvents;
    }
    
    throw error;
  }
};

/**
 * Check free/busy time for a list of users
 * @param {Array} emails - List of email addresses
 * @param {Date} startTime - Start time to check
 * @param {Date} endTime - End time to check
 * @returns {Promise<Object>} - Free/busy info for each user
 */
export const checkFreeBusy = async (emails, startTime, endTime) => {
  try {
    // Ensure GAPI client is loaded and initialized
    if (!window.gapi?.client?.calendar) {
      console.error("Google Calendar API client not ready. Cannot check free/busy.");
      throw new Error("Google Calendar API client not ready");
    }
    
    console.log("Checking free/busy status via Google Calendar API");
    
    // Get access token from localStorage (Note: gapi client might handle this internally too)
    const accessToken = localStorage.getItem('googleAccessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please sign in again.');
    }
    
    // Set auth token for API requests
    window.gapi.client.setToken({ access_token: accessToken });
    
    // Prepare request body
    const requestBody = {
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      items: emails.map(email => ({ id: email }))
    };
    
    // Make API request
    const response = await window.gapi.client.calendar.freebusy.query(requestBody);
    
    return response.result.calendars;
  } catch (error) {
    console.error('Error checking free/busy status:', error);
    console.log("Falling back to mock data due to API error");
    
    // For development/demo purposes, return mock data
    return getMockFreeBusy(emails);
  }
};

/**
 * Get mock calendar events for development/demo purposes
 * @returns {Array} - Array of mock events
 */
const getMockEvents = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfterTomorrow = new Date(now);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  return [
    {
      id: 'event-1',
      summary: 'Weekly Team Meeting',
      description: 'Discuss weekly progress and upcoming tasks',
      start: {
        dateTime: new Date(tomorrow.setHours(10, 0, 0)).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: new Date(tomorrow.setHours(11, 0, 0)).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      attendees: [
        { email: 'team@example.com' },
        { email: 'manager@example.com' }
      ],
      location: 'Google Meet'
    },
    {
      id: 'event-2',
      summary: 'Project Review',
      description: 'Review project progress with stakeholders',
      start: {
        dateTime: new Date(dayAfterTomorrow.setHours(14, 0, 0)).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: new Date(dayAfterTomorrow.setHours(15, 30, 0)).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      attendees: [
        { email: 'stakeholder1@example.com' },
        { email: 'stakeholder2@example.com' },
        { email: 'manager@example.com' }
      ],
      location: 'Conference Room A'
    },
    {
      id: 'event-3',
      summary: 'One-on-One with Manager',
      description: 'Weekly one-on-one meeting',
      start: {
        dateTime: new Date(tomorrow.setHours(15, 0, 0)).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: new Date(tomorrow.setHours(15, 30, 0)).toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      attendees: [
        { email: 'manager@example.com' }
      ],
      location: 'Manager\'s Office'
    }
  ];
};

/**
 * Get mock free/busy info for development/demo purposes
 * @param {Array} emails - List of email addresses
 * @returns {Object} - Free/busy info for each user
 */
const getMockFreeBusy = (emails) => {
  return emails.reduce((acc, email) => {
    acc[email] = {
      busy: [
        {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000).toISOString()
        }
      ]
    };
    return acc;
  }, {});
};
