import platform
import subprocess
import re


def ping_host(host, timeout=2):
    if platform.system().lower() == "windows":
        command = ["ping", "-n", "1", "-w", str(timeout * 1000), host]
    else:
        command = ["ping", "-c", "1", "-W", str(timeout), host]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout + 1,
        )

        if result.returncode != 0:
            return {
                "reachable": False,
                "latency_ms": None,
            }

        match = re.search(r"time[=<]([\d.]+)\s*ms", result.stdout)

        latency = float(match.group(1)) if match else None

        return {
            "reachable": True,
            "latency_ms": latency,
        }

    except (subprocess.TimeoutExpired, OSError):
        return {
            "reachable": False,
            "latency_ms": None,
        }


def get_network_health(targets):
    return {
        name: {
            "target": address,
            **ping_host(address),
        }
        for name, address in targets.items()
    }
