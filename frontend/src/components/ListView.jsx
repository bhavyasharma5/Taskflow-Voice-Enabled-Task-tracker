import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useTaskStore from '../store/taskStore';
import ConfirmDialog from './ConfirmDialog';

function ListView({ onEditTask }) {
  const { getFilteredTasks, deleteTask } = useTaskStore();
  const tasks = getFilteredTasks();
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTaskId);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setDeleteTaskId(null);
    }
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done'
  };

  const priorityLabels = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  const getDueDateClass = (task) => {
    if (!task.dueDate) return '';
    const dueDate = new Date(task.dueDate);
    if (task.status !== 'done') {
      if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
      if (isToday(dueDate)) return 'today';
    }
    return '';
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="list-view">
      <div className="list-container">
        <div className="list-header">
          <span>Task</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Due Date</span>
          <span>Actions</span>
        </div>

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="list-item"
              onClick={() => onEditTask(task)}
            >
              <div className="list-item-title">{task.title}</div>
              
              <div className="list-item-status">
                <span className={`status-dot ${task.status}`}></span>
                {statusLabels[task.status]}
              </div>
              
              <div>
                <span className={`task-priority ${task.priority}`}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
              
              <div className={`task-due-date ${getDueDateClass(task)}`}>
                <Calendar size={14} />
                {formatDueDate(task.dueDate)}
              </div>
              
              <div>
                <button
                  className="task-action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTaskId(task.id);
                  }}
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p className="empty-title">No tasks found</p>
            <p className="empty-text">
              Create a new task or adjust your filters
            </p>
          </div>
        )}
      </div>

      {deleteTaskId && (
        <ConfirmDialog
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTaskId(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default ListView;

