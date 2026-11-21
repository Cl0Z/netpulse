import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  unit?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({ title, data, dataKey, color, unit = '%' }) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface-container-lowest)',
      border: '1px solid var(--color-outline-variant)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 'var(--rounded-xl)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <span style={{ height: '12px', width: '12px', borderRadius: '50%', backgroundColor: color }}></span>
          {title}
        </h2>
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
          LAST 60 MIN
        </span>
      </div>
      
      <div style={{ height: '192px', width: '100%', position: 'relative' }}>
        {data.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)' }}>
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timeStr) => format(new Date(timeStr), 'HH:mm')}
                stroke="var(--color-on-surface-variant)"
                fontSize={10}
                tickMargin={10}
              />
              <YAxis 
                stroke="var(--color-on-surface-variant)"
                fontSize={10}
                tickFormatter={(val) => `${val}${unit === '%' ? '' : unit}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', borderRadius: 'var(--rounded-md)' }}
                labelFormatter={(timeStr) => format(new Date(timeStr as string), 'HH:mm:ss')}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill={`url(#color-${dataKey})`} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
