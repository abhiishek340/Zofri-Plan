/**
 * AI Service
 * Handles AI-powered meeting scheduling and summary generation
 * Using Google's Gemini API
 */
import config from '../config';
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client exactly as in the example
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyBB1Mo47B9wufqSiLWtmlrQqGDttVodTrw";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generate a daily summary of upcoming meetings
 * @param {Array} events - List of calendar events
 * @returns {Promise<string>} - AI-generated summary
 */
export const getDailySummary = async (events) => {
  try {
    // If using mock data, don't even try to call the API
    if (config.useMockData) {
      console.log("Using mock AI summary (config.useMockData is true)");
      return generateFallbackSummary(events);
    }

    if (!events || events.length === 0) {
      return "You have no meetings scheduled for tomorrow.";
    }

    // Format events data for the AI prompt
    const eventsData = events.map(event => {
      return {
        title: event.summary,
        time: event.start.dateTime ? new Date(event.start.dateTime).toLocaleString() : "All day",
        attendees: event.attendees ? event.attendees.map(a => a.email).join(", ") : "None",
        location: event.location || "Not specified"
      };
    });

    // Create prompt for the AI
    const prompt = `
      Generate a concise daily summary of the following meetings. 
      Highlight any important meetings with key stakeholders or executives.
      Format with bullet points for each day.
      ${JSON.stringify(eventsData, null, 2)}
    `;

    console.log("Calling Gemini API with GoogleGenAI");
    
    try {
      // Use the exact pattern from the example
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return generateFallbackSummary(events);
    }
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    
    // Generate a fallback summary if the API call fails
    return generateFallbackSummary(events);
  }
};

/**
 * Generate a fallback summary when the API is unavailable
 * @param {Array} events - List of calendar events
 * @returns {string} - Generated summary
 */
const generateFallbackSummary = (events) => {
  // Create a basic summary from the events data
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  // Get only tomorrow's events
  const tomorrowEvents = events.filter(event => {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    return eventDate.getDate() === tomorrow.getDate() &&
           eventDate.getMonth() === tomorrow.getMonth() &&
           eventDate.getFullYear() === tomorrow.getFullYear();
  });
  
  if (tomorrowEvents.length === 0) {
    return "You have no meetings scheduled for tomorrow.";
  }
  
  let summary = `You have ${tomorrowEvents.length} meeting${tomorrowEvents.length > 1 ? 's' : ''} scheduled for tomorrow:\n\n`;
  
  tomorrowEvents.forEach(event => {
    const time = event.start.dateTime 
      ? new Date(event.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      : "All day";
    
    summary += `• ${time} - ${event.summary}`;
    
    if (event.attendees && event.attendees.length > 0) {
      summary += ` with ${event.attendees.length} attendee${event.attendees.length > 1 ? 's' : ''}`;
    }
    
    summary += '\n';
  });
  
  return summary;
};

/**
 * Suggest optimal meeting times based on participants and preferences
 * @param {Object} meetingDetails - Meeting details
 * @returns {Promise<Array>} - Array of suggested meeting times
 */
export const suggestMeetingTimes = async (meetingDetails) => {
  try {
    // If using mock data, don't even try to call the API
    if (config.useMockData) {
      console.log("Using mock AI suggestions (config.useMockData is true)");
      return generateFallbackTimeSuggestions(meetingDetails);
    }
    
    // Format meeting details for the prompt
    const prompt = `
      Please suggest 3-5 optimal meeting times in the next 7 days for a meeting with the following details:
      Title: ${meetingDetails.title}
      Description: ${meetingDetails.description || 'No description provided'}
      Duration: ${meetingDetails.duration} minutes
      Attendees: ${meetingDetails.attendees || 'No attendees specified'}
      
      Return the results ONLY as a JSON array with the following format (no other text):
      [
        {
          "start": "2025-04-20T09:00:00.000Z", // ISO string
          "end": "2025-04-20T09:30:00.000Z", // ISO string
          "score": 85, // 0-100 confidence score
          "reason": "string explanation"
        }
      ]
    `;

    console.log("Calling Gemini API for time suggestions");
    
    try {
      // Use the exact pattern from the example
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      
      // Extract JSON from the AI response
      const responseText = response.text;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                      responseText.match(/```\n([\s\S]*?)\n```/) ||
                      [null, responseText];
      
      const jsonText = jsonMatch[1] || '[]';
      
      try {
        const suggestedTimes = JSON.parse(jsonText);
        return suggestedTimes.map((time, index) => ({
          ...time,
          id: index + 1 // Add an ID for easier reference
        }));
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return generateFallbackTimeSuggestions(meetingDetails);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return generateFallbackTimeSuggestions(meetingDetails);
    }
  } catch (error) {
    console.error('Error suggesting meeting times:', error);
    return generateFallbackTimeSuggestions(meetingDetails);
  }
};

/**
 * Generate fallback time suggestions when the API is unavailable
 * @param {Object} meetingDetails - Meeting details
 * @returns {Array} - Array of suggested meeting times
 */
const generateFallbackTimeSuggestions = (meetingDetails) => {
  const now = new Date();
  const times = [];
  
  for (let i = 1; i <= 5; i++) {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + i);
    startDate.setHours(9 + Math.floor(Math.random() * 8), Math.random() > 0.5 ? 0 : 30, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (meetingDetails.duration || 30));
    
    times.push({
      id: i,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      score: Math.round(70 + Math.random() * 30), // Random score between 70-100
      reason: "Based on typical business hours and generated as a fallback option."
    });
  }
  
  return times;
};
