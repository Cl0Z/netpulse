import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getLatestNetwork, getNetworkHistory, getNetworkHealth } from '../api/network';
import type { LatestNetworkResponse, NetworkHistoryResponse, NetworkHealthResponse } from '../api/network';
import { SystemMetricCard } from '../components/cards/SystemMetricCard';
import { MetricChart } from '../components/charts/MetricChart';
import { calculateNetworkRate } from '../utils/networkRate';

interface NetworkStatsProps {
  nodeId: string;
  onStatusChange: (isOnline: boolean, nodeName: string, ip: string) => void;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ nodeId, onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentNetwork, setCurrentNetwork] = useState<LatestNetworkResponse | null>(null);
  const [previousNetwork, setPreviousNetwork] = useState<LatestNetworkResponse | null>(null);
  const [networkHistory, setNetworkHistory] = useState<NetworkHistoryResponse | null>(null);
  const [networkHealth, setNetworkHealth] = useState<NetworkHealthResponse | null>(null);
  
  const [selectedInterface, setSelectedInterface] = useState<string | null>(null);

  const previousNetworkRef = useRef<LatestNetworkResponse | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const [latest, health] = await Promise.all([
        getLatestNetwork(nodeId),
        getNetworkHealth(nodeId, 5),
      ]);

      const previous = previousNetworkRef.current;
      setPreviousNetwork(previous);
      setCurrentNetwork(latest);
      previousNetworkRef.current = latest;
      
      setNetworkHealth(health);
      setError(null);
      
      onStatusChange(true, nodeId, nodeId);
      
      // Auto-select first interface if none selected
      if (!selectedInterface && latest.interfaces && latest.interfaces.length > 0) {
        setSelectedInterface(latest.interfaces[0].interface);
      }
    } catch (err: any) {
      console.error('Error fetching network data:', err);
      if (isInitial) setError(err.message || 'Failed to connect');
      onStatusChange(false, nodeId, 'Unknown');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [nodeId, selectedInterface, onStatusChange]);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await getNetworkHistory(nodeId, 60);
      setNetworkHistory(history);
    } catch (err) {
      console.error('Error fetching network history:', err);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchData(true);
    fetchHistory();

    const intervalLatest = setInterval(() => fetchData(false), 10000);
    const intervalHistory = setInterval(() => fetchHistory(), 60000);

    return () => {
      clearInterval(intervalLatest);
      clearInterval(intervalHistory);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]); // Excluded fetchData and fetchHistory to avoid infinite loop from currentNetwork dep

  // Calculate current speeds (aggregated for top cards)
  const aggregatedCurrentSpeeds = useMemo(() => {
    if (!currentNetwork || !previousNetwork || !currentNetwork.interfaces || !previousNetwork.interfaces) {
      return { rx: 0, tx: 0 };
    }
    
    let totalRx = 0;
    let totalTx = 0;
    
    for (const iface of currentNetwork.interfaces) {
      const prev = previousNetwork.interfaces.find(p => p.interface === iface.interface);
      if (prev) {
        totalRx += calculateNetworkRate(iface.bytes_received, prev.bytes_received, currentNetwork.timestamp, previousNetwork.timestamp);
        totalTx += calculateNetworkRate(iface.bytes_sent, prev.bytes_sent, currentNetwork.timestamp, previousNetwork.timestamp);
      }
    }
    
    return { rx: totalRx, tx: totalTx };
  }, [currentNetwork, previousNetwork]);

  // Calculate packet loss from health metrics
  const packetLoss = useMemo(() => {
    if (!networkHealth || !networkHealth.health || networkHealth.health.length === 0) return 0;
    // Just using a proxy for packet loss based on reachability for the latest target (gateway usually)
    const latest = networkHealth.health[networkHealth.health.length - 1];
    return latest.reachable ? 0 : 100; 
  }, [networkHealth]);

  // Process history data for charts
  const historyChartData = useMemo(() => {
    if (!networkHistory || !networkHistory.metrics || networkHistory.metrics.length < 2 || !selectedInterface) return [];
    
    const result = [];
    
    // Filter metrics for selected interface
    const ifaceMetrics = networkHistory.metrics.filter(m => m.interface === selectedInterface);
    
    // Group by timestamp
    const byTime: Record<string, { rx: number, tx: number }> = {};
    ifaceMetrics.forEach(m => {
      byTime[m.timestamp] = { rx: m.bytes_received, tx: m.bytes_sent };
    });
    
    const sortedTimes = Object.keys(byTime).sort();
    
    for (let i = 1; i < sortedTimes.length; i++) {
      const currTime = sortedTimes[i];
      const prevTime = sortedTimes[i-1];
      
      const rxSpeed = calculateNetworkRate(byTime[currTime].rx, byTime[prevTime].rx, currTime, prevTime);
      const txSpeed = calculateNetworkRate(byTime[currTime].tx, byTime[prevTime].tx, currTime, prevTime);
      
      result.push({
        timestamp: currTime,
        download: parseFloat(rxSpeed.toFixed(2)),
        upload: parseFloat(txSpeed.toFixed(2))
      });
    }
    
    return result;
  }, [networkHistory, selectedInterface]);

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading network stats...</div>;
  }

  if (error && !currentNetwork) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div className="content-scroll">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Interface Selector */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--rounded-xl)'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Select Interface:</span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {currentNetwork?.interfaces.map(iface => (
              <button
                key={iface.interface}
                onClick={() => setSelectedInterface(iface.interface)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--rounded-md)',
                  border: '1px solid',
                  borderColor: selectedInterface === iface.interface ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                  backgroundColor: selectedInterface === iface.interface ? 'var(--color-primary-container)' : 'transparent',
                  color: selectedInterface === iface.interface ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {iface.interface}
              </button>
            ))}
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="dashboard-grid">
          <SystemMetricCard
            title="Download Speed"
            icon="download"
            iconColor="var(--color-primary)"
            badgeText="Aggregated"
            value={aggregatedCurrentSpeeds.rx}
            unit="Mbps"
            hoverBorderColor="var(--color-primary)"
          />

          <SystemMetricCard
            title="Upload Speed"
            icon="upload"
            iconColor="var(--color-secondary)"
            badgeText="Aggregated"
            value={aggregatedCurrentSpeeds.tx}
            unit="Mbps"
            hoverBorderColor="var(--color-secondary)"
          />

          <SystemMetricCard
            title="Packet Loss"
            icon="warning"
            iconColor={packetLoss > 0 ? "var(--color-error)" : "var(--color-tertiary)"}
            badgeText="Gateway"
            value={packetLoss}
            unit="%"
            hoverBorderColor="var(--color-error)"
          />
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <MetricChart
            title="Download Speed (Mbps)"
            data={historyChartData}
            dataKey="download"
            color="var(--color-primary)"
          />

          <MetricChart
            title="Upload Speed (Mbps)"
            data={historyChartData}
            dataKey="upload"
            color="var(--color-secondary)"
          />
        </div>

        {/* Other Stats Table */}
        <div style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--rounded-xl)',
          overflow: 'hidden',
          marginTop: '24px'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Interface Statistics</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                  <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>INTERFACE</th>
                  <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>STATUS</th>
                  <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>BYTES SENT</th>
                  <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>BYTES REC</th>
                  <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>ERRORS</th>
                  <th style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>DROPS</th>
                </tr>
              </thead>
              <tbody>
                {currentNetwork?.interfaces.map((iface) => (
                  <tr key={iface.interface} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{iface.interface}</td>
                    <td style={{ padding: '12px 16px', color: iface.is_up ? 'var(--color-online)' : 'var(--color-offline)' }}>
                      {iface.is_up ? 'Up' : 'Down'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{iface.bytes_sent.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>{iface.bytes_received.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', color: (iface.errors_in + iface.errors_out > 0) ? 'var(--color-error)' : 'inherit' }}>
                      {iface.errors_in + iface.errors_out}
                    </td>
                    <td style={{ padding: '12px 16px', color: (iface.drops_in + iface.drops_out > 0) ? 'var(--color-error)' : 'inherit' }}>
                      {iface.drops_in + iface.drops_out}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
