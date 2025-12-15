const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple authentication middleware
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your-secret-token-change-this';

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (token === `Bearer ${AUTH_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Task Manager API is running' });
});

// Apply authentication to all other API routes
app.use('/api', authenticate);

// ==================== TOPIC ENDPOINTS ====================

// Get all topics with task counts
app.get('/api/topics', (req, res) => {
  try {
    const topics = db.getAllTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single topic with all tasks
app.get('/api/topics/:id', (req, res) => {
  try {
    const topic = db.getTopicById(req.params.id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const tasks = db.getTasksByTopicId(req.params.id);

    res.json({ ...topic, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new topic
app.post('/api/topics', (req, res) => {
  try {
    const { title, description, due_date, conversation_context, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTopic = db.createTopic({
      title,
      description,
      due_date,
      conversation_context,
      tags
    });

    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update topic
app.put('/api/topics/:id', (req, res) => {
  try {
    const { title, description, due_date, conversation_context, tags, status } = req.body;

    const updatedTopic = db.updateTopic(req.params.id, {
      title,
      description,
      due_date,
      conversation_context,
      tags,
      status
    });

    if (!updatedTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json(updatedTopic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete topic (soft delete by setting status to 'archived')
app.delete('/api/topics/:id', (req, res) => {
  try {
    const success = db.deleteTopic(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json({ message: 'Topic archived successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK ENDPOINTS ====================

// Get all tasks across all topics
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific topic
app.get('/api/topics/:topicId/tasks', (req, res) => {
  try {
    const tasks = db.getTasksByTopicId(req.params.topicId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { topic_id, title, description, priority, due_date } = req.body;

    if (!title || !topic_id) {
      return res.status(400).json({ error: 'Title and topic_id are required' });
    }

    const newTask = db.createTask({
      topic_id,
      title,
      description,
      priority: priority || 'Medium',
      due_date
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, priority, due_date, status } = req.body;

    let updateData = {
      title,
      description,
      priority,
      due_date,
      status
    };

    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
    } else if (status === 'pending') {
      updateData.completed_date = null;
    }

    const updatedTask = db.updateTask(req.params.id, updateData);

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle task status
app.patch('/api/tasks/:id/toggle', (req, res) => {
  try {
    const task = db.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completed_date = newStatus === 'completed' ? new Date().toISOString() : null;

    const updatedTask = db.updateTask(req.params.id, {
      status: newStatus,
      completed_date
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const success = db.deleteTask(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SEARCH AND FILTER ====================

// Search topics and tasks
app.get('/api/search', (req, res) => {
  try {
    const { q, sort } = req.query;
    const topics = db.searchTopics(q, sort);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend in production (optional - use only if deploying as monorepo)
// For separate backend/frontend deployments, comment this out
// if (process.env.NODE_ENV === 'production') {
//   const path = require('path');
//   app.use(express.static(path.join(__dirname, '../frontend/dist')));
//
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
//   });
// }

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Task Manager API running on port ${PORT}`);
  console.log(`📊 Database: ${__dirname}/tasks.json`);
});
