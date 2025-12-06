import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useTaskStore from '../store/taskStore';
import ConfirmDialog from './ConfirmDialog';

function TaskCard({ task, onEdit, isDragging }) {
  const { deleteTask } = useTaskStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const getDueDateClass = () => {
    if (!task.dueDate) return '';
    const dueDate = new Date(task.dueDate);
    if (task.status !== 'done') {
      if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
      if (isToday(dueDate)) return 'today';
    }
    return '';
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const priorityLabels = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`task-card ${isDragging ? 'dragging' : ''}`}
        onClick={(e) => {
          if (!e.defaultPrevented) {
            onEdit?.();
          }
        }}
      >
        <div className="task-card-header">
          <h3 className="task-title">{task.title}</h3>
          <div className="task-actions">
            <button
              className="task-action-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.();
              }}
              title="Edit task"
            >
              <Pencil size={14} />
            </button>
            <button
              className="task-action-btn delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowConfirm(true);
              }}
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          <span className={`task-priority ${task.priority}`}>
            {priorityLabels[task.priority]}
          </span>

          {task.dueDate && (
            <span className={`task-due-date ${getDueDateClass()}`}>
              <Calendar size={12} />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

export default TaskCard;

