import React from 'react';
import type { NetworkInterfaceMetric } from '../../types';
import { calculateNetworkRate, formatRate } from '../../utils/networkRate';

interface NetworkInterfacesProps {
  currentInterfaces: NetworkInterfaceMetric[];
  previousInterfaces?: NetworkInterfaceMetric[];
  currentTimestamp: string;
  previousTimestamp?: string;
}

export const NetworkInterfaces: React.FC<NetworkInterfacesProps> = ({ 
  currentInterfaces, 
  previousInterfaces,
  currentTimestamp,
  previousTimestamp
}) => {
  const getInterfaceRate = (iface: NetworkInterfaceMetric, type: 'rx' | 'tx') => {
    if (!previousInterfaces || !previousTimestamp) return '0.00 Mbps';
    
    const prev = previousInterfaces.find(p => p.interface === iface.interface);
    if (!prev) return '0.00 Mbps';
    
    const currentBytes = type === 'rx' ? iface.bytes_received : iface.bytes_sent;
    const prevBytes = type === 'rx' ? prev.bytes_received : prev.bytes_sent;
    
    const rateMbps = calculateNetworkRate(currentBytes, prevBytes, currentTimestamp, previousTimestamp);
    return formatRate(rateMbps);
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-container-lowest)',
      border: '1px solid var(--color-outline-variant)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 'var(--rounded-xl)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-outline-variant)',
        backgroundColor: 'var(--color-surface-container-low)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--color-on-surface)' }}>Network Interfaces</h2>
        <button style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-on-surface-variant)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex'
        }}>
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)' }}>
              <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Interface</th>
              <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>RX Rate</th>
              <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>TX Rate</th>
            </tr>
          </thead>
          <tbody style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: 'var(--color-on-surface)' }}>
            {currentInterfaces.map((iface, i) => (
              <tr key={iface.interface} style={{ 
                borderBottom: i === currentInterfaces.length - 1 ? 'none' : '1px solid var(--color-outline-variant)',
                backgroundColor: i % 2 === 0 ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)',
                transition: 'background-color 0.2s'
              }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{iface.interface}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      height: '8px',
                      width: '8px',
                      borderRadius: '50%',
                      backgroundColor: iface.is_up ? 'var(--color-online)' : 'var(--color-offline)',
                      boxShadow: iface.is_up ? '0 0 3px var(--color-online)' : '0 0 3px var(--color-offline)'
                    }}></span>
                    {iface.is_up ? 'Up' : 'Down'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-on-surface-variant)' }}>
                  {getInterfaceRate(iface, 'rx')}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-on-surface-variant)' }}>
                  {getInterfaceRate(iface, 'tx')}
                </td>
              </tr>
            ))}
            {currentInterfaces.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                  No interfaces found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
