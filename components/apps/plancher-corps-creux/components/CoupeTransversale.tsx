import type { Geometrie, ChoixManuel } from '../types';

interface CoupeTransversaleProps {
  geometrie: Geometrie;
  choixManuel: ChoixManuel;
  enrobage_nominal: number;
  echelle_px_par_cm?: number;
  isPrint?: boolean;
}

export function CoupeTransversale({
  geometrie,
  choixManuel,
  enrobage_nominal,
  echelle_px_par_cm = 4,
  isPrint = false,
}: CoupeTransversaleProps) {
  const largeur_totale_px = geometrie.entraxe * 100 * echelle_px_par_cm;
  const hf_px = geometrie.epaisseur_dalle * echelle_px_par_cm;
  const hw_px = geometrie.epaisseur_entrevous * echelle_px_par_cm;
  const largeur_ame_px = geometrie.largeur_ame * echelle_px_par_cm;
  const enrobage_px = (enrobage_nominal / 10) * echelle_px_par_cm;

  const positions_acier_travee = (() => {
    const nb = choixManuel.nb_travee;
    const debut = 60 + (largeur_totale_px - largeur_ame_px) / 2;
    if (nb === 2) return [debut + largeur_ame_px * 0.3, debut + largeur_ame_px * 0.7];
    if (nb === 3) return [debut + largeur_ame_px * 0.25, debut + largeur_ame_px * 0.5, debut + largeur_ame_px * 0.75];
    if (nb === 4) return [debut + largeur_ame_px * 0.2, debut + largeur_ame_px * 0.4, debut + largeur_ame_px * 0.6, debut + largeur_ame_px * 0.8];
    return [];
  })();

  const positions_acier_appui = (() => {
    const nb = choixManuel.nb_appui;
    const debut = 60 + (largeur_totale_px - largeur_ame_px) / 2;
    if (nb === 1) return [60 + largeur_totale_px / 2];
    if (nb === 2) return [debut + largeur_ame_px * 0.3, debut + largeur_ame_px * 0.7];
    if (nb === 3) return [debut + largeur_ame_px * 0.2, debut + largeur_ame_px * 0.5, debut + largeur_ame_px * 0.8];
    return [];
  })();

  const markerId = isPrint ? 'arrow-print' : 'arrow';
  const etrierColor = isPrint ? '#059669' : '#10b981';
  const acierTraveeColor = isPrint ? '#dc2626' : '#ef4444';
  const acierAppuiColor = isPrint ? '#ca8a04' : '#eab308';
  const coteColor = isPrint ? '#334155' : '#64748b';
  const coteTextClass = isPrint ? 'text-slate-800 font-bold' : 'text-slate-500 font-bold';
  const centreX = 60 + largeur_totale_px / 2;
  const yBase = 40 + hf_px + hw_px - enrobage_px;

  const xGauche = centreX - largeur_ame_px / 2 + enrobage_px;
  const xDroite = centreX + largeur_ame_px / 2 - enrobage_px;
  const xApex = centreX;
  const yApex = 40 + enrobage_px + 2;
  const rHookApex = Math.max(2.5, echelle_px_par_cm * 0.6);

  const cheminEtrier = `M ${xGauche} ${yBase} L ${xDroite} ${yBase} L ${xApex} ${yApex} Z`;
  const hookApex = `M ${xApex + rHookApex * 0.3} ${yApex + rHookApex * 0.5} L ${xApex + rHookApex * 1.3} ${yApex + rHookApex * 2.2} Q ${xApex + rHookApex * 1.8} ${yApex + rHookApex * 3} ${xApex + rHookApex * 0.9} ${yApex + rHookApex * 3.2}`;

  return (
    <svg viewBox={`0 0 ${largeur_totale_px + 120} 220`} className="max-w-xl mx-auto overflow-visible">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={coteColor} />
        </marker>
      </defs>

      <line x1={centreX} y1="10" x2={centreX} y2="190" stroke="#94a3b8" strokeDasharray="5,3" strokeWidth="0.5" />

      <rect x={60} y={40} width={largeur_totale_px} height={hf_px} fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />

      <rect x={60 + (largeur_totale_px - largeur_ame_px) / 2} y={40 + hf_px} width={largeur_ame_px} height={hw_px} fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />

      <path d={cheminEtrier} fill="none" stroke={etrierColor} strokeWidth={isPrint ? '1.2' : '2'} strokeLinecap="round" strokeLinejoin="round" />
      <path d={hookApex} fill="none" stroke={etrierColor} strokeWidth={isPrint ? '1.2' : '2'} strokeLinecap="round" />

      {positions_acier_travee.map((cx, i) => (
        <circle key={i} cx={cx} cy={yBase - 2} r={Math.max(2.5, (choixManuel.diametre_travee / 2) * (echelle_px_par_cm / 10))} fill={acierTraveeColor} />
      ))}

      {positions_acier_appui.map((cx, i) => (
        <circle key={i} cx={cx} cy={40 + enrobage_px + 2} r={Math.max(2.5, (choixManuel.diametre_appui / 2) * (echelle_px_par_cm / 10))} fill={acierAppuiColor} />
      ))}

      <g className={coteTextClass} style={{ fontSize: '9px' }}>
        <line x1="60" y1="30" x2={60 + largeur_totale_px} y2="30" stroke={coteColor} strokeWidth="0.5" markerStart={`url(#${markerId})`} markerEnd={`url(#${markerId})`} />
        <text x={60 + largeur_totale_px / 2} y="25" textAnchor="middle">
          {geometrie.entraxe}m
        </text>

        <line x1={largeur_totale_px + 75} y1="40" x2={largeur_totale_px + 75} y2={40 + hf_px + hw_px} stroke={coteColor} strokeWidth="0.5" markerStart={`url(#${markerId})`} markerEnd={`url(#${markerId})`} />
        <text x={largeur_totale_px + 80} y={40 + (hf_px + hw_px) / 2} dominantBaseline="middle">
          h={geometrie.epaisseur_dalle + geometrie.epaisseur_entrevous}cm
        </text>

        <line
          x1={60 + (largeur_totale_px - largeur_ame_px) / 2}
          y1={40 + hf_px + hw_px + 15}
          x2={60 + (largeur_totale_px + largeur_ame_px) / 2}
          y2={40 + hf_px + hw_px + 15}
          stroke={coteColor}
          strokeWidth="0.5"
          markerStart={`url(#${markerId})`}
          markerEnd={`url(#${markerId})`}
        />
        <text x={60 + largeur_totale_px / 2} y={40 + hf_px + hw_px + 30} textAnchor="middle">
          bw={geometrie.largeur_ame}cm
        </text>
      </g>
    </svg>
  );
}