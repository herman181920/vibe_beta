#!/bin/bash
# Run this script to start the development servers

echo "Starting ai-powered-app..."
echo "=========================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start servers
echo ""
echo "Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

echo "Starting frontend server..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "Servers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
