import json
import time
from datetime import datetime, timezone

from config import get_config
from collectors.system import get_system_metrics
from collectors.network import get_network_metrics
from collectors.health import get_network_health
from client import send_metrics


COLLECTION_INTERVAL = 10


def collect_metrics():
    config = get_config()

    targets = {
        "gateway": config["gateway"],
        **config["external_targets"],
    }

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "system": get_system_metrics(),
        "network": get_network_metrics(),
        "network_health": get_network_health(targets),
    }


def main():
    print("NetPulse Agent started")
    print(f"Collection interval: {COLLECTION_INTERVAL} seconds")
    print()

    while True:
        try:
            metrics = collect_metrics()

            result = send_metrics(metrics)

            timestamp = metrics["timestamp"]
            hostname = metrics["system"]["hostname"]

            cpu = metrics["system"]["cpu"]["usage_percent"]
            memory = metrics["system"]["memory"]["usage_percent"]
            disk = metrics["system"]["disk"]["usage_percent"]

            print(
                f"[{timestamp}] "
                f"{hostname} | "
                f"CPU: {cpu:.1f}% | "
                f"RAM: {memory:.1f}% | "
                f"Disk: {disk:.1f}% | "
                f"API: {result.get('status', 'unknown')}",
                flush=True,
            )

        except Exception as error:
            print(
                f"[ERROR] Failed to collect/send metrics: {error}",
                flush=True,
            )

        time.sleep(COLLECTION_INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nNetPulse Agent stopped.")
