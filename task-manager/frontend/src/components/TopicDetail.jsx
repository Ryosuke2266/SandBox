import { useState, useEffect } from 'react'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import './TopicDetail.css'

function TopicDetail({ topic, onBack, onEdit, onDelete, onUpdate, isOverdue }) {
  const [tasks, setTasks] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTopicDetails = async () => {
    try {
      const response = await fetch(`/api/topics/${topic.id}`)
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching topic details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopicDetails()
  }, [topic.id])

  const handleTaskAdded = () => {
    setShowTaskForm(false)
    fetchTopicDetails()
    onUpdate()
  }

  const handleTaskUpdated = () => {
    fetchTopicDetails()
    onUpdate()
  }

  const handleDeleteTopic = async () => {
    if (!confirm('Are you sure you want to delete this topic and all its tasks?')) {
      return
    }

    try {
      await fetch(`/api/topics/${topic.id}`, { method: 'DELETE' })
      onDelete()
    } catch (error) {
      console.error('Error deleting topic:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const isDue = isOverdue(topic.due_date)

  return (
    <div className="topic-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="detail-actions">
          <button className="btn-edit" onClick={() => onEdit(topic)}>Edit Topic</button>
          <button className="btn-delete" onClick={handleDeleteTopic}>Delete</button>
        </div>
      </div>

      <div className={`topic-info ${isDue ? 'overdue' : ''}`}>
        <h2>{topic.title}</h2>
        {isDue && <span className="overdue-badge">Overdue</span>}

        {topic.description && (
          <p className="description">{topic.description}</p>
        )}

        <div className="info-grid">
          {topic.due_date && (
            <div className="info-item">
              <strong>Due Date:</strong>
              <span className={isDue ? 'overdue-text' : ''}>
                {formatDate(topic.due_date)}
              </span>
            </div>
          )}
          {topic.conversation_context && (
            <div className="info-item">
              <strong>Context:</strong>
              <span>{topic.conversation_context}</span>
            </div>
          )}
          <div className="info-item">
            <strong>Created:</strong>
            <span>{formatDate(topic.created_date)}</span>
          </div>
          <div className="info-item">
            <strong>Tasks:</strong>
            <span>{pendingTasks} pending / {completedTasks} completed</span>
          </div>
        </div>

        {topic.tags && (
          <div className="topic-tags">
            {topic.tags.split(',').map((tag, idx) => (
              <span key={idx} className="tag">{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h3>Tasks</h3>
          <button
            className="btn-add-task"
            onClick={() => setShowTaskForm(!showTaskForm)}
          >
            {showTaskForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {showTaskForm && (
          <TaskForm
            topicId={topic.id}
            onSave={handleTaskAdded}
            onCancel={() => setShowTaskForm(false)}
          />
        )}

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onTaskUpdate={handleTaskUpdated}
            isOverdue={isOverdue}
          />
        )}
      </div>
    </div>
  )
}

export default TopicDetail
