import platform
import time

import psutil


def get_system_metrics():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    cpu = psutil.cpu_percent(interval=1)

    return {
        "hostname": platform.node(),
        "platform": platform.system(),
        "platform_version": platform.release(),
        "cpu": {
            "usage_percent": cpu,
            "core_count": psutil.cpu_count(),
        },
        "memory": {
            "usage_percent": memory.percent,
            "used_bytes": memory.used,
            "available_bytes": memory.available,
            "total_bytes": memory.total,
        },
        "disk": {
            "usage_percent": disk.percent,
            "used_bytes": disk.used,
            "free_bytes": disk.free,
            "total_bytes": disk.total,
        },
        "uptime_seconds": time.time() - psutil.boot_time(),
    }
