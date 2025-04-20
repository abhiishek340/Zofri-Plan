# 🚀 **ZofriPlan**

> **AI‑powered scheduling that finds the perfect time so you don’t have to.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)  
_Seamlessly integrates Google Calendar & Google Gemini to book, summarise and manage meetings in seconds._

---

## ✨ Key Features

- **Google SSO & OAuth 2.0** — one‑click sign‑in with enterprise‑grade security.  
- **Calendar Sync** — view, create and edit events directly in Google Calendar.  
- **Gemini AI Summaries** — instant natural‑language recaps of the day’s meetings.  
- **Smart Time Suggestions** — AI proposes the best slots based on every attendee’s availability.  
- **Responsive UI** — built with React 18 & MUI v5; feels at home on desktop _and_ mobile.  
- **Mock‑Data Mode** — keep coding when APIs are rate‑limited or offline.

---

## 📸 App Walk‑through

### 1&nbsp;/&nbsp;Authentication & Dashboard
<table>
<tr>
  <td align="center" width="50%">
    <img src="Screenshot/1. Login.png" alt="Login Screen" width="95%"/><br/>
    <i>Google SSO login</i>
  </td>
  <td align="center" width="50%">
    <img src="Screenshot/2. Auth.png" alt="OAuth Consent" width="95%"/><br/>
    <i>OAuth consent flow</i>
  </td>
</tr>
<tr>
  <td align="center" colspan="2">
    <img src="Screenshot/3. Dashboard.png" alt="Dashboard" width="90%"/><br/>
    <i>Personal dashboard with AI meeting summary</i>
  </td>
</tr>
</table>

### 2&nbsp;/&nbsp;Scheduling a Meeting
<table>
<tr>
  <td align="center" width="50%">
    <img src="Screenshot/4. Meeting Schedule.png" alt="Schedule Meeting" width="95%"/><br/>
    <i>Create a new meeting</i>
  </td>
  <td align="center" width="50%">
    <img src="Screenshot/5. AI Suggestion.png" alt="AI Suggestions" width="95%"/><br/>
    <i>Gemini‑powered time suggestions</i>
  </td>
</tr>
<tr>
  <td align="center" width="50%">
    <img src="Screenshot/6. Confirm Schedule.png" alt="Confirm" width="95%"/><br/>
    <i>Confirmation dialog</i>
  </td>
  <td align="center" width="50%">
    <img src="Screenshot/7. Meeting Scheduled.png" alt="Scheduled" width="95%"/><br/>
    <i>Success toast</i>
  </td>
</tr>
<tr>
  <td align="center" colspan="2">
    <img src="Screenshot/8. Booked.png" alt="Booked" width="90%"/><br/>
    <i>Event added to calendar</i>
  </td>
</tr>
</table>

### 3&nbsp;/&nbsp;Profile & Notifications
<table>
<tr>
  <td align="center" width="50%">
    <img src="Screenshot/9. Profile.png" alt="Profile" width="95%"/><br/>
    <i>User profile page</i>
  </td>
  <td align="center" width="50%">
    <img src="Screenshot/Email confirmation.jpeg" alt="Email Confirmation" width="95%"/><br/>
    <i>Email confirmation for every booking</i>
  </td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, Material‑UI v5, Framer Motion, GSAP |
| **State**    | React Context API |
| **Auth**     | Firebase Authentication (Google SSO) |
| **APIs**     | Google Calendar API v3, Google Gemini (gemini‑2.0‑flash) |
| **Tooling**  | Vite + ESLint + Prettier |

---

## 🚀 Quick Start

```bash
# 1. Clone
$ git clone https://github.com/your‑org/smart‑meeting‑scheduler.git
$ cd smart‑meeting‑scheduler

# 2. Install deps
$ npm install

# 3. Environment variables
$ cp .env.example .env       # then fill in your keys

# 4. Run dev server
$ npm run dev
```

<details>
<summary>Environment variables (.env)</summary>

```
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_CLIENT_SECRET=...

# Gemini
VITE_GEMINI_API_KEY=...
```
</details>

---

## 📁 Project Structure

```
src/
 ├─ assets/            # static images & logos
 ├─ components/        # reusable UI widgets
 ├─ contexts/          # React providers (auth, calendar, ai)
 ├─ pages/             # route components
 ├─ services/          # external API wrappers
 │   ├─ aiService.ts
 │   ├─ calendarService.ts
 │   └─ userService.ts
 ├─ styles/            # global MUI theme + SCSS
 ├─ utils/             # helpers & guards
 ├─ App.tsx            # top‑level router
 └─ main.tsx           # Vite entry
```

---

## 🐛 Troubleshooting

<details>
<summary>Google Calendar errors</summary>

1. Double‑check that your OAuth client has **Calendar API** enabled.  
2. Ensure `http://localhost:3000` is an authorised origin _and_ redirect URI.  
3. Verify the requested scope `https://www.googleapis.com/auth/calendar` matches the console.
</details>

<details>
<summary>Gemini API errors</summary>

- Confirm the API key in `.env` and check usage quotas in Google Cloud.
</details>

---

## 🚢 Deployment

| Target | Steps |
|--------|-------|
| **Firebase Hosting** | `npm run build && firebase deploy` |
| **Vercel / Netlify** | Import repo → set env vars → auto‑deploy |

---

## 🤝 Contributors

<table>
<tr>
  <td align="center"><a href="https://github.com/abhiishekyadav"><img src="https://avatars.githubusercontent.com/abhiishekyadav" width="80"/><br/><sub>Abhishek Yadav</sub></a></td>
  <td align="center"><a href="#"><img src="https://avatars.githubusercontent.com/u/000000?v=4" width="80"/><br/><sub>Shiva Khatri</sub></a></td>
  <td align="center"><a href="#"><img src="https://avatars.githubusercontent.com/u/000000?v=4" width="80"/><br/><sub>Aayush Yadav</sub></a></td>
  <td align="center"><a href="#"><img src="https://avatars.githubusercontent.com/u/000000?v=4" width="80"/><br/><sub>Prerana Poudel</sub></a></td>
</tr>
</table>

---

## 📜 License

Released under the [MIT](LICENSE) license.

