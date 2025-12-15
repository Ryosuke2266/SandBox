#!/bin/bash

echo "=================================================="
echo "  Task Manager - Portable Task Management Tool   "
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
    echo ""
fi

echo "🚀 Starting Task Manager..."
echo ""
echo "Backend API will run on: http://localhost:3001"
echo "Frontend will open on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start the application
npm start
