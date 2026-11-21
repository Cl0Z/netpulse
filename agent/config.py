import socket
import subprocess


def get_default_gateway():
    result = subprocess.run(
        ["ip", "route", "show", "default"],
        capture_output=True,
        text=True,
        check=True,
    )

    parts = result.stdout.split()

    if "via" in parts:
        return parts[parts.index("via") + 1]

    return None


def get_config():
    return {
        "hostname": socket.gethostname(),
        "gateway": get_default_gateway(),
        "external_targets": {
            "cloudflare_dns": "1.1.1.1",
        },
    }
