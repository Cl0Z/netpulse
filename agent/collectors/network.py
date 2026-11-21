import psutil


def get_network_metrics():
    interfaces = {}

    stats = psutil.net_if_stats()
    counters = psutil.net_io_counters(pernic=True)

    for interface, interface_stats in stats.items():
        counter = counters.get(interface)

        if counter is None:
            continue

        interfaces[interface] = {
            "is_up": interface_stats.isup,
            "speed_mbps": interface_stats.speed,
            "bytes_sent": counter.bytes_sent,
            "bytes_received": counter.bytes_recv,
            "packets_sent": counter.packets_sent,
            "packets_received": counter.packets_recv,
            "errors_in": counter.errin,
            "errors_out": counter.errout,
            "drops_in": counter.dropin,
            "drops_out": counter.dropout,
        }

    return interfaces
