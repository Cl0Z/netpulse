#!/bin/bash

set -e

PROJECT_DIR="$HOME/netpulse"

BACKEND_DIR="$PROJECT_DIR/backend"
AGENT_DIR="$PROJECT_DIR/agent"
FRONTEND_DIR="$PROJECT_DIR/frontend"

BACKEND_VENV="$BACKEND_DIR/.venv/bin/activate"
AGENT_VENV="$AGENT_DIR/.venv/bin/activate"

BACKEND_LOG="$PROJECT_DIR/backend.log"
AGENT_LOG="$PROJECT_DIR/agent.log"
FRONTEND_LOG="$PROJECT_DIR/frontend.log"

echo "================================"
echo "          NETPULSE"
echo "================================"
echo

# --------------------------------
# PostgreSQL
# --------------------------------

echo "[1/4] Checking PostgreSQL..."

if docker ps --format '{{.Names}}' | grep -q '^netpulse-postgres$'; then
    echo "[✓] PostgreSQL already running"
else
    echo "[*] Starting PostgreSQL..."
    docker start netpulse-postgres >/dev/null
    echo "[✓] PostgreSQL started"
fi

# --------------------------------
# Backend
# --------------------------------

echo "[2/4] Starting backend..."

if pgrep -f "uvicorn main:app --host 0.0.0.0 --port 8000" >/dev/null; then
    echo "[✓] Backend already running"
else
    cd "$BACKEND_DIR"

    source "$BACKEND_VENV"

    nohup uvicorn main:app \
        --host 0.0.0.0 \
        --port 8000 \
        > "$BACKEND_LOG" 2>&1 &

    echo $! > "$PROJECT_DIR/backend.pid"

    sleep 2

    if pgrep -f "uvicorn main:app --host 0.0.0.0 --port 8000" >/dev/null; then
        echo "[✓] Backend started on port 8000"
    else
        echo "[!] Backend failed to start"
        echo "Check: $BACKEND_LOG"
        exit 1
    fi
fi

# --------------------------------
# Agent
# --------------------------------

echo "[3/4] Starting agent..."

if [ -f "$PROJECT_DIR/agent.pid" ] && kill -0 "$(cat "$PROJECT_DIR/agent.pid")" 2>/dev/null; then
    echo "[✓] Agent already running"
else
    cd "$AGENT_DIR"

    source "$AGENT_VENV"

    nohup python main.py \
        > "$AGENT_LOG" 2>&1 &

    AGENT_PID=$!
    echo "$AGENT_PID" > "$PROJECT_DIR/agent.pid"

    sleep 2

    if kill -0 "$AGENT_PID" 2>/dev/null; then
        echo "[✓] Agent started"
    else
        echo "[!] Agent failed to start"
        echo "Check: $AGENT_LOG"
        rm -f "$PROJECT_DIR/agent.pid"
        exit 1
    fi
fi

# --------------------------------
# Frontend
# --------------------------------

echo "[4/4] Starting frontend..."

if pgrep -f "vite" >/dev/null; then
    echo "[✓] Frontend already running"
else
    cd "$FRONTEND_DIR"

    nohup npm run dev -- --host 0.0.0.0 \
        > "$FRONTEND_LOG" 2>&1 &

    echo $! > "$PROJECT_DIR/frontend.pid"

    sleep 3

    if pgrep -f "vite" >/dev/null; then
        echo "[✓] Frontend started"
    else
        echo "[!] Frontend failed to start"
        echo "Check: $FRONTEND_LOG"
        exit 1
    fi
fi

echo
echo "================================"
echo "      NETPULSE IS RUNNING"
echo "================================"
echo
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo
echo "Logs:"
echo "  Backend:  ~/netpulse/backend.log"
echo "  Agent:    ~/netpulse/agent.log"
echo "  Frontend: ~/netpulse/frontend.log"
echo
echo "Stop everything with:"
echo "  ./stop.sh"
echo
