
import React, { useRef, useEffect, useState } from 'react';
import { CycleData } from '../../types';
import { calcSimilarity } from '../../utils/codeMetrics';

interface SpiralChartProps {
  history: CycleData[];
}

interface NodePosition {
  x: number;
  y: number;
  r: number;
  cycle: CycleData;
}

export const SpiralChart: React.FC<SpiralChartProps> = ({ history }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NodePosition | null>(null);
  const nodesRef = useRef<NodePosition[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI Canvas handling
    const parent = canvas.parentElement;
    if (parent) {
       const dpr = window.devicePixelRatio || 1;
       const rect = parent.getBoundingClientRect();
       canvas.width = rect.width * dpr;
       canvas.height = 400 * dpr;
       ctx.scale(dpr, dpr);
       canvas.style.width = `${rect.width}px`;
       canvas.style.height = `400px`;
    }
    
    // Config
    // We work in logical pixels now (after scale)
    const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
    const logicalHeight = 400;

    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;
    
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    // Draw Background Grid (Simulated 3D funnel)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let r = 20; r < maxRadius; r += 40) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (history.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("IGNITE ENGINE TO VISUALIZE CONVERGENCE", centerX, centerY);
        nodesRef.current = [];
        return;
    }

    const finalCode = history[history.length - 1].coolOutput;
    const computedNodes: NodePosition[] = [];

    // Draw Lines
    history.forEach((cycle, i) => {
        // SCALAR DISTANCE METRIC (Scientific Accuracy)
        // Distance from Singularity (Center) is determined by Similarity to Final Code.
        // This visualizes the "Convergence to Truth" in solution space.
        // 1.0 similarity = 0 distance (Center)
        // 0.0 similarity = maxRadius (Edge)
        
        const similarityToFinal = calcSimilarity(cycle.coolOutput, finalCode);
        
        // Visual Radius
        // We invert similarity so high similarity = small radius (closer to center)
        const radius = maxRadius * (1 - similarityToFinal);

        // Angle implies Time/Sequence (Still useful to see the path history)
        const angle = i * 0.5 + Math.PI / 2;
        
        // 3D Projection (Flatten Y for perspective)
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.6; 

        // Node size based on complexity
        const nodeSize = Math.max(4, Math.min(12, cycle.metrics.complexity / 2));
        computedNodes.push({ x, y, r: nodeSize, cycle });

        // Draw Line to previous
        if (i > 0) {
             const prevNode = computedNodes[i - 1];
             
             // Dynamic Line Color based on Entropy change
             const entropy = cycle.metrics.heatEntropy;
             // High entropy = Hot color line
             const r = Math.floor(249 - (entropy * 50));
             const g = Math.floor(115 + (entropy * 100));
             const b = 200;

             ctx.beginPath();
             ctx.moveTo(prevNode.x, prevNode.y);
             ctx.lineTo(x, y);
             ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
             ctx.lineWidth = 2;
             ctx.stroke();
        }
    });

    // Draw Points (on top of lines)
    computedNodes.forEach(node => {
        const { x, y, r, cycle } = node;
        
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        
        // Color node by Entropy (Heat)
        // High Heat = Orange/Red
        // Low Heat = Blue/Green
        const entropy = cycle.metrics.heatEntropy;
        const red = Math.floor(entropy * 255);
        const green = Math.floor((1 - entropy) * 200);
        const blue = Math.floor((1 - entropy) * 255);
        
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Label critical points (Start and End)
        if (cycle.cycleNumber === 1 || cycle.cycleNumber === history.length) {
             ctx.fillStyle = '#cbd5e1';
             ctx.font = '10px monospace';
             ctx.textAlign = 'left';
             ctx.fillText(`#${cycle.cycleNumber}`, x + 10, y);
        }
    });

    nodesRef.current = computedNodes;

  }, [history]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find interacting node
      // Simple distance check
      const hit = nodesRef.current.find(node => {
          const dx = node.x - x;
          const dy = node.y - y;
          return Math.sqrt(dx*dx + dy*dy) < (node.r + 5); // +5px buffer
      });

      setHoveredNode(hit || null);
  };

  const handleMouseLeave = () => {
      setHoveredNode(null);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-4 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <h3 className="text-sm font-bold text-slate-300">Spiral of Convergence</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Solution Space Trajectory (Center = Singularity)</p>
      </div>
      
      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-[400px] cursor-crosshair" 
      />

      {/* Interactive Tooltip */}
      {hoveredNode && (
        <div 
            className="absolute z-20 bg-slate-800/90 backdrop-blur border border-slate-600 rounded-lg p-3 shadow-xl text-xs pointer-events-none"
            style={{ 
                top: hoveredNode.y + 15, 
                left: hoveredNode.x + 15,
                maxWidth: '250px'
            }}
        >
            <div className="font-bold text-magma-400 mb-1 border-b border-slate-700 pb-1">
                CYCLE {hoveredNode.cycle.cycleNumber}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300 mb-2">
                <span className="text-slate-500">Entropy:</span>
                <span className="font-mono">{hoveredNode.cycle.metrics.heatEntropy.toFixed(2)}</span>
                
                <span className="text-slate-500">Convergence:</span>
                <span className="font-mono text-emerald-400">
                    {/* Recalculate strictly for display consistency */}
                    {calcSimilarity(hoveredNode.cycle.coolOutput, history[history.length-1].coolOutput).toFixed(2)}
                </span>

                <span className="text-slate-500">Complexity:</span>
                <span className="font-mono">{hoveredNode.cycle.metrics.complexity.toFixed(1)}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded text-slate-400 font-mono text-[10px] truncate">
                {hoveredNode.cycle.coolOutput.slice(0, 60).replace(/\n/g, ' ')}...
            </div>
        </div>
      )}
    </div>
  );
};
