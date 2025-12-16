# Topic-Based Task Manager - Obsidian Plugin

An Obsidian plugin for managing tasks organized by conversation topics. Store everything as markdown notes in your vault!

## Features

### ✅ Same Features as Web App, But in Obsidian

- **Topic → Tasks Hierarchy**: Organize tasks by conversation themes
- **Markdown Storage**: All data stored as readable markdown files
- **Quick Capture**: Create topics during or after conversations
- **All Tasks View**: See all tasks across topics in one place
- **Obsidian Integration**: Use all Obsidian features (search, links, sync)

### 🆕 Obsidian-Specific Benefits

- **Vault Sync**: Use Obsidian Sync, iCloud, or any sync solution
- **Backlinks**: Link topics to other notes
- **Search**: Use Obsidian's powerful search
- **Mobile Access**: Works on Obsidian Mobile
- **Human-Readable**: Edit files directly in Obsidian
- **No Server Required**: Everything local in your vault

## Installation

### Method 1: Manual Installation (Recommended)

1. **Download the plugin files:**
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. **Copy to your vault:**
   ```
   YourVault/.obsidian/plugins/topic-task-manager/
   ```

   Full path example:
   ```
   /Users/yourname/Documents/MyVault/.obsidian/plugins/topic-task-manager/
   ```

3. **Enable the plugin:**
   - Open Obsidian
   - Go to Settings → Community plugins
   - Turn off "Restricted mode" if needed
   - Find "Topic-Based Task Manager" and enable it

### Method 2: From GitHub (After Publishing)

Once published to Obsidian Community Plugins:
- Settings → Community plugins → Browse
- Search "Topic-Based Task Manager"
- Install & Enable

## Usage

### Creating Your First Topic

**Option 1: Using Command Palette**
1. Press `Cmd/Ctrl + P`
2. Type "Create New Topic"
3. Fill in the form:
   - **Title** (required): "Weekly Team Meeting"
   - **Description**: What was discussed
   - **Due Date**: Overall deadline
   - **Context**: "Meeting with Sarah"
   - **Tags**: team, planning
4. Click "Create Topic"

**Option 2: Using Ribbon Icon**
- Click the clipboard icon in the left ribbon
- Select "Create New Topic"

### Viewing Topics

**Command Palette:**
- `Cmd/Ctrl + P` → "View Topics"

**Or:**
- Click the clipboard icon in the ribbon
- Browse all your topics
- Click any topic to open it

### Adding Tasks to a Topic

**Open the topic note** and add tasks using Obsidian's task format:

```markdown
## Tasks

- [ ] Follow up on budget proposal (High)
- [ ] Schedule next review (Medium)
- [ ] Update project timeline (Low)
```

**Task Format:**
- `- [ ]` = Pending task
- `- [x]` = Completed task
- `(High)`, `(Medium)`, `(Low)` = Priority levels

### Viewing All Tasks

**Command Palette:**
- `Cmd/Ctrl + P` → "View All Tasks"

This shows every task across all topics with:
- Filter by: All / Pending / Completed
- Click topic name to jump to source
- See priority levels

## File Structure

The plugin creates files in your vault like this:

```
YourVault/
└── Topics/
    ├── Weekly Team Meeting.md
    ├── Client Call - Project X.md
    └── Budget Review 2025.md
```

### Example Topic File

```markdown
---
title: Weekly Team Meeting
due_date: 2025-01-15
context: Meeting with Sarah and John
tags: [team, planning]
status: active
created: 2025-01-10
---

# Weekly Team Meeting

Discussed Q1 goals and upcoming project timelines.

## Tasks

- [ ] Follow up on budget proposal (High) 📅 2025-01-12
- [ ] Schedule next review (Medium)
- [x] Update project timeline (Low) ✅ 2025-01-11

## Notes

Key decisions:
- Approved new marketing campaign
- Need to hire 2 more developers
```

## Keyboard Shortcuts

You can set custom hotkeys in Obsidian Settings:

- Settings → Hotkeys
- Search "Topic-Based Task Manager"
- Assign shortcuts to:
  - Create New Topic
  - View Topics
  - View All Tasks

## Sync Across Devices

Your tasks sync automatically with your Obsidian vault!

**Using Obsidian Sync:**
- All topic files sync automatically
- Access from any device with Obsidian

**Using iCloud / Dropbox:**
- Store vault in synced folder
- Works across all devices

**Using Git:**
- Commit topic files to version control
- Pull on other devices

## Comparison: Web App vs Obsidian Plugin

| Feature | Web App | Obsidian Plugin |
|---------|---------|-----------------|
| **Access Method** | Web browser | Inside Obsidian |
| **Data Storage** | JSON file | Markdown notes |
| **Sync** | Deploy to cloud | Vault sync (iCloud, etc) |
| **Offline** | Need server running | Always offline-first |
| **Editing** | Web interface only | Obsidian + direct file edit |
| **Search** | Built-in search | Obsidian's powerful search |
| **Links** | No linking | Can link to other notes |
| **Mobile** | Web browser | Obsidian Mobile app |
| **Backup** | Manual file backup | Automatic vault backup |
| **Human Readable** | JSON (technical) | Markdown (readable) |

## Advanced Usage

### Using with Dataview Plugin

If you have the Dataview plugin installed, you can query your topics:

```dataview
TABLE due_date, status
FROM "Topics"
WHERE status = "active"
SORT due_date ASC
```

### Using with Tasks Plugin

The Tasks plugin can also display your tasks:

```tasks
not done
path includes Topics
```

### Custom Folder Location

To change where topics are stored:

1. Edit `main.js`
2. Find `getTopicsFolder()` function
3. Change `'Topics'` to your preferred folder
4. Reload the plugin

## Troubleshooting

### Plugin doesn't appear
- Make sure files are in: `.obsidian/plugins/topic-task-manager/`
- Restart Obsidian
- Check Settings → Community plugins → Enable the plugin

### Topics not showing
- Check that the "Topics" folder exists in your vault
- Plugin creates it automatically on first use

### Tasks not parsing correctly
- Use Obsidian task format: `- [ ]` for pending, `- [x]` for completed
- Priority in parentheses: `(High)`, `(Medium)`, `(Low)`

## Development

Want to modify the plugin?

1. **Clone to your vault:**
   ```bash
   cd YourVault/.obsidian/plugins/
   git clone <this-repo> topic-task-manager
   ```

2. **Make changes** to `main.js`

3. **Reload plugin:**
   - Settings → Community plugins
   - Toggle plugin off/on

## Roadmap

Future features:
- [ ] Settings panel (customize folder, date format)
- [ ] Templates for different topic types
- [ ] Statistics view (tasks completed, overdue, etc)
- [ ] Due date notifications
- [ ] Archive completed topics
- [ ] Import from web app version
- [ ] Export to web app version

## Support

For issues or feature requests:
- Open an issue on GitHub
- Check the documentation

## License

MIT License - Free to use and modify

---

## Quick Start Summary

1. **Install**: Copy 3 files to `.obsidian/plugins/topic-task-manager/`
2. **Enable**: Settings → Community plugins → Enable
3. **Create Topic**: `Cmd+P` → "Create New Topic"
4. **Add Tasks**: Edit the topic note, add `- [ ] Task name`
5. **View All**: `Cmd+P` → "View All Tasks"

**That's it!** Your tasks are now in Obsidian, synced across all your devices! 🎉
