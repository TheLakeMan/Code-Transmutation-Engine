
import React from 'react';
import { CycleData } from '../../types';

interface TrendChartProps {
  history: CycleData[];
  dataKey: 'entropy' | 'stability' | 'complexity';
  color: string;
  title: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ history, dataKey, color, title }) => {
  if (history.length < 2) {
      return (
          <div className="h-32 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700 border-dashed">
              <span className="text-xs text-slate-600">INSUFFICIENT DATA</span>
          </div>
      );
  }

  // Extract values
  const values = history.map(c => {
      if (dataKey === 'entropy') return c.metrics.heatEntropy;
      if (dataKey === 'stability') return c.metrics.coolStability;
      return c.metrics.complexity;
  });

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Generate Path
  const width = 100;
  const height = 50;
  
  const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const normalizedVal = (val - min) / range;
      const y = height - (normalizedVal * height); // Invert Y
      return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
       <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-bold text-slate-400 uppercase">{title}</span>
           <span className="text-xs font-mono" style={{ color }}>{values[values.length-1].toFixed(2)}</span>
       </div>
       <div className="relative h-16 w-full overflow-hidden">
           <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
               {/* Line */}
               <polyline 
                   points={points} 
                   fill="none" 
                   stroke={color} 
                   strokeWidth="2" 
                   vectorEffect="non-scaling-stroke"
                   strokeLinecap="round"
                   strokeLinejoin="round"
               />
               {/* Gradient Fill (Optional) */}
               <path 
                   d={`M0,${height} L0,${points.split(' ')[0].split(',')[1]} ${points.replace(/,/g, ' ')} L${width},${height} Z`}
                   fill={color}
                   opacity="0.1"
               />
           </svg>
       </div>
    </div>
  );
};
