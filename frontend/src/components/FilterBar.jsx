import useTaskStore from '../store/taskStore';

function FilterBar() {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const hasFilters = filters.status || filters.priority;

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <span className="filter-label">Status</span>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="filter-divider"></div>

      <div className="filter-group">
        <span className="filter-label">Priority</span>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => setFilters({ priority: e.target.value })}
        >
          <option value="">All</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {hasFilters && (
        <>
          <div className="filter-divider"></div>
          <button className="clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        </>
      )}
    </div>
  );
}

export default FilterBar;

