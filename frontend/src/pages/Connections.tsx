import { useState, useEffect, useCallback } from 'react';
import { getNetworkHealth } from '../api/network';
import type { NetworkHealthMetric } from '../types';

interface ConnectionsProps {
  nodeId: string;
  onStatusChange: (isOnline: boolean, nodeName: string, ip: string) => void;
}

export const Connections: React.FC<ConnectionsProps> = ({ nodeId, onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<NetworkHealthMetric[]>([]);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const health = await getNetworkHealth(nodeId, 10);

      // Keep only the most recent reading per target
      const latestByTarget: Record<string, NetworkHealthMetric> = {};
      for (const entry of health.health) {
        const prev = latestByTarget[entry.target_name];
        if (!prev || new Date(entry.timestamp) > new Date(prev.timestamp)) {
          latestByTarget[entry.target_name] = entry;
        }
      }

      setConnections(Object.values(latestByTarget));
      setError(null);
      onStatusChange(true, nodeId, nodeId);
    } catch (err: any) {
      console.error('Error fetching connections:', err);
      if (isInitial) setError(err.message || 'Failed to connect');
      onStatusChange(false, nodeId, 'Unknown');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [nodeId, onStatusChange]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)' }}>
        Loading connections...
      </div>
    );
  }

  if (error && connections.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'var(--color-surface-container-lowest)', padding: '24px', borderRadius: 'var(--rounded-lg)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>error</span>
          <h2 style={{ marginBottom: '8px' }}>Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const reachableCount = connections.filter(c => c.reachable).length;
  const totalCount = connections.length;

  return (
    <div className="content-scroll">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Summary Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--rounded-xl)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--color-secondary)' }}>hub</span>
            <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-on-surface)' }}>Monitored Connections</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: 'var(--rounded-md)',
              backgroundColor: reachableCount === totalCount ? 'rgba(var(--color-online-rgb, 74,222,128), 0.12)' : 'rgba(var(--color-offline-rgb, 239,68,68), 0.12)',
              border: `1px solid ${reachableCount === totalCount ? 'var(--color-online)' : 'var(--color-offline)'}`,
              color: reachableCount === totalCount ? 'var(--color-online)' : 'var(--color-offline)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-jetbrains)',
            }}>
              {reachableCount}/{totalCount} Reachable
            </span>
          </div>
        </div>

        {/* Connection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {connections.map(conn => (
            <ConnectionCard key={conn.target_name} connection={conn} />
          ))}

          {connections.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--color-on-surface-variant)' }}>
              No connection data available yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};


const ConnectionCard: React.FC<{ connection: NetworkHealthMetric }> = ({ connection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isReachable = connection.reachable;
  const statusColor = isReachable ? 'var(--color-online)' : 'var(--color-offline)';

  // Get a nice icon based on the target name
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('gateway') || n.includes('router')) return 'router';
    if (n.includes('dns') || n.includes('cloudflare') || n.includes('google')) return 'dns';
    if (n.includes('cloud') || n.includes('aws') || n.includes('azure')) return 'cloud';
    return 'device_hub';
  };

  // Format target name nicely
  const formatName = (name: string) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: `1px solid ${isHovered ? statusColor : 'var(--color-outline-variant)'}`,
        borderRadius: 'var(--rounded-xl)',
        boxShadow: 'var(--shadow-card)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 0.25s ease, transform 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background icon */}
      <div style={{
        position: 'absolute',
        right: '-24px',
        bottom: '-24px',
        opacity: 0.04,
        color: statusColor,
        pointerEvents: 'none',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>{getIcon(connection.target_name)}</span>
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            height: '36px',
            width: '36px',
            borderRadius: 'var(--rounded-md)',
            backgroundColor: 'var(--color-surface-container-low)',
            border: '1px solid var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-secondary)' }}>{getIcon(connection.target_name)}</span>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-on-surface)' }}>
              {formatName(connection.target_name)}
            </div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              {connection.target}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--rounded-md)',
          border: `1px solid ${statusColor}`,
          backgroundColor: isReachable ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
        }}>
          <span style={{
            height: '7px',
            width: '7px',
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 5px ${statusColor}`,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor }}>
            {isReachable ? 'Reachable' : 'Unreachable'}
          </span>
        </div>
      </div>

      {/* Latency */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--color-outline-variant)',
        paddingTop: '12px',
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>Latency</span>
        <span style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '14px',
          fontWeight: 700,
          color: isReachable ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)',
        }}>
          {connection.latency_ms !== null && connection.latency_ms !== undefined
            ? `${connection.latency_ms.toFixed(2)} ms`
            : 'N/A'}
        </span>
      </div>
    </div>
  );
};
