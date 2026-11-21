from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    hostname: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(100))
    platform_version: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    last_seen: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(50), default="online")


class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    node_id: Mapped[str] = mapped_column(
        ForeignKey("nodes.id")
    )

    timestamp: Mapped[datetime] = mapped_column(DateTime)

    cpu_usage_percent: Mapped[float] = mapped_column(Float)

    memory_usage_percent: Mapped[float] = mapped_column(Float)
    memory_used_bytes: Mapped[int] = mapped_column(BigInteger)
    memory_available_bytes: Mapped[int] = mapped_column(BigInteger)

    disk_usage_percent: Mapped[float] = mapped_column(Float)
    disk_used_bytes: Mapped[int] = mapped_column(BigInteger)
    disk_free_bytes: Mapped[int] = mapped_column(BigInteger)

    uptime_seconds: Mapped[float] = mapped_column(Float)


class NetworkMetric(Base):
    __tablename__ = "network_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    node_id: Mapped[str] = mapped_column(
        ForeignKey("nodes.id")
    )

    timestamp: Mapped[datetime] = mapped_column(DateTime)

    interface: Mapped[str] = mapped_column(String(100))
    is_up: Mapped[bool]
    speed_mbps: Mapped[int]

    bytes_sent: Mapped[int] = mapped_column(BigInteger)
    bytes_received: Mapped[int] = mapped_column(BigInteger)

    packets_sent: Mapped[int] = mapped_column(BigInteger)
    packets_received: Mapped[int] = mapped_column(BigInteger)

    errors_in: Mapped[int] = mapped_column(BigInteger)
    errors_out: Mapped[int] = mapped_column(BigInteger)

    drops_in: Mapped[int] = mapped_column(BigInteger)
    drops_out: Mapped[int] = mapped_column(BigInteger)


class NetworkHealth(Base):
    __tablename__ = "network_health"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    node_id: Mapped[str] = mapped_column(
        ForeignKey("nodes.id")
    )

    timestamp: Mapped[datetime] = mapped_column(DateTime)

    target_name: Mapped[str] = mapped_column(String(100))
    target: Mapped[str] = mapped_column(String(255))

    reachable: Mapped[bool]
    latency_ms: Mapped[float | None]
