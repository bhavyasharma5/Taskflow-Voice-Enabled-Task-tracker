# TaskFlow - Voice-Enabled Task Tracker

A modern task tracking application inspired by Linear, featuring a unique voice input capability that allows users to create tasks by speaking naturally. The application intelligently parses spoken input to extract task details such as title, description, due date, priority, and status.

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Voice%20Enabled-blue?style=for-the-badge&logo=microphone)

## 🎥 Demo Video

[Watch the Demo Video](#) <!-- Replace with actual Loom/Google Drive link -->

## ✨ Features

### Core Features
- **📋 Task Management (CRUD)**
  - Create tasks manually or via voice
  - View tasks in Kanban board or List view
  - Edit task details inline
  - Delete tasks with confirmation

- **🎯 Kanban Board View**
  - Three columns: To Do, In Progress, Done
  - Drag-and-drop to move tasks between columns
  - Visual task cards with priority indicators

- **📝 List View**
  - Sortable table layout
  - Quick access to all task details
  - Click to edit any task

- **🔍 Filter & Search**
  - Filter by status (To Do, In Progress, Done)
  - Filter by priority (Low, Medium, High, Urgent)
  - Real-time search by title or description

### Voice Input Feature (Key Differentiator)
- **🎤 Speech-to-Text Capture**
  - Click microphone button to start/stop recording
  - Uses Web Speech API for browser-native speech recognition
  - Real-time transcript display

- **🤖 Intelligent Parsing**
  - AI-powered parsing using OpenAI GPT-3.5 (with fallback)
  - Rule-based parsing with chrono-node as fallback
  - Extracts:
    - **Title**: Main task description
    - **Due Date**: Handles relative dates ("tomorrow", "next Monday", "in 3 days")
    - **Priority**: Keywords like "urgent", "high priority", "critical"
    - **Status**: Defaults to "To Do"

- **✅ Review Before Save**
  - Preview extracted fields before saving
  - Edit any incorrectly parsed fields
  - See raw transcript alongside parsed data

## 🛠️ Tech Stack

### Frontend
- **React** (v19) - UI Framework
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **@dnd-kit** - Drag and drop functionality
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **Axios** - HTTP client
- **react-hot-toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **better-sqlite3** - SQLite database
- **OpenAI API** - AI-powered voice parsing
- **chrono-node** - Natural language date parsing (fallback)
- **uuid** - Unique ID generation

### Voice Input
- **Web Speech API** - Browser-native speech recognition (no third-party service needed)
- Works in Chrome, Edge, Safari

## 📦 Project Setup

### Prerequisites
- Node.js v18+ (recommended: v20)
- npm v9+
- Modern browser (Chrome, Edge, or Safari recommended for voice features)
- OpenAI API key (optional - enables AI-powered parsing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Aerchain\ Assignment
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**

   Backend (`backend/.env`):
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key (optional)
   ```

   Frontend (`frontend/.env`):
   ```bash
   cp .env.example .env
   # Default values work for local development
   ```

### Running Locally

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:5001

2. **Start the Frontend Dev Server**
   ```bash
   cd frontend
   npm run dev
   ```
   App runs on http://localhost:5173

### Environment Variables

#### Backend
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5001 |
| `OPENAI_API_KEY` | OpenAI API key for AI parsing | No | - |

#### Frontend
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | http://localhost:5001/api |

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Endpoints

#### Tasks

##### GET /tasks
Get all tasks with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (todo, in_progress, done) |
| priority | string | Filter by priority (low, medium, high, urgent) |
| search | string | Search in title and description |
| sortBy | string | Sort field (createdAt, updatedAt, dueDate) |
| sortOrder | string | Sort direction (asc, desc) |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "title": "Review pull request",
      "description": "Check the auth module changes",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-01-15T18:00:00.000Z",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

##### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Optional description",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2024-01-15T18:00:00.000Z"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... }
}
```

##### PUT /tasks/:id
Update an existing task.

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "in_progress"
}
```

##### PATCH /tasks/:id/status
Update only the task status (for drag-and-drop).

**Request Body:**
```json
{
  "status": "done"
}
```

##### DELETE /tasks/:id
Delete a task.

**Example Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Voice Parsing

##### POST /tasks/parse
Parse voice transcript to extract task fields.

**Request Body:**
```json
{
  "transcript": "Create a high priority task to review the pull request by tomorrow evening"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "Create a high priority task to review the pull request by tomorrow evening",
    "parsed": {
      "title": "Review the pull request",
      "description": "",
      "priority": "high",
      "dueDate": "2024-01-11T18:00:00.000Z",
      "status": "todo"
    }
  }
}
```

### Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Validation failed |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## 🎨 Design Decisions & Assumptions

### Architecture Decisions

1. **SQLite Database**
   - Chosen for simplicity and zero-configuration
   - Perfect for single-user application
   - File-based, no external database server needed
   - Easy to reset by deleting the `tasks.db` file

2. **Web Speech API for Voice Input**
   - Browser-native solution (no API costs)
   - Works offline once loaded
   - Good accuracy for English
   - Fallback: Users in unsupported browsers see an error message

3. **Dual Parsing Strategy**
   - **Primary**: OpenAI GPT-3.5 for intelligent parsing
   - **Fallback**: Rule-based parsing with chrono-node
   - Ensures app works even without OpenAI API key

4. **Zustand for State Management**
   - Lightweight alternative to Redux
   - Simple API with hooks
   - No boilerplate required
   - Sufficient for this single-user application

5. **@dnd-kit for Drag and Drop**
   - Modern, accessible drag-and-drop library
   - Better performance than react-beautiful-dnd
   - Supports keyboard navigation

### Assumptions

1. **Single User Experience**
   - No authentication required
   - All tasks belong to one user
   - Data persists in local SQLite database

2. **Voice Input**
   - Users have a working microphone
   - Browser supports Web Speech API
   - English language input only
   - Quiet environment for better accuracy

3. **Date Parsing**
   - Default time is 6:00 PM if not specified
   - Relative dates calculated from current date
   - ISO format used for storage

4. **Priority Levels**
   - Four levels: Low, Medium, High, Urgent
   - Medium is the default if not specified

5. **Task Status**
   - Three states: To Do, In Progress, Done
   - "To Do" is default for new tasks

### Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| SQLite | Simple, no setup | Not suitable for multi-user |
| Web Speech API | Free, no API key | Browser support varies |
| Rule-based fallback | Works offline | Less accurate than AI |
| Single-page app | Fast navigation | Initial load time |

## 🤖 AI Tools Usage

### Tools Used
- **GitHub Copilot** - Code autocompletion and suggestions
- **ChatGPT** - Reference for library documentation and debugging help

### What AI Helped With

1. **Documentation & Research**
   - Understanding Web Speech API browser compatibility
   - Learning @dnd-kit library patterns
   - chrono-node usage examples for date parsing

2. **Boilerplate & Repetitive Code**
   - Initial Express server setup
   - Basic CRUD endpoint structure
   - CSS variable definitions for theming

3. **Debugging Assistance**
   - Troubleshooting CORS configuration
   - Fixing drag-and-drop edge cases
   - Resolving React state update issues

### What I Built Myself

1. **Core Application Logic**
   - Voice parsing algorithm with priority/date extraction
   - Task state management and data flow
   - Kanban board drag-and-drop implementation

2. **UI/UX Design**
   - Dark theme color palette inspired by Linear
   - Component architecture and layout decisions
   - User flow for voice input → preview → save

3. **API Design**
   - RESTful endpoint structure
   - Input validation and error handling
   - Optimistic updates for better UX

### What I Learned
- Web Speech API is surprisingly powerful but has browser limitations
- Designing good OpenAI prompts requires iteration for consistent JSON output
- chrono-node handles most natural language date expressions out of the box
- Optimistic updates significantly improve perceived performance in drag-and-drop

## 🚧 Known Limitations

1. **Voice Input Browser Support**
   - Only works in Chrome, Edge, and Safari
   - Firefox does not support Web Speech API

2. **Language Support**
   - Voice input optimized for English only
   - Date parsing works best with English date formats

3. **Mobile Experience**
   - Responsive design is basic
   - Voice input may need manual permission on mobile

4. **Offline Support**
   - No offline capability
   - Requires backend connection

## 🔮 Future Improvements

If I had more time, I would add:

1. **Enhanced Voice Features**
   - Multiple language support
   - Voice commands for navigation
   - Audio feedback/confirmation

2. **Better UX**
   - Undo/redo functionality
   - Keyboard shortcuts
   - Task templates

3. **Data Management**
   - Export/import tasks (CSV, JSON)
   - Task archiving
   - Search history

4. **Performance**
   - Virtual scrolling for large task lists
   - Service worker for offline support
   - Image attachments with compression

## 📄 License

This project was created as part of the Aerchain SDE Assignment.

---

Built with ❤️ using React, Express, and AI

