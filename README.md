# Smart Meeting Scheduler

## Introduction
Smart Meeting Scheduler is an AI-powered web application that streamlines meeting scheduling and management. It integrates with Google Calendar to provide a seamless experience for planning, scheduling, and managing meetings. The application leverages Google's Gemini AI to generate intelligent meeting summaries and suggest optimal meeting times based on participants' availability.

## Features
- **Google Authentication**: Secure sign-in with Google OAuth 2.0
- **Google Calendar Integration**: View, create, and manage calendar events directly
- **AI-Powered Meeting Summaries**: Daily summaries of your scheduled meetings
- **Intelligent Time Suggestions**: AI-recommended meeting slots based on participant availability
- **Mock Data Mode**: Development mode using sample data when API access is limited
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

## Technology Stack
- **Frontend**: React 18, Material UI v5
- **State Management**: React Context API
- **Authentication**: Firebase Authentication with Google SSO
- **Calendar Integration**: Google Calendar API v3
- **AI Integration**: Google Gemini API (gemini-2.0-flash model)
- **Animations**: Framer Motion, GSAP
- **Development**: Create React App, ESLint, Prettier

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- A Google Cloud Platform account with:
  - Google Calendar API enabled
  - OAuth 2.0 Client ID configured
  - Gemini API key
- Firebase project for authentication

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ZofriPlan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the project root with the following variables:**
   ```
   # Firebase configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

   # Google OAuth client ID and secret
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Gemini API key
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Configure Google Cloud OAuth:**
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Configure your OAuth consent screen
   - Create an OAuth 2.0 Client ID for a Web application
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - Your production domain (if deployed)
   - Add authorized redirect URIs for Firebase Auth (typically `https://your-firebase-domain.firebaseapp.com/__/auth/handler`)

5. **Start the development server**
   ```bash
   npm start
   ```

## Project Structure
```
/src
  /components        # Reusable UI components
  /contexts          # React contexts for state management
  /pages             # Page components
  /services          # API service integrations
    - aiService.js   # Gemini AI integration
    - calendarService.js # Google Calendar integration
    - userService.js # User profile management
  /utils             # Utility functions
  /styles            # Global styles and themes
  App.js             # Main application component
  index.js           # Entry point
  config.js          # Configuration settings
```

## Configuration Options

In `src/config.js`, you can modify the following settings:

- `useMockData`: Toggle between real API data and mock data for development
- Google API configuration (scopes, discovery documents)
- Other application settings

## Troubleshooting

### Google Calendar Integration Issues

If you encounter Google Calendar API errors:

1. Verify that your OAuth 2.0 Client ID is correctly configured in the Google Cloud Console
2. Ensure `http://localhost:3000` is added as an authorized JavaScript origin
3. Check that the correct scopes are being requested (`https://www.googleapis.com/auth/calendar`)
4. Try setting `useMockData: true` in `config.js` temporarily while troubleshooting
5. Remember that Google OAuth changes can take up to an hour to propagate

### Gemini API Issues

If you encounter errors with the Gemini API:

1. Verify your API key is correctly set in the `.env` file
2. Check your API usage quotas in the Google Cloud Console
3. Ensure your application has correct permissions to use the API

## Deployment

### Firebase Hosting

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase:
   ```bash
   firebase login
   firebase init
   ```

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Contributors
- [Abhishek Yadav Shiva Khatri Aayush Yadav Prerana Poudel ]

## License
This project is licensed under the MIT License - see the LICENSE file for details.
