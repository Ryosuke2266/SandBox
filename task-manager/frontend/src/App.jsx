import { useState, useEffect } from 'react'
import TopicList from './components/TopicList'
import TopicDetail from './components/TopicDetail'
import TopicForm from './components/TopicForm'
import AllTasksView from './components/AllTasksView'
import './App.css'

function App() {
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [view, setView] = useState('topics') // 'topics' or 'all-tasks'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_date')
  const [loading, setLoading] = useState(true)

  // Fetch topics
  const fetchTopics = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (sortBy) params.append('sort', sortBy)

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      setTopics(data)
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [searchQuery, sortBy])

  const handleCreateTopic = () => {
    setEditingTopic(null)
    setShowTopicForm(true)
    setSelectedTopic(null)
  }

  const handleEditTopic = (topic) => {
    setEditingTopic(topic)
    setShowTopicForm(true)
    setSelectedTopic(null)
  }

  const handleTopicSaved = () => {
    setShowTopicForm(false)
    setEditingTopic(null)
    fetchTopics()
  }

  const handleTopicDeleted = () => {
    setSelectedTopic(null)
    fetchTopics()
  }

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic)
    setShowTopicForm(false)
  }

  const handleBack = () => {
    setSelectedTopic(null)
    setShowTopicForm(false)
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Task Manager</h1>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_date">Latest</option>
            <option value="due_date">Due Date</option>
            <option value="name">Name</option>
          </select>
        </div>
      </header>

      <div className="view-toggle">
        <button
          className={`view-btn ${view === 'topics' ? 'active' : ''}`}
          onClick={() => setView('topics')}
        >
          Topics
        </button>
        <button
          className={`view-btn ${view === 'all-tasks' ? 'active' : ''}`}
          onClick={() => setView('all-tasks')}
        >
          All Tasks
        </button>
      </div>

      <main className="app-main">
        {view === 'topics' ? (
          <>
            {!selectedTopic && !showTopicForm && (
              <>
                <button className="btn-new-topic" onClick={handleCreateTopic}>
                  + New Topic
                </button>
                <TopicList
                  topics={topics}
                  onSelectTopic={handleSelectTopic}
                  onEditTopic={handleEditTopic}
                  loading={loading}
                  isOverdue={isOverdue}
                />
              </>
            )}

            {showTopicForm && (
              <TopicForm
                topic={editingTopic}
                onSave={handleTopicSaved}
                onCancel={handleBack}
              />
            )}

            {selectedTopic && (
              <TopicDetail
                topic={selectedTopic}
                onBack={handleBack}
                onEdit={handleEditTopic}
                onDelete={handleTopicDeleted}
                onUpdate={fetchTopics}
                isOverdue={isOverdue}
              />
            )}
          </>
        ) : (
          <AllTasksView onTopicClick={handleSelectTopic} isOverdue={isOverdue} />
        )}
      </main>
    </div>
  )
}

export default App
