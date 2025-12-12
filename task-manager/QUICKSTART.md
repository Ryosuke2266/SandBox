# Quick Start Guide

## First Time Setup

### Prerequisites
- Node.js (v14 or higher) - Download from https://nodejs.org/

### Installation Steps

1. **Open terminal/command prompt** and navigate to the task-manager folder:
   ```bash
   cd task-manager
   ```

2. **Install all dependencies** (this may take a few minutes):
   ```bash
   npm run install-all
   ```

   This will install dependencies for both backend and frontend.

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Open your web browser** and go to:
   - http://localhost:3000

That's it! The app should now be running.

## Starting the App (After First Setup)

### Option 1: Use the convenience scripts

**On Mac/Linux:**
```bash
./start.sh
```

**On Windows:**
```
start.bat
```

### Option 2: Use npm
```bash
npm start
```

## Stopping the App

Press `Ctrl+C` in the terminal window where the app is running.

## Tips

- Your data is automatically saved in `backend/tasks.json`
- You can copy the entire `task-manager` folder to another computer
- On the new computer, just run `npm run install-all` and `npm start` again
- To backup your data, copy `backend/tasks.json` to a safe location

## Troubleshooting

### "Port already in use" error
Another application is using port 3000 or 3001. Close other applications or:
- Edit `frontend/vite.config.js` to change frontend port
- Edit `backend/server.js` to change backend PORT constant

### Dependencies not installing
Make sure you have internet connection and Node.js installed. Try:
```bash
rm -rf node_modules
npm cache clean --force
npm run install-all
```

### "Node not found"
Install Node.js from https://nodejs.org/ and restart your terminal.

## Need Help?

Check the main README.md for detailed documentation and feature guide.
