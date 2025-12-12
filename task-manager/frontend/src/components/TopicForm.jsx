import { useState } from 'react'
import './TopicForm.css'

function TopicForm({ topic, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: topic?.title || '',
    description: topic?.description || '',
    due_date: topic?.due_date ? topic.due_date.split('T')[0] : '',
    conversation_context: topic?.conversation_context || '',
    tags: topic?.tags || '',
    status: topic?.status || 'active'
  })

  const [inlineTasks, setInlineTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddInlineTask = () => {
    if (newTaskTitle.trim()) {
      setInlineTasks([...inlineTasks, { title: newTaskTitle, priority: 'Medium' }])
      setNewTaskTitle('')
    }
  }

  const handleRemoveInlineTask = (index) => {
    setInlineTasks(inlineTasks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Save or update topic
      const url = topic ? `/api/topics/${topic.id}` : '/api/topics'
      const method = topic ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          due_date: formData.due_date || null
        })
      })

      const savedTopic = await response.json()

      // If new topic, create inline tasks
      if (!topic && inlineTasks.length > 0) {
        await Promise.all(
          inlineTasks.map(task =>
            fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topic_id: savedTopic.id,
                title: task.title,
                priority: task.priority
              })
            })
          )
        )
      }

      onSave()
    } catch (error) {
      console.error('Error saving topic:', error)
    }
  }

  return (
    <div className="topic-form">
      <h2>{topic ? 'Edit Topic' : 'New Topic'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Q4 Marketing Strategy Meeting"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="What was discussed..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Context</label>
            <input
              type="text"
              name="conversation_context"
              value={formData.conversation_context}
              onChange={handleChange}
              placeholder="e.g., Meeting with John"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., urgent, marketing, client"
          />
        </div>

        {!topic && (
          <div className="inline-tasks-section">
            <h3>Quick Add Tasks</h3>
            <p className="hint">Add tasks while creating the topic</p>

            <div className="inline-task-input">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInlineTask())}
                placeholder="Task title... (press Enter)"
              />
              <button
                type="button"
                className="btn-add-inline"
                onClick={handleAddInlineTask}
              >
                Add
              </button>
            </div>

            {inlineTasks.length > 0 && (
              <ul className="inline-tasks-list">
                {inlineTasks.map((task, index) => (
                  <li key={index}>
                    <span>{task.title}</span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveInlineTask(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-save">
            {topic ? 'Update Topic' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TopicForm
