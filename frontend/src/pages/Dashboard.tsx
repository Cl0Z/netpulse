import { useState, useEffect, useCallback, useRef } from 'react';
import type { HistoryMetricsResponse } from '../api/metrics';
import type { LatestNetworkResponse, NetworkHealthResponse } from '../api/network';
import type { LatestMetrics } from '../types';

import { getLatestMetrics, getMetricsHistory } from '../api/metrics';
import { getLatestNetwork, getNetworkHealth } from '../api/network';
import { formatBytes } from '../utils/networkRate';

import { SystemMetricCard } from '../components/cards/SystemMetricCard';
import { MetricChart } from '../components/charts/MetricChart';
import { NetworkInterfaces } from '../components/network/NetworkInterfaces';
import { GatewayHealth } from '../components/network/GatewayHealth';


interface DashboardProps {
  nodeId: string;
  onStatusChange: (isOnline: boolean, nodeName: string, ip: string) => void;
}


export const Dashboard: React.FC<DashboardProps> = ({ nodeId, onStatusChange }) => {

  // -----------------------------
  // State
  // -----------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [latestMetrics, setLatestMetrics] = useState<LatestMetrics | null>(null);
  const [historyMetrics, setHistoryMetrics] = useState<HistoryMetricsResponse | null>(null);

  const [currentNetwork, setCurrentNetwork] =
    useState<LatestNetworkResponse | null>(null);

  const [previousNetwork, setPreviousNetwork] =
    useState<LatestNetworkResponse | null>(null);

  const [networkHealth, setNetworkHealth] =
    useState<NetworkHealthResponse | null>(null);

  // Keep previous network data without causing fetchData/useEffect
  // to be recreated every time the network state changes.
  const previousNetworkRef = useRef<LatestNetworkResponse | null>(null);


  // -----------------------------
  // Fetch latest telemetry
  // -----------------------------

  const fetchData = useCallback(async (isInitial = false) => {

    try {

      if (isInitial) {
        setLoading(true);
      }

      const [latest, network, health] = await Promise.all([
        getLatestMetrics(nodeId),
        getLatestNetwork(nodeId),
        getNetworkHealth(nodeId, 5),
      ]);


      // -----------------------------
      // System metrics
      // -----------------------------

      setLatestMetrics(latest);


      // -----------------------------
      // Network metrics
      // -----------------------------

      const previous = previousNetworkRef.current;

      setPreviousNetwork(previous);
      setCurrentNetwork(network);

      // Store current network data for the next poll.
      previousNetworkRef.current = network;


      // -----------------------------
      // Network health
      // -----------------------------

      setNetworkHealth(health);


      // -----------------------------
      // Node status
      // -----------------------------

      if (latest && latest.node) {

        onStatusChange(
          true,
          latest.node.hostname,
          latest.node.id
        );
      }


      setError(null);

    } catch (err: any) {

      console.error(
        'Error fetching dashboard data:',
        err
      );

      // Only show connection error during initial load.
      // Don't blank the dashboard during polling failures.
      if (isInitial) {
        setError(
          err.message ||
          'Failed to connect to backend'
        );
      }

      onStatusChange(
        false,
        'home-server',
        'Unknown'
      );

    } finally {

      if (isInitial) {
        setLoading(false);
      }

    }

  }, [nodeId, onStatusChange]);


  // -----------------------------
  // Fetch historical metrics
  // -----------------------------

  const fetchHistory = useCallback(async () => {

    try {

      const history =
        await getMetricsHistory(nodeId, 60);

      setHistoryMetrics(history);

    } catch (err) {

      console.error(
        'Error fetching history:',
        err
      );

    }

  }, [nodeId]);


  // -----------------------------
  // Initial load + polling
  // -----------------------------

  useEffect(() => {

    fetchData(true);
    fetchHistory();


    // Latest telemetry every 10 seconds
    const intervalLatest = setInterval(() => {

      fetchData(false);

    }, 10000);


    // Historical data every 60 seconds
    const intervalHistory = setInterval(() => {

      fetchHistory();

    }, 60000);


    return () => {

      clearInterval(intervalLatest);
      clearInterval(intervalHistory);

    };

  }, [fetchData, fetchHistory]);


  // -----------------------------
  // Initial loading screen
  // -----------------------------

  if (loading) {

    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-on-surface-variant)'
        }}
      >
        Loading telemetry data...
      </div>
    );

  }


  // -----------------------------
  // Initial connection error
  // -----------------------------

  if (error && !latestMetrics) {

    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)'
        }}
      >

        <div
          style={{
            textAlign: 'center',
            backgroundColor:
              'var(--color-surface-container-lowest)',
            padding: '24px',
            borderRadius:
              'var(--rounded-lg)',
            boxShadow:
              'var(--shadow-card)'
          }}
        >

          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}
          >
            error
          </span>

          <h2
            style={{
              marginBottom: '8px'
            }}
          >
            Connection Error
          </h2>

          <p>{error}</p>

        </div>

      </div>
    );

  }


  // -----------------------------
  // Formatting for metric cards
  // -----------------------------

  const cpuVal =
    latestMetrics?.system.cpu.usage_percent ?? 0;

  const memVal =
    latestMetrics?.system.memory.usage_percent ?? 0;

  const memUsed =
    latestMetrics?.system.memory.used_bytes
      ? formatBytes(
          latestMetrics.system.memory.used_bytes,
          1
        )
      : '0';

  const memTotal =
    latestMetrics?.system.memory.used_bytes &&
    latestMetrics?.system.memory.available_bytes
      ? formatBytes(
          latestMetrics.system.memory.used_bytes +
          latestMetrics.system.memory.available_bytes,
          1
        )
      : '0';

  const diskVal =
    latestMetrics?.system.disk.usage_percent ?? 0;

  const diskUsed =
    latestMetrics?.system.disk.used_bytes
      ? formatBytes(
          latestMetrics.system.disk.used_bytes,
          0
        )
      : '0';

  const diskTotal =
    latestMetrics?.system.disk.used_bytes &&
    latestMetrics?.system.disk.free_bytes
      ? formatBytes(
          latestMetrics.system.disk.used_bytes +
          latestMetrics.system.disk.free_bytes,
          0
        )
      : '0';


  // -----------------------------
  // Latest gateway health
  // -----------------------------

  const latestHealth =
    networkHealth?.health &&
    networkHealth.health.length > 0
      ? networkHealth.health[
          networkHealth.health.length - 1
        ]
      : null;


  // -----------------------------
  // Dashboard
  // -----------------------------

  return (

    <div className="content-scroll">

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >

        {/* System metrics */}

        <div className="dashboard-grid">

          <SystemMetricCard
            title="CPU Usage"
            icon="memory"
            iconColor="var(--color-primary)"
            badgeText="4 Cores"
            value={cpuVal}
            hoverBorderColor="var(--color-primary)"
          />

          <SystemMetricCard
            title="Memory"
            icon="memory_alt"
            iconColor="var(--color-secondary)"
            badgeText={`${memUsed} / ${memTotal}`}
            value={memVal}
            hoverBorderColor="var(--color-secondary)"
          />

          <SystemMetricCard
            title="Disk I/O"
            icon="hard_drive"
            iconColor="var(--color-tertiary)"
            badgeText={`${diskUsed} / ${diskTotal}`}
            value={diskVal}
            hoverBorderColor="var(--color-tertiary)"
          />

        </div>


        {/* Historical charts */}

        <div className="charts-grid">

          <MetricChart
            title="CPU Usage History"
            data={historyMetrics?.metrics || []}
            dataKey="cpu_usage_percent"
            color="var(--color-primary)"
          />

          <MetricChart
            title="Memory Usage History"
            data={historyMetrics?.metrics || []}
            dataKey="memory_usage_percent"
            color="var(--color-secondary)"
          />

        </div>


        {/* Network */}

        <div className="network-grid">

          <NetworkInterfaces
            currentInterfaces={
              currentNetwork?.interfaces || []
            }
            previousInterfaces={
              previousNetwork?.interfaces || undefined
            }
            currentTimestamp={
              currentNetwork?.timestamp || ''
            }
            previousTimestamp={
              previousNetwork?.timestamp || undefined
            }
          />

          <GatewayHealth
            health={latestHealth}
          />

        </div>

      </div>

    </div>

  );

};
