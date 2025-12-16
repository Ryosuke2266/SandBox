# Installation Guide - Obsidian Plugin

## Quick Installation (5 Minutes)

### Step 1: Locate Your Vault's Plugin Folder

**Find your vault:**
- Open Obsidian
- Right-click on any note
- Select "Show in system explorer" / "Reveal in Finder"
- This shows you where your vault is located

**Navigate to plugins folder:**
```
YourVault/.obsidian/plugins/
```

Example paths:
- **Mac**: `/Users/yourname/Documents/MyVault/.obsidian/plugins/`
- **Windows**: `C:\Users\yourname\Documents\MyVault\.obsidian\plugins\`
- **Linux**: `/home/yourname/Documents/MyVault/.obsidian/plugins/`

**If `.obsidian` folder is hidden:**
- **Mac**: Press `Cmd + Shift + .` to show hidden files
- **Windows**: View → Show → Hidden items
- **Linux**: Press `Ctrl + H` to show hidden files

### Step 2: Create Plugin Folder

Inside `.obsidian/plugins/`, create a new folder:
```
topic-task-manager
```

Full path should be:
```
YourVault/.obsidian/plugins/topic-task-manager/
```

### Step 3: Copy Plugin Files

Copy these 3 files into the `topic-task-manager` folder:

1. **main.js** (the plugin code)
2. **manifest.json** (plugin metadata)
3. **styles.css** (styling)

Your folder should look like:
```
topic-task-manager/
├── main.js
├── manifest.json
└── styles.css
```

### Step 4: Enable the Plugin

1. **Open Obsidian**
2. **Go to Settings** (gear icon)
3. **Community plugins** (in sidebar)
4. **Turn off "Restricted mode"** (if it's on)
5. **Click "Reload"** button
6. **Find "Topic-Based Task Manager"** in the list
7. **Toggle it ON**

You should see a clipboard icon in the left ribbon!

---

## Detailed Installation (Step-by-Step with Screenshots)

### Option A: Using Terminal/Command Line

**Mac/Linux:**
```bash
# Navigate to your vault
cd ~/Documents/MyVault

# Create plugin directory
mkdir -p .obsidian/plugins/topic-task-manager

# Copy files (assuming they're in your Downloads)
cp ~/Downloads/obsidian-task-manager-plugin/* .obsidian/plugins/topic-task-manager/
```

**Windows (PowerShell):**
```powershell
# Navigate to your vault
cd C:\Users\YourName\Documents\MyVault

# Create plugin directory
New-Item -ItemType Directory -Path .obsidian\plugins\topic-task-manager

# Copy files
Copy-Item C:\Users\YourName\Downloads\obsidian-task-manager-plugin\* .obsidian\plugins\topic-task-manager\
```

### Option B: Using Finder/File Explorer

1. **Open Finder (Mac) or File Explorer (Windows)**
2. **Navigate to your vault folder**
3. **Show hidden files:**
   - Mac: `Cmd + Shift + .`
   - Windows: View → Show hidden files
4. **Open `.obsidian` folder**
5. **Open `plugins` folder** (create if doesn't exist)
6. **Create new folder:** `topic-task-manager`
7. **Drag and drop** the 3 files into this folder

---

## Verification

### Check Installation

After enabling the plugin, you should see:

**1. Ribbon Icon**
- Look at the left sidebar
- You should see a 📋 clipboard icon
- Click it to test!

**2. Command Palette**
- Press `Cmd/Ctrl + P`
- Type "topic"
- You should see:
  - "Create New Topic"
  - "View Topics"
  - "View All Tasks"

**3. Test Create Topic**
- Click the clipboard icon
- Click "New Topic"
- Fill in a test topic
- Click "Create Topic"
- Check your vault - you should see a "Topics" folder with your new note!

---

## Troubleshooting

### "Plugin not appearing in list"

**Solution 1: Check file location**
```
YourVault/.obsidian/plugins/topic-task-manager/main.js   ✓ Should exist
YourVault/.obsidian/plugins/topic-task-manager/manifest.json   ✓ Should exist
```

**Solution 2: Restart Obsidian**
- Completely quit Obsidian
- Reopen it
- Go to Settings → Community plugins
- The plugin should appear

**Solution 3: Check manifest.json**
- Open `manifest.json` in a text editor
- Make sure it's valid JSON (no errors)

### "Restricted mode" prevents loading

1. Settings → Community plugins
2. Turn OFF "Restricted mode"
3. This allows you to use community plugins

### Plugin enabled but no ribbon icon

1. Settings → Community plugins
2. Toggle the plugin OFF then ON again
3. Restart Obsidian

### "Topics" folder not created

- The folder is created automatically when you create your first topic
- If it doesn't appear, create it manually in your vault root

---

## Updating the Plugin

When a new version is released:

1. **Download new files**
2. **Replace old files** in `.obsidian/plugins/topic-task-manager/`
3. **Reload plugin:**
   - Settings → Community plugins
   - Toggle plugin off/on
   - Or restart Obsidian

---

## Uninstallation

To remove the plugin:

1. **Disable in Obsidian:**
   - Settings → Community plugins
   - Toggle OFF "Topic-Based Task Manager"

2. **Delete plugin folder:**
   ```
   YourVault/.obsidian/plugins/topic-task-manager/
   ```

3. **Optional: Keep your topics**
   - Your topic notes in the "Topics" folder remain
   - You can still edit them manually
   - Or delete the "Topics" folder if you want

---

## Next Steps

Once installed:

1. **Read**: [README.md](README.md) for full usage guide
2. **Create your first topic**: Click clipboard icon
3. **Set keyboard shortcuts**: Settings → Hotkeys → Search "Topic"

Enjoy your topic-based task management in Obsidian! 🎉
