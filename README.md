# NetPulse 🌐⚡

**NetPulse** is a lightweight, full-stack network and system telemetry monitoring platform designed for homelabs, home servers, and local infrastructure. It continuously collects system performance metrics, network interface throughput, and ping latencies for local gateways, DNS providers, and custom host targets, presenting everything through a modern, real-time dashboard.

---

## 📸 Screenshots

<!-- Place your actual screenshots inside the assets/ directory matching these filenames -->

### System & Dashboard Overview
![Dashboard Overview](assets/dashboard.png)
*Real-time CPU, RAM, and Disk utilization, uptime metrics, along with historical trend charts and gateway status.*

---

### Connections & Latency Monitoring
![Connections Monitor](assets/connections.png)
*Active monitoring for local gateways, public DNS services, and user-defined targets with latency (ms) and reachability status.*

---

### Network Interface Statistics & Throughput
![Network Stats](assets/network-stats.png)
*Live throughput rates, total bytes sent/received, packet rates, and drop/error diagnostics across all network interfaces.*

---

## ✨ Features

- **Real-Time System Telemetry**: Tracks CPU load, memory allocation, storage capacity, and system uptime.
- **Network Interface Analytics**: Detailed breakdown of every network adapter (status, link speed, packet counters, drops, and errors).
- **Target Health & Ping Probing**: Continual ICMP ping tests to measure latency (ms) and packet reachability to gateways, DNS resolvers, and custom nodes.
- **Dynamic Connection Management**: Easily add and manage custom target endpoints directly from the UI without modifying agent configuration files manually.
- **Historical Timeseries Visualizations**: Interactive charts powered by Recharts to inspect performance spikes and bandwidth trends over time.
- **Autonomous Lightweight Agent**: Python daemon collecting and shipping metrics with minimal CPU and memory overhead.
- **Production-Ready Persistence**: PostgreSQL database backing timeseries telemetry and configuration states.
- **One-Click Orchestration**: Bash automation scripts (`start.sh` and `stop.sh`) for managing the database container, FastAPI service, Python agent, and Vite web client.

---

## 🏗️ Architecture & How It Works

```
┌────────────────────────────────────────────────────────┐
│                      Target Host                       │
│                                                        │
│  ┌─────────────────┐           ┌────────────────────┐  │
│  │  System & NICs  │           │ ICMP / Ping Probes │  │
│  │ (psutil / proc) │           │ (Gateway/DNS/Nodes)│  │
│  └────────┬────────┘           └─────────┬──────────┘  │
│           │                              │             │
│           └──────────────┬───────────────┘             │
│                          ▼                             │
│               ┌─────────────────────┐                  │
│               │   NetPulse Agent    │                  │
│               │  (Python Collector) │                  │
│               └──────────┬──────────┘                  │
└──────────────────────────┼─────────────────────────────┘
                           │ HTTP POST (Telemetry Payload)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Backend & Storage                    │
│                                                        │
│               ┌─────────────────────┐                  │
│               │    FastAPI Server   │ (Port 8000)      │
│               └──────────┬──────────┘                  │
│                          ▼                             │
│               ┌─────────────────────┐                  │
│               │ PostgreSQL Database │ (Docker Container)│
│               └─────────────────────┘                  │
└──────────────────────────┼─────────────────────────────┘
                           │ REST API / JSON
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Web Client (UI)                     │
│                                                        │
│        React 19 + TypeScript + Vite + Recharts         │
│                     (Port 5173)                        │
└────────────────────────────────────────────────────────┘
```

### 1. Data Collection (`agent/`)
- The agent wakes up at a configurable cadence (default: every 10 seconds).
- **System Metrics**: Reads CPU percentages, RAM usage, and disk space.
- **Network Metrics**: Iterates over active network adapters to measure incremental bytes, packets, and interface flags.
- **Health Targets**: Automatically resolves default gateway routing and checks external targets (such as `1.1.1.1` or `8.8.8.8`) as well as custom user-registered targets stored in the database.
- Packages and transmits an atomic JSON payload to the backend REST API.

### 2. Ingestion & API Layer (`backend/`)
- Powered by **FastAPI** with **SQLAlchemy ORM**.
- Validates inbound telemetry via Pydantic models.
- Stores historical metrics into normalized relational tables (`nodes`, `system_metrics`, `network_metrics`, `network_health`, and `custom_targets`).
- Serves filtered historical metrics with time-windowing parameters (`?minutes=60`).
- Provides interactive Swagger/OpenAPI documentation at `http://localhost:8000/docs`.

