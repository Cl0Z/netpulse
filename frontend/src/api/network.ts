import { fetchApi } from './client';
import type { NetworkInterfaceMetric, NetworkHealthMetric } from '../types';

export interface LatestNetworkResponse {
  node_id: string;
  timestamp: string;
  interfaces: NetworkInterfaceMetric[];
}

export interface NetworkHistoryResponse {
  node_id: string;
  interface: string | null;
  range_minutes: number;
  count: number;
  metrics: (NetworkInterfaceMetric & { timestamp: string })[];
}

export interface NetworkHealthResponse {
  node_id: string;
  range_minutes: number;
  count: number;
  health: NetworkHealthMetric[];
}

export async function getLatestNetwork(nodeId: string): Promise<LatestNetworkResponse> {
  return fetchApi<LatestNetworkResponse>(`/api/v1/network/latest?node_id=${nodeId}`);
}

export async function getNetworkHistory(nodeId: string, minutes: number = 60, interfaceName?: string): Promise<NetworkHistoryResponse> {
  const url = interfaceName 
    ? `/api/v1/network/history?node_id=${nodeId}&interface=${interfaceName}&minutes=${minutes}`
    : `/api/v1/network/history?node_id=${nodeId}&minutes=${minutes}`;
  return fetchApi<NetworkHistoryResponse>(url);
}

export async function getNetworkHealth(nodeId: string, minutes: number = 60): Promise<NetworkHealthResponse> {
  return fetchApi<NetworkHealthResponse>(`/api/v1/network/health?node_id=${nodeId}&minutes=${minutes}`);
}
