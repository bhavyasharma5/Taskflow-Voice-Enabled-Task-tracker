import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Get all tasks with optional filters
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    return axiosInstance.get(url);
  },

  // Get a single task by ID
  getTask: async (id) => {
    return axiosInstance.get(`/tasks/${id}`);
  },

  // Create a new task
  createTask: async (taskData) => {
    return axiosInstance.post('/tasks', taskData);
  },

  // Update a task
  updateTask: async (id, taskData) => {
    return axiosInstance.put(`/tasks/${id}`, taskData);
  },

  // Update task status
  updateTaskStatus: async (id, status) => {
    return axiosInstance.patch(`/tasks/${id}/status`, { status });
  },

  // Delete a task
  deleteTask: async (id) => {
    return axiosInstance.delete(`/tasks/${id}`);
  },

  // Parse voice transcript
  parseTranscript: async (transcript) => {
    return axiosInstance.post('/tasks/parse', { transcript });
  },

  // Health check
  healthCheck: async () => {
    return axiosInstance.get('/health');
  }
};

