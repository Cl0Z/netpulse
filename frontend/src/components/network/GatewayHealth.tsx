import React from 'react';
import type { NetworkHealthMetric } from '../../types';

interface GatewayHealthProps {
  health: NetworkHealthMetric | null;
}

export const GatewayHealth: React.FC<GatewayHealthProps> = ({ health }) => {
  const isReachable = health?.reachable ?? false;
  
  return (
    <div style={{
      backgroundColor: 'var(--color-surface-container-lowest)',
      border: '1px solid var(--color-outline-variant)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 'var(--rounded-xl)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        right: '-40px',
        bottom: '-40px',
        opacity: 0.05,
        pointerEvents: 'none',
        color: 'var(--color-secondary)',
        zIndex: 0
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '150px' }}>router</span>
      </div>
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h2 style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          letterSpacing: '0.05em', 
          color: 'var(--color-on-surface-variant)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>router</span>
          GATEWAY HEALTH
        </h2>
        
        <div style={{
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--rounded-lg)',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: 'var(--color-on-surface)', marginBottom: '4px' }}>
            {health?.target || 'Unknown'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              height: '6px',
              width: '6px',
              borderRadius: '50%',
              backgroundColor: isReachable ? 'var(--color-online)' : 'var(--color-offline)',
              boxShadow: isReachable ? '0 0 4px var(--color-online)' : '0 0 4px var(--color-offline)'
            }}></span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: isReachable ? 'var(--color-online)' : 'var(--color-offline)' }}>
              {isReachable ? 'Reachable' : 'Unreachable'}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Latency</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            {health?.latency_ms !== null && health?.latency_ms !== undefined ? `${health.latency_ms.toFixed(2)} ms` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
