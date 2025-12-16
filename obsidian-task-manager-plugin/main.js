const { Plugin, Modal, Notice, TFile, MarkdownView } = require('obsidian');

module.exports = class TopicTaskManagerPlugin extends Plugin {
  async onload() {
    console.log('Loading Topic-Based Task Manager Plugin');

    // Add ribbon icon
    this.addRibbonIcon('clipboard-list', 'Topic Task Manager', () => {
      new TopicListModal(this.app, this).open();
    });

    // Add command to create new topic
    this.addCommand({
      id: 'create-new-topic',
      name: 'Create New Topic',
      callback: () => {
        new CreateTopicModal(this.app, this).open();
      }
    });

    // Add command to view all tasks
    this.addCommand({
      id: 'view-all-tasks',
      name: 'View All Tasks',
      callback: () => {
        new AllTasksModal(this.app, this).open();
      }
    });

    // Add command to view topics
    this.addCommand({
      id: 'view-topics',
      name: 'View Topics',
      callback: () => {
        new TopicListModal(this.app, this).open();
      }
    });
  }

  onunload() {
    console.log('Unloading Topic-Based Task Manager Plugin');
  }

  // Helper: Get topics folder
  getTopicsFolder() {
    return 'Topics'; // You can make this configurable in settings
  }

  // Helper: Ensure topics folder exists
  async ensureTopicsFolder() {
    const folderPath = this.getTopicsFolder();
    const folder = this.app.vault.getAbstractFileByPath(folderPath);

    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }
  }

  // Get all topic files
  async getAllTopics() {
    await this.ensureTopicsFolder();
    const files = this.app.vault.getMarkdownFiles();
    const topicsFolder = this.getTopicsFolder();

    return files.filter(file => file.path.startsWith(topicsFolder + '/'));
  }

  // Create a new topic
  async createTopic(data) {
    await this.ensureTopicsFolder();
    const { title, description, dueDate, context, tags } = data;

    const fileName = `${this.getTopicsFolder()}/${title}.md`;

    const content = `---
title: ${title}
due_date: ${dueDate || ''}
context: ${context || ''}
tags: [${tags || ''}]
status: active
created: ${new Date().toISOString().split('T')[0]}
---

# ${title}

${description || ''}

## Tasks

<!-- Add tasks below using Obsidian task format: - [ ] Task name -->

`;

    try {
      const file = await this.app.vault.create(fileName, content);
      new Notice(`Topic "${title}" created!`);
      return file;
    } catch (error) {
      new Notice(`Error creating topic: ${error.message}`);
      return null;
    }
  }

  // Parse topic file to get metadata and tasks
  async parseTopicFile(file) {
    const content = await this.app.vault.read(file);
    const lines = content.split('\n');

    const metadata = {};
    const tasks = [];

    // Parse frontmatter
    let inFrontmatter = false;
    let inTasks = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line === '---') {
        inFrontmatter = !inFrontmatter;
        continue;
      }

      if (inFrontmatter) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          metadata[match[1]] = match[2];
        }
      }

      // Parse tasks
      if (line.trim().startsWith('- [')) {
        const isComplete = line.includes('- [x]') || line.includes('- [X]');
        const taskText = line.replace(/^- \[.\]\s*/, '').trim();

        // Extract priority if present
        let priority = 'Medium';
        if (taskText.includes('(High)') || taskText.includes('🔴')) priority = 'High';
        if (taskText.includes('(Low)') || taskText.includes('🟢')) priority = 'Low';

        tasks.push({
          text: taskText.replace(/\((High|Medium|Low)\)/g, '').trim(),
          completed: isComplete,
          priority: priority
        });
      }
    }

    return {
      file: file,
      title: metadata.title || file.basename,
      dueDate: metadata.due_date || '',
      context: metadata.context || '',
      tags: metadata.tags || '',
      status: metadata.status || 'active',
      created: metadata.created || '',
      tasks: tasks,
      content: content
    };
  }
};

// Modal to show list of topics
class TopicListModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: '📋 Topics' });

    // Add "New Topic" button
    const buttonContainer = contentEl.createDiv({ cls: 'button-container' });
    const newTopicBtn = buttonContainer.createEl('button', {
      text: '+ New Topic',
      cls: 'mod-cta'
    });
    newTopicBtn.addEventListener('click', () => {
      this.close();
      new CreateTopicModal(this.app, this.plugin).open();
    });

    // Get and display topics
    const topics = await this.plugin.getAllTopics();

    if (topics.length === 0) {
      contentEl.createEl('p', {
        text: 'No topics yet. Create your first topic!',
        cls: 'empty-state'
      });
      return;
    }

    const topicList = contentEl.createDiv({ cls: 'topic-list' });

    for (const topicFile of topics) {
      const topicData = await this.plugin.parseTopicFile(topicFile);

      const topicCard = topicList.createDiv({ cls: 'topic-card' });

      const titleEl = topicCard.createEl('h3', { text: topicData.title });
      titleEl.style.cursor = 'pointer';
      titleEl.addEventListener('click', async () => {
        this.close();
        await this.app.workspace.openLinkText(topicFile.path, '', false);
      });

      if (topicData.dueDate) {
        const dueDate = new Date(topicData.dueDate);
        const isOverdue = dueDate < new Date();
        topicCard.createEl('p', {
          text: `Due: ${topicData.dueDate}`,
          cls: isOverdue ? 'overdue' : 'due-date'
        });
      }

      const taskCount = topicData.tasks.length;
      const completedCount = topicData.tasks.filter(t => t.completed).length;
      topicCard.createEl('p', {
        text: `${completedCount}/${taskCount} tasks completed`
      });

      if (topicData.context) {
        topicCard.createEl('p', {
          text: `Context: ${topicData.context}`,
          cls: 'context'
        });
      }
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// Modal to create a new topic
class CreateTopicModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Create New Topic' });

    const form = contentEl.createDiv({ cls: 'topic-form' });

    // Title
    form.createEl('label', { text: 'Title *' });
    const titleInput = form.createEl('input', {
      type: 'text',
      placeholder: 'e.g., Weekly Team Meeting'
    });
    titleInput.focus();

    // Description
    form.createEl('label', { text: 'Description' });
    const descInput = form.createEl('textarea', {
      placeholder: 'What was discussed...'
    });
    descInput.rows = 4;

    // Due Date
    form.createEl('label', { text: 'Due Date' });
    const dueDateInput = form.createEl('input', { type: 'date' });

    // Context
    form.createEl('label', { text: 'Context' });
    const contextInput = form.createEl('input', {
      type: 'text',
      placeholder: 'e.g., Meeting with John'
    });

    // Tags
    form.createEl('label', { text: 'Tags (comma-separated)' });
    const tagsInput = form.createEl('input', {
      type: 'text',
      placeholder: 'e.g., urgent, marketing'
    });

    // Buttons
    const buttonContainer = form.createDiv({ cls: 'button-container' });

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => this.close());

    const createBtn = buttonContainer.createEl('button', {
      text: 'Create Topic',
      cls: 'mod-cta'
    });

    createBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();

      if (!title) {
        new Notice('Title is required!');
        return;
      }

      await this.plugin.createTopic({
        title: title,
        description: descInput.value.trim(),
        dueDate: dueDateInput.value,
        context: contextInput.value.trim(),
        tags: tagsInput.value.trim()
      });

      this.close();
      new TopicListModal(this.app, this.plugin).open();
    });

    // Enter key to create
    titleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        createBtn.click();
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// Modal to view all tasks across topics
class AllTasksModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: '✓ All Tasks' });

    const topics = await this.plugin.getAllTopics();
    const allTasks = [];

    for (const topicFile of topics) {
      const topicData = await this.plugin.parseTopicFile(topicFile);

      for (const task of topicData.tasks) {
        allTasks.push({
          ...task,
          topicTitle: topicData.title,
          topicFile: topicFile
        });
      }
    }

    if (allTasks.length === 0) {
      contentEl.createEl('p', {
        text: 'No tasks yet. Create a topic and add tasks!',
        cls: 'empty-state'
      });
      return;
    }

    // Filter buttons
    const filterContainer = contentEl.createDiv({ cls: 'filter-container' });

    let currentFilter = 'all';

    const renderTasks = (filter) => {
      taskList.empty();

      const filtered = allTasks.filter(task => {
        if (filter === 'pending') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      });

      for (const task of filtered) {
        const taskEl = taskList.createDiv({ cls: 'task-item' });

        taskEl.createEl('span', {
          text: task.completed ? '✓' : '○',
          cls: 'task-checkbox'
        });

        const taskText = taskEl.createEl('span', {
          text: task.text,
          cls: task.completed ? 'task-completed' : ''
        });

        taskEl.createEl('span', {
          text: `[${task.topicTitle}]`,
          cls: 'task-topic'
        }).addEventListener('click', async () => {
          this.close();
          await this.app.workspace.openLinkText(task.topicFile.path, '', false);
        });

        if (task.priority !== 'Medium') {
          taskEl.createEl('span', {
            text: task.priority,
            cls: `priority-${task.priority.toLowerCase()}`
          });
        }
      }
    };

    ['all', 'pending', 'completed'].forEach(filter => {
      const btn = filterContainer.createEl('button', {
        text: filter.charAt(0).toUpperCase() + filter.slice(1)
      });
      btn.addEventListener('click', () => {
        currentFilter = filter;
        filterContainer.querySelectorAll('button').forEach(b => b.removeClass('active'));
        btn.addClass('active');
        renderTasks(filter);
      });

      if (filter === 'all') btn.addClass('active');
    });

    const taskList = contentEl.createDiv({ cls: 'task-list' });
    renderTasks('all');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
