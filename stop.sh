#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================"
echo "       STOPPING NETPULSE"
echo "================================"
echo

# Stop frontend
if [ -f "$PROJECT_DIR/frontend.pid" ]; then
    PID=$(cat "$PROJECT_DIR/frontend.pid")

    if kill -0 "$PID" 2>/dev/null; then
        echo "[*] Stopping frontend..."
        kill "$PID"
    fi

    rm -f "$PROJECT_DIR/frontend.pid"
fi

# Stop agent
if [ -f "$PROJECT_DIR/agent.pid" ]; then
    PID=$(cat "$PROJECT_DIR/agent.pid")

    if kill -0 "$PID" 2>/dev/null; then
        echo "[*] Stopping agent..."
        kill "$PID"
    fi

    rm -f "$PROJECT_DIR/agent.pid"
fi

# Stop backend
if [ -f "$PROJECT_DIR/backend.pid" ]; then
    PID=$(cat "$PROJECT_DIR/backend.pid")

    if kill -0 "$PID" 2>/dev/null; then
        echo "[*] Stopping backend..."
        kill "$PID"
    fi

    rm -f "$PROJECT_DIR/backend.pid"
fi

echo "[✓] NetPulse application stopped"

