import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { LayoutGrid, List, Search, Plus, Mic } from 'lucide-react';
import useTaskStore from './store/taskStore';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import TaskModal from './components/TaskModal';
import VoiceModal from './components/VoiceModal';
import FilterBar from './components/FilterBar';
import './index.css';

function App() {
  const { view, setView, filters, setFilters, fetchTasks, loading } = useTaskStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearch = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleVoiceTask = () => {
    setIsVoiceModalOpen(true);
  };

  const handleVoiceComplete = (taskData) => {
    setEditingTask(taskData);
    setIsVoiceModalOpen(false);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="app">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3000,
        }}
      />

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <LayoutGrid size={18} color="white" />
            </div>
            <span>TaskFlow</span>
          </div>
        </div>

        <div className="header-center">
          <div className="view-toggle">
            <button
              className={view === 'kanban' ? 'active' : ''}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid size={16} />
              Board
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              <List size={16} />
              List
            </button>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>

          <button
            className="btn btn-secondary btn-icon"
            onClick={handleVoiceTask}
            title="Create task with voice"
          >
            <Mic size={18} />
          </button>

          <button className="btn btn-primary" onClick={handleAddTask}>
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar />

      {/* Main Content */}
      <main className="main-content">
        {view === 'kanban' ? (
          <KanbanBoard onEditTask={handleEditTask} />
        ) : (
          <ListView onEditTask={handleEditTask} />
        )}
      </main>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {isVoiceModalOpen && (
        <VoiceModal
          onClose={() => setIsVoiceModalOpen(false)}
          onComplete={handleVoiceComplete}
        />
      )}
    </div>
  );
}

export default App;
