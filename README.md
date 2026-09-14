# Text-to-Speech Application

A modern, responsive web application that converts text into natural-sounding speech across multiple languages and voices.

The application provides authentication, language and voice selection, speech generation, audio playback, audio download, speech history, account settings, and responsive light/dark themes.

Built with **React, Vite, Tailwind CSS, FastAPI, PostgreSQL, Supabase, and Puter.js**.

---

## Screenshots

### Dashboard

![Dashboard](frontend/screenshots/01-dashboard.png)

### Login

![Login](frontend/screenshots/02-login.png)

### Register

![Register](frontend/screenshots/03-register.png)

### Speech History

![Speech History](frontend/screenshots/04-history.png)

### Account & Settings

![Account & Settings](frontend/screenshots/05-account-settings.png)

### Generated Speech

![Generated Speech](frontend/screenshots/06-generated-speech.png)

### Supported Languages

![Supported Languages](frontend/screenshots/07-languages.png)

### Voice Selection

![Voice Selection](frontend/screenshots/08-voices.png)

### Dark Mode

![Dark Mode](frontend/screenshots/09-dark-mode.png)

---

## Features

- Text-to-speech conversion using Puter.js
- Multiple language support
- Multiple voice selection
- Dynamic voice loading
- Language-aware voice selection
- Text translation before speech generation when required
- Real-time character count
- Real-time word count
- Maximum text length validation
- Audio playback
- Audio download
- Speech history
- Delete individual history items
- Clear complete speech history
- User registration
- User login
- JWT-based authentication
- Protected API endpoints
- Password hashing with bcrypt
- Account management
- Appearance settings
- Light mode
- Dark mode
- Accent color customization
- Responsive desktop, tablet, and mobile interface
- User-specific speech history
- PostgreSQL database integration
- Supabase database hosting
- REST API architecture
- Backend health monitoring

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide React
- Puter.js

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- bcrypt

### Database

- PostgreSQL
- Supabase

### Speech & AI

- Puter.js Text-to-Speech
- Puter.js AI translation

---

## System Architecture

The application uses a modern frontend-backend architecture.

