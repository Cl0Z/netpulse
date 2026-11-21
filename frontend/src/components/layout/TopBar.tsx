import React from 'react';

interface TopBarProps {
  isOnline: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isOnline }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '0 var(--spacing-container)',
      height: '64px',
      borderBottom: '1px solid var(--color-outline-variant)',
      backgroundColor: 'var(--color-surface-container-lowest)',
      flexShrink: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>System Telemetry</h1>
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid var(--color-outline-variant)',
          backgroundColor: 'var(--color-surface-container-low)',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            height: '6px',
            width: '6px',
            borderRadius: '50%',
            backgroundColor: isOnline ? 'var(--color-online)' : 'var(--color-offline)',
            boxShadow: isOnline ? '0 0 3px var(--color-online)' : '0 0 3px var(--color-offline)'
          }}></span>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      </div>
    </header>
  );
};
