import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Inbox } from 'lucide-react';
import TaskCard from './TaskCard';

function KanbanColumn({ id, title, tasks, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          <div className={`column-indicator ${id}`}></div>
          <span className="column-name">{title}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`column-content ${isOver ? 'drag-over' : ''}`}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
              />
            ))
          ) : (
            <div className="empty-state">
              <Inbox className="empty-icon" />
              <p className="empty-title">No tasks</p>
              <p className="empty-text">
                Drag tasks here or create a new one
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default KanbanColumn;

