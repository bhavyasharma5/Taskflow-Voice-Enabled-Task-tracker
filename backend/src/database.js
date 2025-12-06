const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'tasks.json');

// Initialize database
function initDatabase() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ tasks: [] }, null, 2));
  }
  console.log('✅ Database initialized');
}

// Read database
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { tasks: [] };
  }
}

// Write database
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Database operations
const db = {
  // Get all tasks
  getAllTasks() {
    return readDb().tasks;
  },

  // Get task by ID
  getTaskById(id) {
    const tasks = readDb().tasks;
    return tasks.find(task => task.id === id);
  },

  // Create task
  createTask(task) {
    const data = readDb();
    data.tasks.push(task);
    writeDb(data);
    return task;
  },

  // Update task
  updateTask(id, updates) {
    const data = readDb();
    const index = data.tasks.findIndex(task => task.id === id);
    if (index === -1) return null;
    
    data.tasks[index] = { ...data.tasks[index], ...updates };
    writeDb(data);
    return data.tasks[index];
  },

  // Delete task
  deleteTask(id) {
    const data = readDb();
    const index = data.tasks.findIndex(task => task.id === id);
    if (index === -1) return null;
    
    const [deleted] = data.tasks.splice(index, 1);
    writeDb(data);
    return deleted;
  },

  // Query tasks with filters
  queryTasks(filters = {}) {
    let tasks = readDb().tasks;

    if (filters.status) {
      tasks = tasks.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(search) ||
        (task.description && task.description.toLowerCase().includes(search))
      );
    }

    if (filters.dueDateFrom) {
      tasks = tasks.filter(task => task.dueDate && task.dueDate >= filters.dueDateFrom);
    }

    if (filters.dueDateTo) {
      tasks = tasks.filter(task => task.dueDate && task.dueDate <= filters.dueDateTo);
    }

    // Sort
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    tasks.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -sortOrder;
      if (a[sortBy] > b[sortBy]) return sortOrder;
      return 0;
    });

    return tasks;
  }
};

module.exports = { db, initDatabase };