```text
┌─────────────────────────────────┐
│         React Frontend          │
│                                 │
│  Dashboard                      │
│  Authentication                 │
│  Language Selection              │
│  Voice Selection                 │
│  Audio Player                    │
│  Speech History                  │
│  Account & Settings              │
└───────────────┬─────────────────┘
                │
                │ REST API
                ▼
┌─────────────────────────────────┐
│          FastAPI Backend        │
│                                 │
│  Authentication                 │
│  JWT Validation                 │
│  User Management                │
│  History Management              │
│  Input Validation                │
│  Health Monitoring               │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│       PostgreSQL / Supabase     │
│                                 │
│  Users                          │
│  TTS History                    │
└─────────────────────────────────┘

User enters text
       │
       ▼
React Dashboard
       │
       ├── Select Language
       │
       └── Select Voice
       │
       ▼
Puter.js AI Translation
       │
       ▼
Selected Language Text
       │
       ▼
Puter.js Text-to-Speech
       │
       ▼
Generated Audio
       │
       ├──────────────► Play Audio
       │
       └──────────────► Download Audio
       │
       ▼
FastAPI History API
       │
       ▼
PostgreSQL / Supabase

User enters text
       │
       ▼
React Dashboard
       │
       ├── Select Language
       │
       └── Select Voice
       │
       ▼
Puter.js AI Translation
       │
       ▼
Selected Language Text
       │
       ▼
Puter.js Text-to-Speech
       │
       ▼
Generated Audio
       │
       ├──────────────► Play Audio
       │
       └──────────────► Download Audio
       │
       ▼
FastAPI History API
       │
       ▼
PostgreSQL / Supabase

┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Register / Login │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Dashboard     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Enter Text     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Select Language  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Select Voice   │
└────────┬─────────┘
         │
         ▼
┌────────────────────────┐
│ Puter.js AI Translation│
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Puter.js Text-to-Speech│
└───────────┬────────────┘
            │
            ▼
┌──────────────────┐
│ Generated Audio  │
└────────┬─────────┘
         │
         ├──────────────► Play
         │
         └──────────────► Download
         │
         ▼
┌──────────────────┐
│ Speech History   │
└──────────────────┘

git clone https://github.com/JADAVDHRUVIT21/Text-to-Speech.git
cd Text-to-Speech

cd backend

python -m venv venv

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt

APP_NAME=Text-to-Speech Application
DEBUG=True
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key

uvicorn app.main:app --reload

http://127.0.0.1:8000

cd frontend

npm install

VITE_API_URL=http://127.0.0.1:8000

npm run dev


API Documentation

The FastAPI backend provides APIs for authentication, user management, language information, voice information, speech history, and application health.
| Method | Endpoint                    | Description                                 |
| ------ | --------------------------- | ------------------------------------------- |
| POST   | `/api/auth/register`        | Register a new user                         |
| POST   | `/api/auth/login`           | Authenticate a user                         |
| GET    | `/api/auth/me`              | Get the current authenticated user          |
| GET    | `/api/voices`               | Get available voices                        |
| GET    | `/api/languages`            | Get supported languages                     |
| GET    | `/api/history`              | Get the authenticated user's speech history |
| POST   | `/api/history`              | Create a speech history record              |
| DELETE | `/api/history/{history_id}` | Delete a history item                       |
| DELETE | `/api/history`              | Clear the authenticated user's history      |
| GET    | `/api/health`               | Check backend and database health           |


Interactive API Documentation

FastAPI automatically provides interactive documentation.

Swagger UI
http://127.0.0.1:8000/docs
ReDoc
http://127.0.0.1:8000/redoc
Authentication

The application uses JWT-based authentication to protect user-specific resources.

Authentication Flow

User
 │
 ▼
Register / Login
 │
 ▼
FastAPI Authentication API
 │
 ▼
JWT Access Token
 │
 ▼
Frontend
 │
 ▼
Protected API Requests

The frontend stores the authenticated session information and sends the JWT access token when accessing protected backend endpoints.

Database

The application uses PostgreSQL for persistent data storage.

Supabase is used as the PostgreSQL database platform.

Users

The users table stores registered user information.

users
├── id
├── full_name
├── email
├── password_hash
└── created_at
TTS History

The TTS history table stores speech records associated with authenticated users.

tts_history
├── id
├── user_id
├── text
├── language
├── voice
└── created_at
History Management

Authenticated users can manage their speech history.

Available operations include:

View speech history
Create history records
Delete an individual history item
Clear all history
Keep history isolated between users

Each history record contains the text, selected language, selected voice, user ID, and creation time.

Puter.js Integration

Puter.js is responsible for frontend speech generation.

Text-to-Speech

The application uses Puter.js to:

Generate speech
Support multiple voices
Support multiple languages
Return an audio element
Play generated speech directly in the browser
AI Translation

When the selected speech language differs from the input text, Puter.js AI can translate the text before sending it to the speech engine.

Input Text
    │
    ▼
Selected Language
    │
    ▼
Puter.js AI Translation
    │
    ▼
Translated Text
    │
    ▼
Puter.js Text-to-Speech
    │
    ▼
Audio
Voice Management

The application provides dynamic voice selection.

Users can:

Select a language
View compatible voices
Select a preferred voice
Generate speech using the selected voice

The application also uses fallback voice handling when a particular provider or voice is unavailable for a selected language.

Error Handling

The application handles common errors such as:

Empty text
Text exceeding the maximum allowed length
Unsupported language
Invalid voice
Invalid authentication token
Unauthorized requests
Missing history item
Database errors
TTS service errors
Translation errors
Network/API failures

Errors are validated on the appropriate side of the application and displayed through the user interface where applicable.

Responsive Design

The application is designed for:

Desktop
Laptop
Tablet
Mobile

The interface adapts:

Navigation
Sidebar
Forms
Language selection
Voice selection
Audio controls
Speech history
Account settings

for different screen sizes.

Account & Settings

Users can manage application preferences through the Account page.

Available settings include:

Account information
Light appearance
Dark appearance
Accent color customization
Logout

Settings are persisted locally so the selected appearance and accent preferences remain available after refreshing the application.

Security

The application follows security-focused development practices:

JWT-based authentication
Password hashing with bcrypt
Protected authenticated endpoints
User-specific speech history
Backend-side input validation
Maximum text length validation
Environment variables for sensitive configuration
.env excluded from Git
Sensitive API keys are not exposed in the frontend
CORS configuration
User data isolation
Authentication checks on protected resources
No permanent backend storage of generated audio files
Basic abuse-prevention considerations
Environment Variables
Backend
APP_NAME=Text-to-Speech Application
DEBUG=True
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
Frontend
VITE_API_URL=http://127.0.0.1:8000

Never publish real credentials, database URLs, or private keys in the repository.

Complete Feature Workflow
Authentication
      │
      ▼
Dashboard
      │
      ▼
Enter Text
      │
      ▼
Select Language
      │
      ▼
Select Voice
      │
      ▼
Translate if Required
      │
      ▼
Puter.js Text-to-Speech
      │
      ▼
Generated Audio
      │
      ├── Play
      │
      └── Download
      │
      ▼
Speech History
      │
      ├── View
      ├── Delete
      └── Clear
Development
Start Backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
Start Frontend

Open another terminal:

cd frontend
npm run dev
Health Check

The backend provides a health endpoint:

GET /api/health

Example response:

{
  "status": "ok",
  "database": "connected",
  "tts": "puter.js"
}
Future Enhancements
Social login and OAuth authentication
Real-time OTP-based login
Progressive Web App support
Native Android application
Native iOS application
Advanced voice controls
Speech speed customization
Speech pitch customization
Favorite voices
Advanced history search
History filtering
Usage analytics
Speech statistics
Cloud-based audio storage
Improved rate limiting
Advanced abuse prevention
Project Overview

This Text-to-Speech Application was developed as an internship project to demonstrate the integration of a modern React frontend with a FastAPI backend, PostgreSQL database, JWT authentication, REST APIs, Puter.js text-to-speech, AI translation, and responsive UI design.

The application provides users with an easy-to-use interface for entering text, selecting languages and voices, generating natural-sounding speech, playing audio, downloading generated speech, and managing speech history.

The project demonstrates practical experience with:

Frontend development
Backend API development
REST API integration
Authentication
Database management
Third-party service integration
AI-powered translation
Text-to-speech technology
Responsive UI design
Application security
Full-stack application architecture
GitHub Repository

Source Code:

https://github.com/JADAVDHRUVIT21/Text-to-Speech

Author

Dhruvit Jadav

GitHub:

https://github.com/JADAVDHRUVIT21

License

This project was developed for educational and internship purposes.

