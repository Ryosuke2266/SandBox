const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.json');

// Initialize database structure
let db = {
  topics: [],
  tasks: [],
  nextTopicId: 1,
  nextTaskId: 1
};

// Load existing data or create new file
function loadDatabase() {
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
  } else {
    saveDatabase();
  }
  console.log('Database loaded successfully');
}

// Save database to file
function saveDatabase() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

// Initialize on load
loadDatabase();

// Database operations
const database = {
  // Topics
  getAllTopics() {
    return db.topics
      .filter(t => t.status === 'active')
      .map(topic => {
        const topicTasks = db.tasks.filter(task => task.topic_id === topic.id);
        return {
          ...topic,
          total_tasks: topicTasks.length,
          completed_tasks: topicTasks.filter(t => t.status === 'completed').length
        };
      });
  },

  getTopicById(id) {
    return db.topics.find(t => t.id === parseInt(id));
  },

  createTopic(data) {
    const topic = {
      id: db.nextTopicId++,
      ...data,
      status: 'active',
      created_date: new Date().toISOString()
    };
    db.topics.push(topic);
    saveDatabase();
    return topic;
  },

  updateTopic(id, data) {
    const index = db.topics.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      db.topics[index] = { ...db.topics[index], ...data };
      saveDatabase();
      return db.topics[index];
    }
    return null;
  },

  deleteTopic(id) {
    const index = db.topics.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      db.topics[index].status = 'archived';
      saveDatabase();
      return true;
    }
    return false;
  },

  // Tasks
  getAllTasks() {
    return db.tasks.map(task => {
      const topic = db.topics.find(t => t.id === task.topic_id);
      return {
        ...task,
        topic_title: topic?.title || 'Unknown',
        topic_due_date: topic?.due_date
      };
    }).filter(task => {
      const topic = db.topics.find(t => t.id === task.topic_id);
      return topic && topic.status === 'active';
    });
  },

  getTasksByTopicId(topicId) {
    return db.tasks.filter(t => t.topic_id === parseInt(topicId));
  },

  createTask(data) {
    const task = {
      id: db.nextTaskId++,
      ...data,
      status: 'pending',
      created_date: new Date().toISOString(),
      completed_date: null
    };
    db.tasks.push(task);
    saveDatabase();
    return task;
  },

  updateTask(id, data) {
    const index = db.tasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      db.tasks[index] = { ...db.tasks[index], ...data };
      saveDatabase();
      return db.tasks[index];
    }
    return null;
  },

  deleteTask(id) {
    const index = db.tasks.findIndex(t => t.id === parseInt(id));
    if (index !== -1) {
      db.tasks.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  },

  getTaskById(id) {
    return db.tasks.find(t => t.id === parseInt(id));
  },

  // Search
  searchTopics(query, sort) {
    let topics = this.getAllTopics();

    // Filter by query
    if (query) {
      const q = query.toLowerCase();
      topics = topics.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'due_date') {
      topics.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    } else if (sort === 'name') {
      topics.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      topics.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return topics;
  }
};

module.exports = database;
