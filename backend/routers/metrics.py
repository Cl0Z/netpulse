from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from database.connection import get_db
from models.metrics import (
    Node,
    SystemMetric,
    NetworkMetric,
    NetworkHealth,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Metrics"],
)


# ============================================================
# SYSTEM METRICS
# ============================================================

@router.get("/metrics/latest")
def get_latest_metrics(
    node_id: str,
    db: Session = Depends(get_db),
):
    node = db.get(Node, node_id)

    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found",
        )

    metric = (
        db.query(SystemMetric)
        .filter(SystemMetric.node_id == node_id)
        .order_by(desc(SystemMetric.timestamp))
        .first()
    )

    if metric is None:
        raise HTTPException(
            status_code=404,
            detail=f"No metrics found for node '{node_id}'",
        )

    return {
        "node": {
            "id": node.id,
            "hostname": node.hostname,
            "platform": node.platform,
            "platform_version": node.platform_version,
            "status": node.status,
            "last_seen": node.last_seen,
        },
        "timestamp": metric.timestamp,
        "system": {
            "cpu": {
                "usage_percent": metric.cpu_usage_percent,
            },
            "memory": {
                "usage_percent": metric.memory_usage_percent,
                "used_bytes": metric.memory_used_bytes,
                "available_bytes": metric.memory_available_bytes,
            },
            "disk": {
                "usage_percent": metric.disk_usage_percent,
                "used_bytes": metric.disk_used_bytes,
                "free_bytes": metric.disk_free_bytes,
            },
            "uptime_seconds": metric.uptime_seconds,
        },
    }


@router.get("/metrics/history")
def get_metrics_history(
    node_id: str,
    minutes: int = 60,
    db: Session = Depends(get_db),
):
    node = db.get(Node, node_id)

    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found",
        )

    if minutes < 1 or minutes > 10080:
        raise HTTPException(
            status_code=400,
            detail="minutes must be between 1 and 10080",
        )

    now = datetime.now(timezone.utc)
    start_time = now - timedelta(minutes=minutes)

    metrics = (
        db.query(SystemMetric)
        .filter(
            SystemMetric.node_id == node_id,
            SystemMetric.timestamp >= start_time,
        )
        .order_by(SystemMetric.timestamp.asc())
        .all()
    )

    return {
        "node_id": node_id,
        "range_minutes": minutes,
        "count": len(metrics),
        "metrics": [
            {
                "timestamp": metric.timestamp,
                "cpu_usage_percent": metric.cpu_usage_percent,
                "memory_usage_percent": metric.memory_usage_percent,
                "disk_usage_percent": metric.disk_usage_percent,
                "memory_used_bytes": metric.memory_used_bytes,
                "memory_available_bytes": metric.memory_available_bytes,
                "disk_used_bytes": metric.disk_used_bytes,
                "disk_free_bytes": metric.disk_free_bytes,
                "uptime_seconds": metric.uptime_seconds,
            }
            for metric in metrics
        ],
    }


# ============================================================
# NETWORK METRICS
# ============================================================

@router.get("/network/latest")
def get_latest_network_metrics(
    node_id: str,
    db: Session = Depends(get_db),
):
    node = db.get(Node, node_id)

    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found",
        )

    # Get the newest timestamp for this node
    latest_timestamp = (
        db.query(NetworkMetric.timestamp)
        .filter(NetworkMetric.node_id == node_id)
        .order_by(desc(NetworkMetric.timestamp))
        .first()
    )

    if latest_timestamp is None:
        raise HTTPException(
            status_code=404,
            detail=f"No network metrics found for node '{node_id}'",
        )

    timestamp = latest_timestamp[0]

    metrics = (
        db.query(NetworkMetric)
        .filter(
            NetworkMetric.node_id == node_id,
            NetworkMetric.timestamp == timestamp,
        )
        .order_by(NetworkMetric.interface.asc())
        .all()
    )

    return {
        "node_id": node_id,
        "timestamp": timestamp,
        "interfaces": [
            {
                "interface": metric.interface,
                "is_up": metric.is_up,
                "speed_mbps": metric.speed_mbps,
                "bytes_sent": metric.bytes_sent,
                "bytes_received": metric.bytes_received,
                "packets_sent": metric.packets_sent,
                "packets_received": metric.packets_received,
                "errors_in": metric.errors_in,
                "errors_out": metric.errors_out,
                "drops_in": metric.drops_in,
                "drops_out": metric.drops_out,
            }
            for metric in metrics
        ],
    }


@router.get("/network/history")
def get_network_history(
    node_id: str,
    interface: str | None = None,
    minutes: int = 60,
    db: Session = Depends(get_db),
):
    node = db.get(Node, node_id)

    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found",
        )

    if minutes < 1 or minutes > 10080:
        raise HTTPException(
            status_code=400,
            detail="minutes must be between 1 and 10080",
        )

    now = datetime.now(timezone.utc)
    start_time = now - timedelta(minutes=minutes)

    query = (
        db.query(NetworkMetric)
        .filter(
            NetworkMetric.node_id == node_id,
            NetworkMetric.timestamp >= start_time,
        )
    )

    if interface:
        query = query.filter(
            NetworkMetric.interface == interface
        )

    metrics = (
        query
        .order_by(
            NetworkMetric.timestamp.asc(),
            NetworkMetric.interface.asc(),
        )
        .all()
    )

    return {
        "node_id": node_id,
        "interface": interface,
        "range_minutes": minutes,
        "count": len(metrics),
        "metrics": [
            {
                "timestamp": metric.timestamp,
                "interface": metric.interface,
                "is_up": metric.is_up,
                "speed_mbps": metric.speed_mbps,
                "bytes_sent": metric.bytes_sent,
                "bytes_received": metric.bytes_received,
                "packets_sent": metric.packets_sent,
                "packets_received": metric.packets_received,
                "errors_in": metric.errors_in,
                "errors_out": metric.errors_out,
                "drops_in": metric.drops_in,
                "drops_out": metric.drops_out,
            }
            for metric in metrics
        ],
    }


# ============================================================
# NETWORK HEALTH
# ============================================================

@router.get("/network/health")
def get_network_health(
    node_id: str,
    minutes: int = 60,
    db: Session = Depends(get_db),
):
    node = db.get(Node, node_id)

    if node is None:
        raise HTTPException(
            status_code=404,
            detail=f"Node '{node_id}' not found",
        )

    if minutes < 1 or minutes > 10080:
        raise HTTPException(
            status_code=400,
            detail="minutes must be between 1 and 10080",
        )

    now = datetime.now(timezone.utc)
    start_time = now - timedelta(minutes=minutes)

    metrics = (
        db.query(NetworkHealth)
        .filter(
            NetworkHealth.node_id == node_id,
            NetworkHealth.timestamp >= start_time,
        )
        .order_by(
            NetworkHealth.timestamp.asc(),
            NetworkHealth.target_name.asc(),
        )
        .all()
    )

    return {
        "node_id": node_id,
        "range_minutes": minutes,
        "count": len(metrics),
        "health": [
            {
                "timestamp": metric.timestamp,
                "target_name": metric.target_name,
                "target": metric.target,
                "reachable": metric.reachable,
                "latency_ms": metric.latency_ms,
            }
            for metric in metrics
        ],
    }
