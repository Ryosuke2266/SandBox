@echo off
echo ==================================================
echo   Task Manager - Portable Task Management Tool
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node -v
echo.

REM Check if dependencies are installed
if not exist "backend\node_modules" (
    echo Installing dependencies...
    call npm run install-all
    echo.
)

if not exist "frontend\node_modules" (
    echo Installing dependencies...
    call npm run install-all
    echo.
)

echo Starting Task Manager...
echo.
echo Backend API will run on: http://localhost:3001
echo Frontend will open on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start the application
call npm start
