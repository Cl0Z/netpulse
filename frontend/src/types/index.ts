export interface NodeInfo {
  id: string;
  hostname: string;
  platform: string;
  platform_version: string;
  status: string;
  last_seen: string;
}

export interface LatestMetrics {
  node: NodeInfo;
  timestamp: string;
  system: {
    cpu: {
      usage_percent: number;
    };
    memory: {
      usage_percent: number;
      used_bytes: number;
      available_bytes: number;
    };
    disk: {
      usage_percent: number;
      used_bytes: number;
      free_bytes: number;
    };
    uptime_seconds: number;
  };
}

export interface NetworkInterfaceMetric {
  interface: string;
  is_up: boolean;
  speed_mbps: number;
  bytes_sent: number;
  bytes_received: number;
  packets_sent: number;
  packets_received: number;
  errors_in: number;
  errors_out: number;
  drops_in: number;
  drops_out: number;
}

export interface NetworkHealthMetric {
  timestamp: string;
  target_name: string;
  target: string;
  reachable: boolean;
  latency_ms: number | null;
}
