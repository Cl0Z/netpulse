from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session
from routers.metrics import router as metrics_router
from database.connection import Base, engine, get_db
from models.metrics import (
    Node,
    SystemMetric,
    NetworkMetric,
    NetworkHealth,
)


# Create database tables if they don't already exist
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="NetPulse API",
    version="0.1.0",
)
app.include_router(metrics_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Add your local network frontend URL here if needed, e.g.:
        # "http://YOUR_LOCAL_IP:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------
# Request Models
# -----------------------------

class MetricsPayload(BaseModel):
    timestamp: str
    system: dict
    network: dict
    network_health: dict


# -----------------------------
# Health Check
# -----------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "netpulse-api",
    }


# -----------------------------
# Receive Metrics
# -----------------------------

@app.post("/api/v1/metrics")
def receive_metrics(
    payload: MetricsPayload,
    db: Session = Depends(get_db),
):
    timestamp = datetime.fromisoformat(payload.timestamp)

    system = payload.system
    hostname = system["hostname"]

    # -----------------------------
    # Find or create node
    # -----------------------------

    node = db.get(Node, hostname)

    if node is None:
        node = Node(
            id=hostname,
            hostname=hostname,
            platform=system["platform"],
            platform_version=system["platform_version"],
            created_at=timestamp,
            last_seen=timestamp,
            status="online",
        )

        db.add(node)

        # Make sure the node exists in PostgreSQL
        # before inserting metrics referencing it.
        db.flush()

    else:
        node.last_seen = timestamp
        node.status = "online"

    # -----------------------------
    # System metrics
    # -----------------------------

    cpu = system["cpu"]
    memory = system["memory"]
    disk = system["disk"]

    system_metric = SystemMetric(
        node_id=hostname,
        timestamp=timestamp,

        cpu_usage_percent=cpu["usage_percent"],

        memory_usage_percent=memory["usage_percent"],
        memory_used_bytes=memory["used_bytes"],
        memory_available_bytes=memory["available_bytes"],

        disk_usage_percent=disk["usage_percent"],
        disk_used_bytes=disk["used_bytes"],
        disk_free_bytes=disk["free_bytes"],

        uptime_seconds=system["uptime_seconds"],
    )

    db.add(system_metric)

    # -----------------------------
    # Network interface metrics
    # -----------------------------

    for interface, data in payload.network.items():

        network_metric = NetworkMetric(
            node_id=hostname,
            timestamp=timestamp,

            interface=interface,
            is_up=data["is_up"],
            speed_mbps=data["speed_mbps"],

            bytes_sent=data["bytes_sent"],
            bytes_received=data["bytes_received"],

            packets_sent=data["packets_sent"],
            packets_received=data["packets_received"],

            errors_in=data["errors_in"],
            errors_out=data["errors_out"],

            drops_in=data["drops_in"],
            drops_out=data["drops_out"],
        )

        db.add(network_metric)

    # -----------------------------
    # Network health metrics
    # -----------------------------

    for target_name, data in payload.network_health.items():

        health_metric = NetworkHealth(
            node_id=hostname,
            timestamp=timestamp,

            target_name=target_name,
            target=data["target"],

            reachable=data["reachable"],
            latency_ms=data["latency_ms"],
        )

        db.add(health_metric)

    # -----------------------------
    # Commit everything
    # -----------------------------

    db.commit()

    return {
        "status": "accepted",
        "node": hostname,
        "timestamp": payload.timestamp,
    }
