import { create } from 'zustand';
import { api } from '../services/api';

const useTaskStore = create((set, get) => ({
  // State
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    search: ''
  },
  view: 'kanban', // 'kanban' or 'list'

  // Actions
  setView: (view) => set({ view }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  clearFilters: () => set({
    filters: { status: '', priority: '', search: '' }
  }),

  // Fetch all tasks
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const response = await api.getTasks(filters);
      set({ tasks: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createTask(taskData);
      set((state) => ({
        tasks: [response.data, ...state.tasks],
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update a task
  updateTask: async (id, taskData) => {
    set({ error: null });
    try {
      const response = await api.updateTask(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? response.data : task
        )
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Update task status (for drag and drop)
  updateTaskStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    }));

    try {
      await api.updateTaskStatus(id, status);
    } catch (error) {
      // Revert on error
      get().fetchTasks();
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (id) => {
    set({ error: null });
    try {
      await api.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Parse voice transcript
  parseTranscript: async (transcript) => {
    try {
      const response = await api.parseTranscript(transcript);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get tasks by status (for kanban view)
  getTasksByStatus: (status) => {
    const { tasks, filters } = get();
    let filtered = tasks.filter((task) => task.status === status);

    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search) ||
          (task.description && task.description.toLowerCase().includes(search))
      );
    }

    return filtered;
  },

  // Get filtered tasks (for list view)
  getFilteredTasks: () => {
    const { tasks, filters } = get();
    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search) ||
          (task.description && task.description.toLowerCase().includes(search))
      );
    }

    return filtered;
  }
}));

export default useTaskStore;

