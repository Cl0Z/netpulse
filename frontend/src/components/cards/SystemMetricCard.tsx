import React from 'react';

interface SystemMetricCardProps {
  title: string;
  icon: string;
  iconColor: string;
  badgeText: string;
  value: number;
  unit?: string;
  hoverBorderColor: string;
}

export const SystemMetricCard: React.FC<SystemMetricCardProps> = ({
  title,
  icon,
  iconColor,
  badgeText,
  value,
  unit = '%',
  hoverBorderColor
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: `1px solid ${isHovered ? hoverBorderColor : 'var(--color-outline-variant)'}`,
        boxShadow: 'var(--shadow-card)',
        borderRadius: 'var(--rounded-xl)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '140px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', position: 'relative', zIndex: 10 }}>
        <span style={{ 
          fontFamily: 'var(--font-geist)', 
          fontSize: '12px', 
          fontWeight: 600, 
          letterSpacing: '0.05em', 
          color: 'var(--color-on-surface-variant)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          textTransform: 'uppercase'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: iconColor }}>{icon}</span>
          {title}
        </span>
        <span style={{ 
          fontFamily: 'var(--font-jetbrains)', 
          fontSize: '13px', 
          color: 'var(--color-on-surface)', 
          backgroundColor: 'var(--color-surface-container-low)', 
          padding: '2px 6px', 
          borderRadius: 'var(--rounded-sm)', 
          border: '1px solid var(--color-outline-variant)' 
        }}>
          {badgeText}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
        <span style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-on-surface)' }}>
          {value.toFixed(1)}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
          {unit}
        </span>
      </div>
      
      {/* Decorative Sparkline Area (CSS simulated) */}
      <div style={{ marginTop: 'auto', height: '32px', width: '100%', borderTop: '1px solid var(--color-outline-variant)', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '100%',
          width: '100%',
          opacity: 0.1,
          background: `linear-gradient(to top, ${iconColor}, transparent)`
        }}></div>
      </div>
    </div>
  );
};
