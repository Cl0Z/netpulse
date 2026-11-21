import { fetchApi } from './client';
import type { LatestMetrics } from '../types';

export interface HistoryMetricsResponse {
  node_id: string;
  range_minutes: number;
  count: number;
  metrics: {
    timestamp: string;
    cpu_usage_percent: number;
    memory_usage_percent: number;
    disk_usage_percent: number;
    memory_used_bytes: number;
    memory_available_bytes: number;
    disk_used_bytes: number;
    disk_free_bytes: number;
    uptime_seconds: number;
  }[];
}

export async function getLatestMetrics(nodeId: string): Promise<LatestMetrics> {
  return fetchApi<LatestMetrics>(`/api/v1/metrics/latest?node_id=${nodeId}`);
}

export async function getMetricsHistory(nodeId: string, minutes: number = 60): Promise<HistoryMetricsResponse> {
  return fetchApi<HistoryMetricsResponse>(`/api/v1/metrics/history?node_id=${nodeId}&minutes=${minutes}`);
}
