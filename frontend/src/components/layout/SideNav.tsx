import React from 'react';

import type { TabType } from '../../App';

interface SideNavProps {
  nodeName: string;
  ipAddress: string;
  isOnline: boolean;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ nodeName, ipAddress, isOnline, currentTab, onTabChange }) => {
  return (
    <nav style={{
      width: '256px',
      borderRight: '1px solid var(--color-outline-variant)',
      backgroundColor: 'var(--color-surface-container-lowest)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 20
    }}>
      <div style={{ marginBottom: '32px', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          height: '40px',
          width: '40px',
          borderRadius: 'var(--rounded-md)',
          backgroundColor: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>dns</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--color-on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {nodeName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
              {ipAddress}
            </span>
            <span style={{
              height: '8px',
              width: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--color-online)' : 'var(--color-offline)',
              boxShadow: isOnline ? '0 0 4px var(--color-online)' : '0 0 4px var(--color-offline)'
            }}></span>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <NavItem icon="dashboard" label="Dashboard" active={currentTab === 'Dashboard'} onClick={() => onTabChange('Dashboard')} />
        <NavItem icon="dns" label="Connections" active={currentTab === 'Connections'} onClick={() => onTabChange('Connections')} />
        <NavItem icon="hub" label="Network" active={currentTab === 'Network'} onClick={() => onTabChange('Network')} />
      </div>
    </nav>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <a 
    href="#" 
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    padding: '8px 12px',
    borderRadius: 'var(--rounded-lg)',
    backgroundColor: active ? 'var(--color-primary-container)' : 'transparent',
    color: active ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
    textDecoration: 'none',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s ease'
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
    <span style={{ fontSize: '14px', letterSpacing: '0.02em' }}>{label}</span>
  </a>
);
