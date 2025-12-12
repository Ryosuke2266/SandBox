# Task Manager - Portable Topic-Based Task Management Tool

A portable, self-contained task management application designed to capture topics from conversations and break them down into actionable tasks. Perfect for tracking discussion outcomes, meeting action items, and organizing work by conversation context.

## Features

### Topic → Tasks Hierarchy
- **Topics** represent conversation themes (meetings, calls, discussions)
- **Tasks** are action items nested under their parent topic
- Always know which conversation a task came from

### Key Capabilities
- ✅ Create and manage topics with context
- ✅ Inline task creation while describing topics
- ✅ Multiple view modes (Topics view & All Tasks view)
- ✅ Search and filter functionality
- ✅ Due date tracking with overdue indicators
- ✅ Priority levels (High, Medium, Low)
- ✅ Mobile-responsive design
- ✅ Fully portable - no external database required
- ✅ Fast and lightweight

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Navigate to the task-manager folder**
   ```bash
   cd task-manager
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### One-Command Setup and Run

From the task-manager directory:
```bash
npm run install-all && npm start
```

## Portability

This application is designed to be completely portable:

1. **Single Folder**: Everything is contained in the `task-manager` folder
2. **File-Based Database**: Uses JSON file storage (stored in `backend/tasks.json`)
3. **No External Dependencies**: All data stored locally in plain JSON
4. **Easy Transfer**: Just copy the entire folder to another laptop
5. **Human-Readable**: Your data is stored in a readable JSON format

### Moving to Another Computer

1. Copy the entire `task-manager` folder to your new laptop
2. Ensure Node.js is installed on the new laptop
3. Run `npm run install-all` to reinstall dependencies
4. Run `npm start` to launch the app
5. Your data is preserved in `backend/tasks.json`

## Project Structure

```
task-manager/
├── backend/                 # Node.js + Express API
│   ├── database.js         # JSON database operations
│   ├── server.js           # Express server and API endpoints
│   ├── package.json        # Backend dependencies
│   └── tasks.json         # JSON database (created on first run)
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TopicList.jsx
│   │   │   ├── TopicDetail.jsx
│   │   │   ├── TopicForm.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── AllTasksView.jsx
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
├── package.json           # Root package with convenience scripts
└── README.md             # This file
```

## Usage Guide

### Creating a Topic

1. Click the **"+ New Topic"** button
2. Enter topic details:
   - **Title** (required): e.g., "Q4 Marketing Strategy Meeting"
   - **Description**: What was discussed
   - **Due Date**: Overall deadline
   - **Context**: Meeting reference, people involved
   - **Tags**: Comma-separated keywords
3. Optionally add tasks inline as you write
4. Click **"Create Topic"**

### Adding Tasks to a Topic

**Method 1: Inline (during topic creation)**
- While creating a topic, use the "Quick Add Tasks" section
- Type task title and press Enter or click "Add"

**Method 2: From Topic Detail**
- Click on a topic to view details
- Click **"+ Add Task"**
- Fill in task details and save

### Managing Tasks

**From Topic View:**
- Click on a topic to see all its tasks
- Check/uncheck boxes to mark complete
- Edit or delete individual tasks

**From All Tasks View:**
- Toggle to "All Tasks" view
- See every task across all topics
- Filter by status (All, Pending, Completed, Overdue)
- Click topic name to jump to parent topic

### Search and Filtering

- **Search bar**: Search topics by title, description, or tags
- **Sort options**: Latest, Due Date, Name
- **View toggle**: Switch between Topics and All Tasks
- **Status filters**: All, Pending, Completed, Overdue

## API Endpoints

### Topics
- `GET /api/topics` - Get all topics with task counts
- `GET /api/topics/:id` - Get single topic with tasks
- `POST /api/topics` - Create new topic
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Archive topic

### Tasks
- `GET /api/tasks` - Get all tasks across topics
- `GET /api/topics/:topicId/tasks` - Get tasks for specific topic
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete task

### Search
- `GET /api/search?q=query&sort=field` - Search and filter topics

## Technology Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express
- **Database**: JSON file storage (no external dependencies)
- **Styling**: Pure CSS with CSS Variables

## Data Backup

Your data is stored in `backend/tasks.json`. To backup:

```bash
cp backend/tasks.json backend/tasks-backup-$(date +%Y%m%d).json
```

To restore:
```bash
cp backend/tasks-backup-YYYYMMDD.json backend/tasks.json
```

## Development

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

```bash
cd frontend
npm run build
```

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are in use:
- Frontend: Edit `frontend/vite.config.js` and change the port
- Backend: Edit `backend/server.js` and change PORT constant

### Database Locked
If you get a database locked error:
- Close all instances of the app
- Restart the backend server

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT License - Free to use and modify

## Support

For issues or questions, please check the documentation or contact the development team.
