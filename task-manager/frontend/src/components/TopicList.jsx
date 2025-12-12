import { useState } from 'react'
import './TopicList.css'

function TopicList({ topics, onSelectTopic, onEditTopic, loading, isOverdue }) {
  if (loading) {
    return <div className="loading">Loading topics...</div>
  }

  if (topics.length === 0) {
    return (
      <div className="empty-state">
        <p>No topics yet. Create your first topic to get started!</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="topic-list">
      {topics.map((topic) => {
        const pendingTasks = topic.total_tasks - topic.completed_tasks
        const isDue = isOverdue(topic.due_date)

        return (
          <div
            key={topic.id}
            className={`topic-card ${isDue ? 'overdue' : ''}`}
            onClick={() => onSelectTopic(topic)}
          >
            <div className="topic-header">
              <h3>{topic.title}</h3>
              {isDue && <span className="overdue-badge">Overdue</span>}
            </div>

            {topic.description && (
              <p className="topic-description">{topic.description}</p>
            )}

            <div className="topic-meta">
              <span className="task-count">
                {pendingTasks} pending / {topic.total_tasks} total
              </span>
              {topic.due_date && (
                <span className={`due-date ${isDue ? 'overdue-text' : ''}`}>
                  Due: {formatDate(topic.due_date)}
                </span>
              )}
            </div>

            {topic.tags && (
              <div className="topic-tags">
                {topic.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="tag">{tag.trim()}</span>
                ))}
              </div>
            )}

            <div className="topic-footer">
              <span className="created-date">
                Created {formatDate(topic.created_date)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TopicList
