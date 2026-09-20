import { CalculationResults, CalculationState } from "../types";

interface SlabVisualizationProps {
  state: CalculationState;
  results: CalculationResults;
}

export const SlabVisualization = ({ state, results }: SlabVisualizationProps) => {
  const is4 = state.appuiType === "4cotes";
  const ratio = is4 ? Math.max(state.Ly / state.Lx, 1.0) : 1.0;

  const planW = 240;
  const planH = is4 ? Math.min(180, 240 / ratio) : 90;
  const planX = 60;
  const planY = 45 + (180 - planH) / 2;

  const coupeY = 60;
  const coupeH = Math.min(160, Math.max(40, (state.h / 400) * 160));
  const coupeX = 420;
  const coupeW = 260;

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-4">
      <svg viewBox="0 0 720 320" className="w-full h-auto drop-shadow-sm" style={{ aspectRatio: '720/320' }}>
        <defs>
          <marker id="arrowS" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-slate-500" />
          </marker>
          <marker id="arrowE" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="auto">
            <path d="M10,0 L0,5 L10,10 z" className="fill-slate-500" />
          </marker>
          <pattern id="hachure" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
          </pattern>
          <pattern id="beton" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="#94a3b8" opacity="0.3" />
          </pattern>
        </defs>

        <text x="180" y="25" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-bold text-sm">VUE EN PLAN</text>
        <rect x={planX} y={planY} width={planW} height={planH} className="fill-[url(#beton)] stroke-slate-600 dark:stroke-slate-400 fill-opacity-50" strokeWidth="2" rx="4" />
        
        {results.punchActive && (
          <g>
            <rect 
              x={planX + planW/2 - (state.columnSize/2000)*planW/2} 
              y={planY + planH/2 - (state.columnSize/2000)*planH/2} 
              width={(state.columnSize/2000)*planW} 
              height={(state.columnSize/2000)*planH} 
              className="fill-slate-500 stroke-slate-700" 
              strokeWidth="1"
            />
            <rect 
              x={planX + planW/2 - ((state.columnSize + 4*results.d)/2000)*planW/2} 
              y={planY + planH/2 - ((state.columnSize + 4*results.d)/2000)*planH/2} 
              width={((state.columnSize + 4*results.d)/2000)*planW} 
              height={((state.columnSize + 4*results.d)/2000)*planH} 
              fill="none" 
              className="stroke-rose-400" 
              strokeWidth="1.5" 
              strokeDasharray="4,2"
              rx={(results.d/2000)*planW*2}
            />
            <text 
              x={planX + planW/2} 
              y={planY + planH/2 - ((state.columnSize + 4*results.d)/2000)*planH/2 - 5} 
              textAnchor="middle" 
              className="fill-rose-500 text-[8px] font-bold"
            >
              u1 (2d)
            </text>
          </g>
        )}

        <g>
          <line x1={planX} y1={planY + planH + 20} x2={planX + planW} y2={planY + planH + 20} stroke="#94a3b8" strokeWidth="1" markerStart="url(#arrowS)" markerEnd="url(#arrowE)" />
          <text x={planX + planW / 2} y={planY + planH + 34} textAnchor="middle" className="fill-slate-500 font-mono text-[10px]">Lx = {state.Lx}m</text>
          
          {is4 && (
            <>
              <line x1={planX + planW + 20} y1={planY} x2={planX + planW + 20} y2={planY + planH} stroke="#94a3b8" strokeWidth="1" markerStart="url(#arrowS)" markerEnd="url(#arrowE)" />
              <text x={planX + planW + 34} y={planY + planH / 2} textAnchor="middle" transform={`rotate(90 ${planX + planW + 34} ${planY + planH / 2})`} className="fill-slate-500 font-mono text-[10px]">Ly = {state.Ly}m</text>
            </>
          )}
        </g>

        <text x="550" y="25" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-bold text-sm">COUPE A-A</text>
        <rect x={coupeX} y={coupeY} width={coupeW} height={coupeH} className="fill-[url(#beton)] stroke-slate-600 dark:stroke-slate-400 fill-opacity-50" strokeWidth="2" />
        <rect x={coupeX} y={coupeY} width={coupeW} height={coupeH} className="fill-[url(#hachure)]" opacity="0.2" />

        <g>
          <line 
            x1={coupeX + 10} y1={coupeY + coupeH - 20} 
            x2={coupeX + coupeW - 10} y2={coupeY + coupeH - 20} 
            className="stroke-teal-400" strokeWidth="4" strokeLinecap="round" 
          />
          <line 
            x1={coupeX + 10} y1={coupeY + coupeH - 20} 
            x2={coupeX + coupeW - 10} y2={coupeY + coupeH - 20} 
            className="stroke-teal-700" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1,7"
          />
        </g>
        <g>
          {[0.08, 0.24, 0.4, 0.56, 0.72, 0.88].map((t, i) => (
            <circle key={`clx-${i}`} cx={coupeX + t * coupeW} cy={coupeY + coupeH - 10} r="4" className="fill-sky-500 stroke-sky-700" strokeWidth="1" />
          ))}
        </g>
        {results.As_req_top > 0 && (
          <g>
            {[0.12, 0.3, 0.5, 0.7, 0.88].map((t, i) => (
              <circle key={`ctop-${i}`} cx={coupeX + t * coupeW} cy={coupeY + 11} r="4" className="fill-violet-400 stroke-violet-600" strokeWidth="1" />
            ))}
          </g>
        )}

        <g transform={`translate(${coupeX}, ${coupeY + coupeH + 34})`}>
          <circle cx="4" cy="0" r="4" className="fill-sky-500 stroke-sky-700" strokeWidth="1" />
          <text x="13" y="3" className="fill-slate-500 font-mono text-[8px]">Lx (coupe)</text>
          <line x1="88" y1="0" x2="102" y2="0" className="stroke-teal-400" strokeWidth="4" strokeLinecap="round" />
          <text x="107" y="3" className="fill-slate-500 font-mono text-[8px]">Ly (profil)</text>
          {results.As_req_top > 0 && (
            <>
              <circle cx="182" cy="0" r="4" className="fill-violet-400 stroke-violet-600" strokeWidth="1" />
              <text x="191" y="3" className="fill-slate-500 font-mono text-[8px]">Chapeaux</text>
            </>
          )}
        </g>

        <g>
          <line x1={coupeX - 15} y1={coupeY} x2={coupeX - 15} y2={coupeY + coupeH} stroke="#94a3b8" strokeWidth="1" markerStart="url(#arrowS)" markerEnd="url(#arrowE)" />
          <text x={coupeX - 25} y={coupeY + coupeH / 2} textAnchor="middle" transform={`rotate(-90 ${coupeX - 25} ${coupeY + coupeH / 2})`} className="fill-slate-500 font-mono text-[10px]">h = {state.h}mm</text>
          
          <line x1={coupeX + coupeW + 15} y1={coupeY + coupeH - (results.cnom / state.h) * coupeH} x2={coupeX + coupeW + 15} y2={coupeY + coupeH} stroke="#d97706" strokeWidth="1" markerStart="url(#arrowS)" markerEnd="url(#arrowE)" />
          <text x={coupeX + coupeW + 20} y={coupeY + coupeH - 5} className="fill-amber-600 font-mono text-[8px]" textAnchor="start">cnom</text>
        </g>
      </svg>
    </div>
  );
};