### 3. User Interface (`frontend/`)
- Built with **React 19**, **TypeScript**, and **Vite**.
- Styled using clean, responsive CSS with CSS variables, cards, and smooth hover states.
- Utilizes **Recharts** for visualizing historical trends and responsive gauges.
- Periodically polls the backend for fresh telemetry to reflect real-time infrastructure state.

---

## 📁 Project Structure

```
netpulse/
├── agent/                      # Telemetry collector daemon
│   ├── collectors/             # Individual metric collectors
│   │   ├── health.py           # ICMP ping & latency logic
│   │   ├── network.py          # Interface stats & throughput
│   │   └── system.py           # CPU, memory, disk, uptime
│   ├── client.py               # HTTP client transmitting metrics
│   ├── config.py               # Agent target & gateway discovery
│   └── main.py                 # Collection loop runner
├── backend/                    # FastAPI REST backend
│   ├── database/               # Database connection and table schemas
│   ├── models/                 # SQLAlchemy ORM definitions
│   ├── routers/                # API route handlers (metrics, connections)
│   └── main.py                 # Application entry point & CORS configuration
├── database/                   # Containerized persistence
│   └── compose.example.yml     # PostgreSQL 17 Docker Compose template
├── frontend/                   # React + TypeScript dashboard
│   ├── public/                 # Static assets & icons
│   └── src/
│       ├── api/                # Typed API client functions
│       ├── components/         # Modular layout, cards, and charts
│       ├── pages/              # Dashboard, Connections, Network Stats
│       └── types/              # TypeScript data interfaces
├── assets/                     # Screenshot placeholders for documentation
├── start.sh                    # Automated startup script
└── stop.sh                     # Graceful service shutdown script
```

---

## 🚀 Getting Started

### Prerequisites

- **Linux** (Debian, Ubuntu, or similar distribution recommended)
- **Python 3.10+** with `venv` support
- **Node.js 18+** & `npm`
- **Docker** and **Docker Compose** (for PostgreSQL)
- Standard utilities: `ping`, `iproute2`

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/netpulse.git
cd netpulse
```

---

### Step 2: Configure Environment & Database

#### 1. Database Setup (Docker)
Copy the example compose file and start the PostgreSQL container:
```bash
cp database/compose.example.yml database/compose.yml
# (Optional) Edit POSTGRES_PASSWORD in database/compose.yml
docker compose -f database/compose.yml up -d
```

#### 2. Backend Configuration
Create `backend/.env`:
```env
DATABASE_URL=postgresql://netpulse:your_secure_password@localhost:5432/netpulse
```

#### Frontend Configuration
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

> **Note**: Replace `localhost` with your host machine's private LAN IP (e.g. `192.168.1.50`) if accessing the dashboard from other devices on your home network.

---

### Step 3: Initialize Virtual Environments & Dependencies

#### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m database.init_db
deactivate
cd ..
```

#### 2. Agent Setup
```bash
cd agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

### Step 4: Start NetPulse

Start all components (PostgreSQL container, Backend API, Telemetry Agent, and Frontend Dev Server) using the included launcher:

```bash
chmod +x start.sh stop.sh
./start.sh
```

The script will launch:
1. **PostgreSQL** on port `5432`
2. **Backend API** at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)
3. **Telemetry Agent** streaming metrics in the background
4. **Web Dashboard** at `http://localhost:5173`

To monitor individual service logs:
```bash
tail -f backend.log
tail -f agent.log
tail -f frontend.log
```

---

### Step 5: Stopping Services

To stop all running processes cleanly:

```bash
./stop.sh
```

---

## 🔒 Security & Privacy Practices

- **Sanitized Network Addresses**: NetPulse is designed for internal network monitoring. Never expose port `8000` or `5432` to the public internet without proper reverse proxy authentication (e.g., Traefik, Caddy, or Nginx with Authelia/Authentik).
- **Credential Protection**: Always keep `.env` files in your `.gitignore`. Use strong passwords for PostgreSQL.
- **Mock IP Notation**: Any IP references in this repository use RFC 5737 (`192.0.2.0/24`) or RFC 1918 private subnets (`192.168.1.0/24`, `10.0.0.0/8`) for documentation clarity.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a pull request.
