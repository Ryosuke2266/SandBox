import { useState } from 'react'
import './TaskList.css'

function TaskList({ tasks, onTaskUpdate, isOverdue }) {
  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({})

  if (tasks.length === 0) {
    return <div className="empty-tasks">No tasks yet. Add your first task!</div>
  }

  const handleToggleComplete = async (task) => {
    try {
      await fetch(`/api/tasks/${task.id}/toggle`, { method: 'PATCH' })
      onTaskUpdate()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      onTaskUpdate()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task.id)
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status
    })
  }

  const handleSaveEdit = async (taskId) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          due_date: editForm.due_date || null
        })
      })
      setEditingTask(null)
      onTaskUpdate()
    } catch (error) {
      console.error('Error updating task:', error)
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

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const isDue = isOverdue(task.due_date)
        const isEditing = editingTask === task.id

        if (isEditing) {
          return (
            <div key={task.id} className="task-edit-form">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Task title"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description"
                rows="2"
              />
              <div className="edit-row">
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                />
              </div>
              <div className="edit-actions">
                <button className="btn-save" onClick={() => handleSaveEdit(task.id)}>Save</button>
                <button className="btn-cancel" onClick={() => setEditingTask(null)}>Cancel</button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={task.id}
            className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${isDue ? 'overdue' : ''}`}
          >
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleToggleComplete(task)}
              />
            </div>

            <div className="task-content">
              <div className="task-title">{task.title}</div>
              {task.description && (
                <div className="task-description">{task.description}</div>
              )}

              <div className="task-meta">
                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
                {task.due_date && (
                  <span className={`task-due-date ${isDue ? 'overdue-text' : ''}`}>
                    Due: {formatDate(task.due_date)}
                  </span>
                )}
                {task.completed_date && (
                  <span className="completed-date">
                    Completed: {formatDate(task.completed_date)}
                  </span>
                )}
              </div>
            </div>

            <div className="task-actions">
              <button className="btn-edit-task" onClick={() => handleEditTask(task)}>
                Edit
              </button>
              <button className="btn-delete-task" onClick={() => handleDeleteTask(task.id)}>
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList
