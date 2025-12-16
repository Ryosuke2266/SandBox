const { Plugin, Modal, Notice } = require('obsidian');

class TopicTaskManagerPlugin extends Plugin {
  async onload() {
    console.log('Topic-Based Task Manager: Loading plugin');

    // Add ribbon icon
    this.addRibbonIcon('clipboard-list', 'Topic Task Manager', () => {
      console.log('Topic-Based Task Manager: Ribbon icon clicked');
      try {
        new TopicListModal(this.app, this).open();
      } catch (error) {
        console.error('Topic-Based Task Manager: Error opening modal', error);
        new Notice('Error opening topic list: ' + error.message);
      }
    });

    // Add command to create new topic
    this.addCommand({
      id: 'create-new-topic',
      name: 'Create New Topic',
      callback: () => {
        console.log('Topic-Based Task Manager: Create topic command');
        new CreateTopicModal(this.app, this).open();
      }
    });

    // Add command to view all tasks
    this.addCommand({
      id: 'view-all-tasks',
      name: 'View All Tasks',
      callback: () => {
        console.log('Topic-Based Task Manager: View all tasks command');
        new AllTasksModal(this.app, this).open();
      }
    });
  }

  onunload() {
    console.log('Topic-Based Task Manager: Unloading plugin');
  }

  getTopicsFolder() {
    return 'Topics';
  }

  async ensureTopicsFolder() {
    const folderPath = this.getTopicsFolder();
    const folder = this.app.vault.getAbstractFileByPath(folderPath);

    if (!folder) {
      console.log('Topic-Based Task Manager: Creating Topics folder');
      await this.app.vault.createFolder(folderPath);
    }
  }

  async getAllTopics() {
    await this.ensureTopicsFolder();
    const files = this.app.vault.getMarkdownFiles();
    const topicsFolder = this.getTopicsFolder();
    return files.filter(file => file.path.startsWith(topicsFolder + '/'));
  }

  async createTopic(data) {
    console.log('Topic-Based Task Manager: Creating topic', data);
    await this.ensureTopicsFolder();
    const { title, description, dueDate, context, tags } = data;

    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '-');
    const fileName = `${this.getTopicsFolder()}/${safeTitle}.md`;

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

<!-- Add tasks below using: - [ ] Task name -->

`;

    try {
      const existingFile = this.app.vault.getAbstractFileByPath(fileName);
      if (existingFile) {
        new Notice(`Topic "${title}" already exists!`);
        return existingFile;
      }

      const file = await this.app.vault.create(fileName, content);
      new Notice(`✅ Topic "${title}" created!`);
      console.log('Topic-Based Task Manager: Topic created successfully', file.path);
      return file;
    } catch (error) {
      console.error('Topic-Based Task Manager: Error creating topic', error);
      new Notice(`❌ Error: ${error.message}`);
      return null;
    }
  }

  async parseTopicFile(file) {
    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    const metadata = {};
    const tasks = [];
    let inFrontmatter = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line === '---') {
        inFrontmatter = !inFrontmatter;
        continue;
      }

      if (inFrontmatter) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          metadata[match[1]] = match[2];
        }
      }

      if (line.trim().match(/^- \[.\]/)) {
        const isComplete = line.includes('- [x]') || line.includes('- [X]');
        const taskText = line.replace(/^- \[.\]\s*/, '').trim();
        let priority = 'Medium';
        if (taskText.includes('(High)')) priority = 'High';
        if (taskText.includes('(Low)')) priority = 'Low';

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
      tasks: tasks
    };
  }
}

class TopicListModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    console.log('Topic-Based Task Manager: TopicListModal created');
  }

  async onOpen() {
    console.log('Topic-Based Task Manager: TopicListModal opening');
    const { contentEl } = this;
    contentEl.empty();

    const container = contentEl.createDiv();
    container.createEl('h2', { text: '📋 Topics' });

    const buttonDiv = container.createDiv();
    buttonDiv.style.marginBottom = '1rem';

    const newTopicBtn = buttonDiv.createEl('button', {
      text: '+ New Topic',
      cls: 'mod-cta'
    });

    const self = this;

    // Test if button exists
    console.log('Topic-Based Task Manager: New Topic button created', newTopicBtn);

    // Try multiple ways to attach the handler
    newTopicBtn.addEventListener('click', function(e) {
      console.log('Topic-Based Task Manager: New Topic button clicked (addEventListener)');
      e.preventDefault();
      e.stopPropagation();
      self.close();
      setTimeout(() => {
        new CreateTopicModal(self.app, self.plugin).open();
      }, 100);
    });

    newTopicBtn.onclick = function(e) {
      console.log('Topic-Based Task Manager: New Topic button clicked (onclick)');
      e.preventDefault();
      e.stopPropagation();
      self.close();
      setTimeout(() => {
        new CreateTopicModal(self.app, self.plugin).open();
      }, 100);
      return false;
    };

    try {
      const topics = await this.plugin.getAllTopics();
      console.log('Topic-Based Task Manager: Found topics:', topics.length);

      if (topics.length === 0) {
        container.createEl('p', {
          text: 'No topics yet. Create your first topic!',
          cls: 'mod-muted'
        });
      } else {
        const topicList = container.createDiv();
        topicList.style.marginTop = '1rem';

        for (const topicFile of topics) {
          const topicData = await this.plugin.parseTopicFile(topicFile);
          const topicCard = topicList.createDiv();
          topicCard.style.marginBottom = '0.5rem';
          topicCard.style.padding = '0.5rem';
          topicCard.style.border = '1px solid var(--background-modifier-border)';
          topicCard.style.borderRadius = '4px';

          const titleEl = topicCard.createEl('h3', { text: topicData.title });
          titleEl.style.cursor = 'pointer';
          titleEl.style.margin = '0 0 0.5rem 0';

          titleEl.onclick = async () => {
            console.log('Topic-Based Task Manager: Opening topic', topicFile.path);
            self.close();
            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(topicFile);
          };

          const taskCount = topicData.tasks.length;
          const completedCount = topicData.tasks.filter(t => t.completed).length;
          topicCard.createEl('p', {
            text: `✓ ${completedCount}/${taskCount} tasks`,
            cls: 'mod-muted'
          });

          if (topicData.context) {
            topicCard.createEl('p', {
              text: `💬 ${topicData.context}`,
              cls: 'mod-muted'
            });
          }
        }
      }
    } catch (error) {
      console.error('Topic-Based Task Manager: Error loading topics', error);
      container.createEl('p', {
        text: 'Error loading topics: ' + error.message,
        cls: 'mod-warning'
      });
    }
  }

  onClose() {
    console.log('Topic-Based Task Manager: TopicListModal closing');
    const { contentEl } = this;
    contentEl.empty();
  }
}

class CreateTopicModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    console.log('Topic-Based Task Manager: CreateTopicModal created');
  }

  onOpen() {
    console.log('Topic-Based Task Manager: CreateTopicModal opening');
    const { contentEl } = this;
    contentEl.empty();

    const container = contentEl.createDiv();
    container.createEl('h2', { text: '✨ Create New Topic' });

    const form = container.createDiv();
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1rem';

    // Title
    form.createEl('label', { text: 'Title *' });
    const titleInput = form.createEl('input', {
      type: 'text',
      placeholder: 'e.g., Weekly Team Meeting'
    });
    titleInput.style.width = '100%';
    titleInput.focus();

    // Description
    form.createEl('label', { text: 'Description' });
    const descInput = form.createEl('textarea', {
      placeholder: 'What was discussed...'
    });
    descInput.style.width = '100%';
    descInput.rows = 4;

    // Due Date
    form.createEl('label', { text: 'Due Date' });
    const dueDateInput = form.createEl('input', { type: 'date' });
    dueDateInput.style.width = '100%';

    // Context
    form.createEl('label', { text: 'Context' });
    const contextInput = form.createEl('input', {
      type: 'text',
      placeholder: 'e.g., Meeting with John'
    });
    contextInput.style.width = '100%';

    // Tags
    form.createEl('label', { text: 'Tags (comma-separated)' });
    const tagsInput = form.createEl('input', {
      type: 'text',
      placeholder: 'e.g., urgent, marketing'
    });
    tagsInput.style.width = '100%';

    // Buttons
    const buttonContainer = form.createDiv();
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '0.5rem';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '1rem';

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    const createBtn = buttonContainer.createEl('button', {
      text: 'Create Topic',
      cls: 'mod-cta'
    });

    const self = this;

    console.log('Topic-Based Task Manager: Buttons created', { cancelBtn, createBtn });

    // Cancel button
    cancelBtn.addEventListener('click', (e) => {
      console.log('Topic-Based Task Manager: Cancel clicked');
      e.preventDefault();
      self.close();
    });

    cancelBtn.onclick = (e) => {
      console.log('Topic-Based Task Manager: Cancel clicked (onclick)');
      e.preventDefault();
      self.close();
      return false;
    };

    // Create button
    const createTopic = async () => {
      console.log('Topic-Based Task Manager: Create topic handler called');
      const title = titleInput.value.trim();

      if (!title) {
        new Notice('❗ Title is required!');
        titleInput.focus();
        return;
      }

      try {
        const file = await self.plugin.createTopic({
          title: title,
          description: descInput.value.trim(),
          dueDate: dueDateInput.value,
          context: contextInput.value.trim(),
          tags: tagsInput.value.trim()
        });

        if (file) {
          self.close();
          const leaf = self.app.workspace.getLeaf(false);
          await leaf.openFile(file);
        }
      } catch (error) {
        console.error('Topic-Based Task Manager: Error in create handler', error);
        new Notice('Error creating topic: ' + error.message);
      }
    };

    createBtn.addEventListener('click', async (e) => {
      console.log('Topic-Based Task Manager: Create clicked (addEventListener)');
      e.preventDefault();
      await createTopic();
    });

    createBtn.onclick = async (e) => {
      console.log('Topic-Based Task Manager: Create clicked (onclick)');
      e.preventDefault();
      await createTopic();
      return false;
    };

    // Enter key
    titleInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        console.log('Topic-Based Task Manager: Enter key pressed');
        e.preventDefault();
        await createTopic();
      }
    });
  }

  onClose() {
    console.log('Topic-Based Task Manager: CreateTopicModal closing');
    const { contentEl } = this;
    contentEl.empty();
  }
}

class AllTasksModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen() {
    console.log('Topic-Based Task Manager: AllTasksModal opening');
    const { contentEl } = this;
    contentEl.empty();

    const container = contentEl.createDiv();
    container.createEl('h2', { text: '✓ All Tasks' });

    try {
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
        container.createEl('p', {
          text: 'No tasks yet. Create a topic and add tasks!',
          cls: 'mod-muted'
        });
        return;
      }

      const taskList = container.createDiv();
      taskList.style.marginTop = '1rem';

      for (const task of allTasks) {
        const taskDiv = taskList.createDiv();
        taskDiv.style.marginBottom = '0.5rem';
        taskDiv.style.padding = '0.5rem';
        taskDiv.style.border = '1px solid var(--background-modifier-border)';
        taskDiv.style.borderRadius = '4px';

        const checkbox = task.completed ? '✓' : '○';
        const taskText = `${checkbox} ${task.text} [${task.topicTitle}]`;

        const taskEl = taskDiv.createEl('p', { text: taskText });
        if (task.completed) {
          taskEl.style.textDecoration = 'line-through';
          taskEl.style.opacity = '0.6';
        }

        const self = this;
        taskDiv.style.cursor = 'pointer';
        taskDiv.onclick = async () => {
          self.close();
          const leaf = this.app.workspace.getLeaf(false);
          await leaf.openFile(task.topicFile);
        };
      }
    } catch (error) {
      console.error('Topic-Based Task Manager: Error loading tasks', error);
      container.createEl('p', {
        text: 'Error loading tasks: ' + error.message,
        cls: 'mod-warning'
      });
    }
  }

  onClose() {
    console.log('Topic-Based Task Manager: AllTasksModal closing');
    const { contentEl } = this;
    contentEl.empty();
  }
}

module.exports = TopicTaskManagerPlugin;
