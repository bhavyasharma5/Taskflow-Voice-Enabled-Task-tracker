const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { parseVoiceTranscript } = require('../services/voiceParser');

const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function validateTask(task, isUpdate = false) {
  const errors = [];

  if (!isUpdate && (!task.title || task.title.trim() === '')) {
    errors.push('Title is required');
  }

  if (task.status && !VALID_STATUSES.includes(task.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (task.priority && !VALID_PRIORITIES.includes(task.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (task.dueDate && isNaN(Date.parse(task.dueDate))) {
    errors.push('Due date must be a valid date');
  }

  return errors;
}

router.get('/', (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', dueDateFrom, dueDateTo } = req.query;
    
    const filters = {};
    if (status && VALID_STATUSES.includes(status)) filters.status = status;
    if (priority && VALID_PRIORITIES.includes(priority)) filters.priority = priority;
    if (search) filters.search = search;
    if (dueDateFrom) filters.dueDateFrom = dueDateFrom;
    if (dueDateTo) filters.dueDateTo = dueDateTo;
    filters.sortBy = sortBy;
    filters.sortOrder = sortOrder;

    const tasks = db.queryTasks(filters);

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium', dueDate = null } = req.body;

    const errors = validateTask(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    const now = new Date().toISOString();
    const task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      createdAt: now,
      updatedAt: now
    };

    db.createTask(task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const existingTask = db.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const errors = validateTask(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    const now = new Date().toISOString();
    const updates = { updatedAt: now };

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = db.updateTask(id, updates);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = db.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    db.deleteTask(id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: existingTask
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
});

router.post('/parse', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required'
      });
    }

    const parsedTask = await parseVoiceTranscript(transcript.trim());

    res.json({
      success: true,
      data: {
        transcript: transcript.trim(),
        parsed: parsedTask
      }
    });
  } catch (error) {
    console.error('Error parsing transcript:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse transcript',
      message: error.message
    });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const existingTask = db.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const now = new Date().toISOString();
    const updatedTask = db.updateTask(id, { status, updatedAt: now });

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task status',
      message: error.message
    });
  }
});

module.exports = router;
