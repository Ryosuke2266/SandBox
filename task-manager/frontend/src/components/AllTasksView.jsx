import { useState, useEffect } from 'react'
import './AllTasksView.css'

function AllTasksView({ onTopicClick, isOverdue }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'completed', 'overdue'
  const [loading, setLoading] = useState(true)

  const fetchAllTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllTasks()
  }, [])

  const handleToggleComplete = async (task) => {
    try {
      await fetch(`/api/tasks/${task.id}/toggle`, { method: 'PATCH' })
      fetchAllTasks()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending'
    if (filter === 'completed') return task.status === 'completed'
    if (filter === 'overdue') return task.status === 'pending' && isOverdue(task.due_date)
    return true
  })

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const overdueCount = tasks.filter(t => t.status === 'pending' && isOverdue(t.due_date)).length

  if (loading) {
    return <div className="loading">Loading tasks...</div>
  }

  return (
    <div className="all-tasks-view">
      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </button>
        {overdueCount > 0 && (
          <button
            className={`filter-btn overdue-btn ${filter === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue ({overdueCount})
          </button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          {filter === 'all' && 'No tasks yet. Create a topic and add tasks!'}
          {filter === 'pending' && 'No pending tasks.'}
          {filter === 'completed' && 'No completed tasks yet.'}
          {filter === 'overdue' && 'No overdue tasks.'}
        </div>
      ) : (
        <div className="all-tasks-list">
          {filteredTasks.map((task) => {
            const isDue = isOverdue(task.due_date)

            return (
              <div
                key={task.id}
                className={`task-item-all ${task.status === 'completed' ? 'completed' : ''} ${isDue ? 'overdue' : ''}`}
              >
                <div className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleComplete(task)}
                  />
                </div>

                <div className="task-content-all">
                  <div className="task-title">{task.title}</div>

                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}

                  <div className="task-topic-link">
                    <button
                      className="topic-link-btn"
                      onClick={() => onTopicClick({ id: task.topic_id })}
                    >
                      📁 {task.topic_title}
                    </button>
                  </div>

                  <div className="task-meta">
                    <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className={`task-due-date ${isDue ? 'overdue-text' : ''}`}>
                        Task Due: {formatDate(task.due_date)}
                      </span>
                    )}
                    {task.topic_due_date && (
                      <span className={`topic-due-date ${isOverdue(task.topic_due_date) ? 'overdue-text' : ''}`}>
                        Topic Due: {formatDate(task.topic_due_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AllTasksView
