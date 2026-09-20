import { CalculationResults, CalculationState, BorderCondition, AppuiType, CartoucheSettings, DEFAULT_CARTOUCHE } from "../types";
import { EXPLOITATION_CATEGORIES, CONSTANTS } from "../constants";

export const formatNum = (n: number | undefined, digits = 2) => {
  if (n === undefined || n === null || isNaN(n)) return "-";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const renderGeometryDiagram = (state: CalculationState, results: CalculationResults) => {
  const is4 = state.appuiType === AppuiType.FourSides;
  const ratio = is4 ? Math.max(state.Ly / state.Lx, 1.0) : 1.0;
  const planW = 260, planH = is4 ? Math.min(150, 260 / ratio) : 80;
  const planX = 40, planY = 46 + (150 - planH) / 2;
  const coupeX = 430, coupeW = 260, coupeH = Math.min(130, Math.max(40, (state.h / 400) * 130)), coupeY = 56;

  return `
  <svg viewBox="0 0 760 250" style="width: 100%; height: auto; max-height: 220px;" xmlns="http://www.w3.org/2000/svg">
    <text x="170" y="24" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="800" fill="#1a5276">VUE EN PLAN</text>
    <rect x="${planX}" y="${planY}" width="${planW}" height="${planH}" fill="#eef2f7" stroke="#334155" stroke-width="2" rx="3"/>
    <line x1="${planX}" y1="${planY + planH + 18}" x2="${planX + planW}" y2="${planY + planH + 18}" stroke="#94a3b8" stroke-width="1"/>
    <text x="${planX + planW / 2}" y="${planY + planH + 34}" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569">Lx = ${state.Lx} m</text>
    ${is4 ? `
    <line x1="${planX + planW + 18}" y1="${planY}" x2="${planX + planW + 18}" y2="${planY + planH}" stroke="#94a3b8" stroke-width="1"/>
    <text x="${planX + planW + 50}" y="${planY + planH / 2}" text-anchor="middle" font-family="monospace" font-size="11" fill="#475569" transform="rotate(90 ${planX + planW + 50} ${planY + planH / 2})">Ly = ${state.Ly} m</text>
    ` : ''}
    ${results.punchActive ? `
    <rect x="${planX + planW / 2 - state.columnSize / 40}" y="${planY + planH / 2 - state.columnSize / 40}" width="${state.columnSize / 20}" height="${state.columnSize / 20}" fill="#64748b"/>
    <rect x="${planX + planW / 2 - (state.columnSize + 4 * results.d) / 40}" y="${planY + planH / 2 - (state.columnSize + 4 * results.d) / 40}" width="${(state.columnSize + 4 * results.d) / 20}" height="${(state.columnSize + 4 * results.d) / 20}" fill="none" stroke="#e11d48" stroke-width="1.2" stroke-dasharray="3,2" rx="8"/>
    ` : ''}
    <text x="595" y="24" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="800" fill="#1a5276">COUPE TRANSVERSALE</text>
    <rect x="${coupeX}" y="${coupeY}" width="${coupeW}" height="${coupeH}" fill="#eef2f7" stroke="#334155" stroke-width="2"/>
    ${[0.08, 0.24, 0.4, 0.56, 0.72, 0.88].map(t => `<circle cx="${coupeX + t * coupeW}" cy="${coupeY + coupeH - 10}" r="3.5" fill="#3a9bd5" stroke="#1a5276" stroke-width="1"/>`).join('')}
    <line x1="${coupeX - 14}" y1="${coupeY}" x2="${coupeX - 14}" y2="${coupeY + coupeH}" stroke="#94a3b8" stroke-width="1"/>
    <text x="${coupeX - 22}" y="${coupeY + coupeH / 2}" text-anchor="middle" font-family="monospace" font-size="10" fill="#475569" transform="rotate(-90 ${coupeX - 22} ${coupeY + coupeH / 2})">h = ${state.h} mm</text>
    <line x1="${coupeX + coupeW + 14}" y1="${coupeY + coupeH - (results.cnom / state.h) * coupeH}" x2="${coupeX + coupeW + 14}" y2="${coupeY + coupeH}" stroke="#d97706" stroke-width="1.2"/>
    <text x="${coupeX + coupeW + 20}" y="${coupeY + coupeH - 4}" font-family="monospace" font-size="9" fill="#b45309">cnom=${results.cnom}mm</text>
  </svg>`;
};

export const renderLoadDiagram = (state: CalculationState, results: CalculationResults) => {
  const spanLabel = results.effectiveOneWay || state.appuiType === AppuiType.TwoSides ? `Bande de calcul 1,00 m — portée Lx = ${state.Lx} m` : `Bande de calcul 1,00 m selon Lx = ${state.Lx} m (Pigeaud/Bares)`;
  const supportSymbol = (x: number) => `
    <line x1="${x - 12}" y1="150" x2="${x + 12}" y2="150" stroke="#334155" stroke-width="2"/>
    <path d="M ${x} 150 L ${x - 10} 168 L ${x + 10} 168 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
    ${[-8, -2, 4, 10].map(o => `<line x1="${x - 10 + o}" y1="168" x2="${x - 16 + o}" y2="178" stroke="#94a3b8" stroke-width="1"/>`).join('')}
  `;
  const arrows = Array.from({ length: 9 }, (_, i) => 70 + i * 57.5).map(x => `
    <line x1="${x}" y1="55" x2="${x}" y2="98" stroke="#3a9bd5" stroke-width="1.5" marker-end="url(#arrowLoad)"/>
  `).join('');

  return `
  <svg viewBox="0 0 600 260" style="width: 100%; height: auto; max-height: 230px;" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrowLoad" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto">
        <path d="M0,0 L8,0 L4,6 Z" fill="#3a9bd5"/>
      </marker>
    </defs>
    <text x="300" y="20" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="800" fill="#1a5276">SCHÉMA DE CHARGEMENT (ELU) — PRINCIPE DE CALCUL</text>
    <text x="300" y="38" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">pu = ${formatNum(results.pu, 2)} kN/m² × 1,00 m</text>
    ${arrows}
    <line x1="40" y1="98" x2="560" y2="98" stroke="#1a5276" stroke-width="3"/>
    ${supportSymbol(60)}
    ${supportSymbol(540)}
    <path d="M 60 178 Q 300 236 540 178" fill="none" stroke="#e11d48" stroke-width="2"/>
    <rect x="230" y="185" width="140" height="18" fill="#fff" opacity="0.85"/>
    <text x="300" y="198" text-anchor="middle" font-family="monospace" font-size="12" font-weight="800" fill="#e11d48">MEd,x = ${formatNum(results.MEd_x, 2)} kNm/m</text>
    <text x="300" y="252" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#94a3b8">${spanLabel} — schéma de principe, non à l'échelle</text>
  </svg>`;
};

export const renderPunchingDiagram = (state: CalculationState, results: CalculationResults) => {
  const c = state.columnSize, d = results.d;
  const scale = 220 / (c + 4 * d + 60);
  const cx = 150, cy = 110;
  return `
  <svg viewBox="0 0 300 220" style="width: 100%; max-width: 300px; height: auto;" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="18" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" fill="#1a5276">PÉRIMÈTRE CRITIQUE u1 (2d)</text>
    <rect x="${cx - (c * scale) / 2}" y="${cy - (c * scale) / 2}" width="${c * scale}" height="${c * scale}" fill="#64748b"/>
    <rect x="${cx - ((c + 4 * d) * scale) / 2}" y="${cy - ((c + 4 * d) * scale) / 2}" width="${(c + 4 * d) * scale}" height="${(c + 4 * d) * scale}" fill="none" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="4,2" rx="${d * scale}"/>
    <text x="150" y="${cy + ((c + 4 * d) * scale) / 2 + 20}" text-anchor="middle" font-family="monospace" font-size="10" fill="#64748b">Poteau ${c}×${c}mm — u1 à 2d=${Math.round(2 * d)}mm du nu</text>
  </svg>`;
};

export const generateNoteDeCalcul = (state: CalculationState, results: CalculationResults, projectName: string, cartouche: CartoucheSettings = DEFAULT_CARTOUCHE) => {
  const cat = EXPLOITATION_CATEGORIES[state.qkCategoryIndex];
  const globalOk = results.shearOk && results.deflectionOk && results.steelOk && results.crackOk
    && (!results.punchActive || results.punchingOk) && results.mu <= 0.372
    && results.spacingXOk && results.spacingYOk && results.asMaxOk
    && results.sectionSufficientX && results.sectionSufficientY
    && results.sectionSufficientTop && results.spacingTopOk;

  const sectionTitle = (n: string, label: string) => `
      <h2 style="color: #1a5276; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; font-size: 18px; margin-top: 34px; display: flex; align-items: center; gap: 10px;">
        <span style="background: #1a5276; color: #fff; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 14px;">${n}</span>
        ${label}
      </h2>`;

  const eq = (label: string, formula: string, substitution: string, result: string) => `
    <div style="background:#f8fafc; border-left: 3px solid #3a9bd5; padding: 10px 14px; margin: 8px 0; border-radius: 0 6px 6px 0;">
      <div style="color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing: 0.05em; margin-bottom:4px; font-weight: 700;">${label}</div>
      <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 12px; color: #334155;">${formula} = ${substitution} = <strong style="color:#1a5276;">${result}</strong></div>
    </div>`;

  const sommaireItems = [
    "Hypothèses des matériaux",
    "Données géométriques & charges",
    "Analyse des sollicitations",
    "États limites ultimes & service (EC2)",
    "Dispositions constructives & nomenclature (BBS)",
    "Bibliographie",
  ];

  const illustrations = [
    "Vue en plan et coupe transversale de la dalle",
    "Schéma de chargement à l'ELU et diagramme de moment fléchissant",
    ...(results.punchActive ? ["Périmètre critique de poinçonnement u1 (2d)"] : []),
  ];

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 900px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff; line-height: 1.5;">
      <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #1a5276; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="position: relative; width: 50px; height: 50px; flex-shrink: 0;">
            <svg viewBox="0 0 48 48" style="width: 50px; height: 50px;">
              <path d="M24 4 L44 14 L44 34 L24 44 L4 34 L4 14 Z" fill="#3a9bd5" fill-opacity="0.1" />
              <path d="M24 4 L44 14 L44 34 L24 44 L4 34 L4 14 Z" fill="none" stroke="#3a9bd5" stroke-width="2.5" />
              <rect x="16" y="18" width="16" height="12" rx="2" fill="#3a9bd5" />
            </svg>
            <span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-family: sans-serif; font-weight: 900; color: white; font-size: 11px; pointer-events: none;">${cartouche.logoInitials}</span>
          </div>
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-family: sans-serif; font-weight: 900; font-size: 17px; letter-spacing: -0.3px; color: #0f172a;">${cartouche.companyName}</span>
            <span style="font-family: sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.2em; color: #64748b; margin-top: 2px; text-transform: uppercase;">${cartouche.companyTagline}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <h1 style="color: #1a5276; margin: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">${cartouche.documentTitle}</h1>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 12px; font-weight: 700;">Conception aux Eurocodes 2${cartouche.logoInitials ? ' | ' + cartouche.logoInitials : ''}</p>
        </div>
      </div>

      <div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 14px; color: #334155;">
          <strong style="color: #1a5276; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Identification du Projet</strong>
          <span style="font-weight: 700; font-size: 16px;">${projectName}</span>
        </div>
        <div style="text-align: right; font-size: 14px; color: #64748b;">
          <strong style="color: #1a5276; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px;">Date d'Étude</strong>
          <span style="font-weight: 600;">${new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div style="margin-bottom: 10px; padding: 22px 25px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h3 style="margin: 0 0 12px; font-size: 13px; color: #1a5276; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Table des Matières</h3>
        <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.9;">
          ${sommaireItems.map(it => `<li>${it}</li>`).join('')}
        </ol>
      </div>

      <div style="margin-bottom: 10px; padding: 22px 25px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h3 style="margin: 0 0 12px; font-size: 13px; color: #1a5276; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Table des Illustrations</h3>
        <table style="width: 100%; font-size: 12px; color: #334155; border-collapse: collapse;">
          ${illustrations.map((it, i) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 6px 0; font-weight: 700; color: #1a5276; width: 70px;">Figure ${i + 1}</td>
            <td style="padding: 6px 0;">${it}</td>
          </tr>`).join('')}
        </table>
      </div>

      ${sectionTitle('1', 'HYPOTHÈSES DES MATÉRIAUX')}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px;">
        <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #f1f5f9;">
          <h3 style="font-size: 13px; color: #3a9bd5; margin: 0 0 10px; text-transform: uppercase; font-weight: 800;">Béton de Structure</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #64748b;">Classe de béton</td><td style="text-align: right; font-weight: 700;">C${state.fck}/${Math.round(state.fck * 1.2)}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">fck (Compression)</td><td style="text-align: right; font-weight: 700;">${results.fck} MPa</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">fcd (Calcul)</td><td style="text-align: right; font-weight: 700;">${formatNum(results.fcd, 2)} MPa</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">fctm (Traction moy)</td><td style="text-align: right; font-weight: 700;">${formatNum(results.fctm, 2)} MPa</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Ecm (Module Young)</td><td style="text-align: right; font-weight: 700;">${Math.round(results.Ecm)} MPa</td></tr>
          </table>
        </div>
        <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #f1f5f9;">
          <h3 style="font-size: 13px; color: #3a9bd5; margin: 0 0 10px; text-transform: uppercase; font-weight: 800;">Aciers & Durabilité</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #64748b;">Type d'Acier</td><td style="text-align: right; font-weight: 700;">Haute Adhérence B500</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">fyk (Limite élastique)</td><td style="text-align: right; font-weight: 700;">${results.fyk} MPa</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Exposition</td><td style="text-align: right; font-weight: 700;">${state.exposure}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Enrobage cnom</td><td style="text-align: right; font-weight: 700;">${results.cnom} mm</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Hauteur utile d</td><td style="text-align: right; font-weight: 700;">${formatNum(results.d,1)} mm</td></tr>
          </table>
        </div>
      </div>

      ${sectionTitle('2', 'DONNÉES GÉOMÉTRIQUES & CHARGES')}
      <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
        ${renderGeometryDiagram(state, results)}
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: 600;">Géométrie de la Dalle</td>
            <td style="text-align: right;">${state.Lx} m (Lx) × ${state.Ly} m (Ly) | h = ${state.h} mm</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: 600;">Schéma Statique</td>
            <td style="text-align: right;">${state.appuiType === AppuiType.FourSides ? 'Appuyée sur 4 côtés' : 'Appuyée sur 2 côtés'} | ${state.borderCond === BorderCondition.SimplySupported ? 'Articulation simple' : 'Continuité / Encastrement'}</td>
          </tr>
          ${results.effectiveOneWay ? `
          <tr style="border-bottom: 1px solid #e2e8f0; background: #fffbeb;">
            <td style="padding: 10px 0; font-weight: 600; color: #92400e;">Hypothèse de calcul (EC2 §5.3.1(5))</td>
            <td style="text-align: right; color: #92400e; font-weight: 700;">Ly/Lx = ${formatNum(results.ratioLxLy, 2)} &gt; 2 → dalle calculée en 1 seul sens (portée Lx)</td>
          </tr>
          ` : ''}
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: 600;">Charges Permanentes G</td>
            <td style="text-align: right;">${formatNum(results.g_total, 2)} kN/m² (Poids propre + G additionnel)</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: 600;">Charges d'Exploitation Q</td>
            <td style="text-align: right;">${formatNum(results.qk, 2)} kN/m² (${cat.label})</td>
          </tr>
          <tr style="background: #1a5276; color: white;">
            <td style="padding: 10px 8px; font-weight: 700;">Combinaison Ultime ELU (pu = 1.35G + 1.5Q)</td>
            <td style="text-align: right; padding-right: 8px; font-weight: 800; font-size: 15px;">${formatNum(results.pu, 2)} kN/m²</td>
          </tr>
        </table>
      </div>

      ${sectionTitle('3', 'ANALYSE DES SOLLICITATIONS')}
      <div style="margin-bottom: 15px;">
        <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Les moments sont calculés suivant les théories des plaques minces et les coefficients de redistribution Eurocode 2 (ou, en dalle unidirectionnelle, la théorie des poutres).</p>
        <div style="background: #f8fafc; padding: 10px; border-radius: 12px; margin-bottom: 15px;">
          ${renderLoadDiagram(state, results)}
        </div>
        ${state.appuiType === AppuiType.FourSides && !results.effectiveOneWay && results.coeffs ? `
        ${eq('Moment en travée Mx (EC2 — méthode des coefficients)', 'Mx = αx · pu · Lx²', `${formatNum(results.coeffs.alphaX_trav, 4)} × ${formatNum(results.pu, 2)} × ${state.Lx}²`, `${formatNum(results.MEd_x, 2)} kNm/m`)}
        ` : `
        ${eq('Moment en travée Mx (dalle-poutre, ' + (state.borderCond === BorderCondition.SimplySupported ? '1' : (state.borderCond === BorderCondition.Continuous ? '0,6' : '0,5')) + '×pu·Lx²/8)', `Mx = ${state.borderCond === BorderCondition.SimplySupported ? '' : (state.borderCond === BorderCondition.Continuous ? '0,6 · ' : '0,5 · ')}pu · Lx² / 8`, `${state.borderCond === BorderCondition.SimplySupported ? '' : (state.borderCond === BorderCondition.Continuous ? '0,6 × ' : '0,5 × ')}${formatNum(results.pu, 2)} × ${state.Lx}² / 8`, `${formatNum(results.MEd_x, 2)} kNm/m`)}
        `}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
          <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
            <h4 style="margin: 0 0 10px; font-size: 11px; color: #1a5276; text-transform: uppercase; font-weight: 800;">Moments en Travée (kNm/m)</h4>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700;">
              <span style="color: #334155;">Mx : ${formatNum(results.MEd_x, 2)}</span>
              <span style="color: #334155;">My : ${(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? formatNum(results.MEd_y, 2) : 'n/a (1 sens)'}</span>
            </div>
          </div>
          <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
            <h4 style="margin: 0 0 10px; font-size: 11px; color: #1a5276; text-transform: uppercase; font-weight: 800;">Moments aux Appuis (kNm/m)</h4>
            <div style="font-size: 14px; font-weight: 700; text-align: center; color: #334155;">
              M_appui : ${formatNum(results.MEd_app_x, 2)}
            </div>
          </div>
        </div>
      </div>

      ${sectionTitle('4', 'ÉTATS LIMITES ULTIMES & SERVICE (EC2)')}
      <div style="margin-bottom: 15px;">
        ${eq('Moment réduit μ (EC2 §3.1.7)', 'μ = MEd·10⁶ / (b·d²·fcd)', `${formatNum(results.MEd_max,2)}·10⁶ / (${CONSTANTS.b}×${formatNum(results.d,1)}²×${formatNum(results.fcd,2)})`, formatNum(results.mu,4))}
        ${eq('Section d\'acier requise As (bras de levier z)', 'As = MEd·10⁶ / (z·fyd)', `${formatNum(results.MEd_max,2)}·10⁶ / (${formatNum(results.z,1)}×${formatNum(results.fyd,1)})`, `${formatNum(results.As_th_mm2/100,2)} cm²/m`)}
        ${eq('Résistance au cisaillement VRd,c (EC2 §6.2.2)', 'VRd,c = [CRd,c·k·(100·ρl·fck)^⅓]·b·d', `k=${formatNum(1+Math.sqrt(200/results.d),2)}, ρl=${formatNum(results.rho_l*100,3)}%`, `${formatNum(results.VRd_c,2)} kN`)}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
        <div style="padding: 15px; border-radius: 12px; background: ${results.mu <= 0.372 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${results.mu <= 0.372 ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${results.mu <= 0.372 ? '#166534' : '#991b1b'};">Flexion ELU</h4>
          <div style="font-size: 11px; color: #64748b;">μ = ${formatNum(results.mu, 4)} | μ_lim = 0.372</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${results.mu <= 0.372 ? '✓ ARMATURES TENDUES UNIQUEMENT' : '✗ SECTION INSUFFISANTE'}</p>
        </div>
        <div style="padding: 15px; border-radius: 12px; background: ${results.shearOk ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${results.shearOk ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${results.shearOk ? '#166534' : '#991b1b'};">Cisaillement</h4>
          <div style="font-size: 11px; color: #64748b;">VEd = ${formatNum(results.VEd, 1)} kN | VRd,c = ${formatNum(results.VRd_c, 1)} kN</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${results.shearOk ? '✓ CONFORME SANS ÉTRIERS' : '✗ EFFORT TROP ÉLEVÉ'}</p>
        </div>
        <div style="padding: 15px; border-radius: 12px; background: ${results.crackOk ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${results.crackOk ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${results.crackOk ? '#166534' : '#991b1b'};">Fissuration ELS</h4>
          <div style="font-size: 11px; color: #64748b;">wk = ${formatNum(results.wk, 3)} mm | w_lim = ${results.w_max} mm</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${results.crackOk ? '✓ OUVERTURE MAÎTRISÉE' : '✗ RISQUE DE FISSURATION'}</p>
        </div>
        <div style="padding: 15px; border-radius: 12px; background: ${results.deflectionOk ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${results.deflectionOk ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${results.deflectionOk ? '#166534' : '#991b1b'};">Déformabilité (ELS)</h4>
          <div style="font-size: 11px; color: #64748b;">L/d = ${formatNum(results.Ld_real, 1)} | L/d_lim = ${formatNum(results.limitLd, 1)}</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${results.deflectionOk ? '✓ ÉTAT DE FLÈCHE ADMISSIBLE' : '✗ FLÈCHE EXCESSIVE'}</p>
        </div>
        <div style="padding: 15px; border-radius: 12px; background: ${(results.spacingXOk && results.spacingYOk) ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${(results.spacingXOk && results.spacingYOk) ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${(results.spacingXOk && results.spacingYOk) ? '#166534' : '#991b1b'};">Espacement Max (EC2 §9.3.1.1)</h4>
          <div style="font-size: 11px; color: #64748b;">sx = ${Math.round(results.esp_x_final)}/${Math.round(results.maxSpacing_x)}mm | sy = ${Math.round(results.esp_y_final)}/${Math.round(results.maxSpacing_y)}mm</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${(results.spacingXOk && results.spacingYOk) ? '✓ ESPACEMENTS CONFORMES' : '✗ ESPACEMENT EXCESSIF'}</p>
        </div>
        <div style="padding: 15px; border-radius: 12px; background: ${results.asMaxOk ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${results.asMaxOk ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${results.asMaxOk ? '#166534' : '#991b1b'};">Ferraillage Maximal (EC2 §9.2.1.1)</h4>
          <div style="font-size: 11px; color: #64748b;">As = ${formatNum(Math.max(results.As_used_mm2, results.As_req_y)/100,2)} | As,max = ${formatNum(results.As_max_mm2/100,2)} cm²/m</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${results.asMaxOk ? '✓ As ≤ 0,04·Ac' : '✗ As,max DÉPASSÉ'}</p>
        </div>
        <div style="padding: 15px; border-radius: 12px; background: ${(results.sectionSufficientX && results.sectionSufficientY) ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${(results.sectionSufficientX && results.sectionSufficientY) ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${(results.sectionSufficientX && results.sectionSufficientY) ? '#166534' : '#991b1b'};">Section Fournie ≥ Requise</h4>
          <div style="font-size: 11px; color: #64748b;">As,x = ${formatNum(results.As_reel_x/100,2)}/${formatNum(results.As_req_x/100,2)} | As,y = ${formatNum(results.As_reel_y/100,2)}/${formatNum(results.As_req_y/100,2)} cm²/m</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${(results.sectionSufficientX && results.sectionSufficientY) ? '✓ ESPACEMENT RETENU CONFORME' : '✗ ESPACEMENT TROP LARGE'}</p>
        </div>
        ${results.As_req_top > 0 ? `
        <div style="padding: 15px; border-radius: 12px; background: ${(results.sectionSufficientTop && results.spacingTopOk) ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${(results.sectionSufficientTop && results.spacingTopOk) ? '#bbf7d0' : '#fecaca'};">
          <h4 style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: ${(results.sectionSufficientTop && results.spacingTopOk) ? '#166534' : '#991b1b'};">Nappe Supérieure (Chapeaux)</h4>
          <div style="font-size: 11px; color: #64748b;">As = ${formatNum(results.As_reel_top/100,2)}/${formatNum(results.As_req_top/100,2)} cm²/m | esp = ${Math.round(results.esp_top_final)}/${Math.round(results.maxSpacing_top)}mm</div>
          <p style="font-size: 12px; font-weight: 800; margin-top: 8px;">${(results.sectionSufficientTop && results.spacingTopOk) ? '✓ CONFORME' : '✗ NON CONFORME'}</p>
        </div>
        ` : ''}
      </div>

      ${results.punchActive ? `
      <div style="margin-bottom: 25px; padding: 20px; border-radius: 16px; background: ${results.punchingOk ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${results.punchingOk ? '#bbf7d0' : '#fecaca'};">
         <h4 style="margin: 0 0 10px; font-size: 14px; font-weight: 900; color: ${results.punchingOk ? '#166534' : '#991b1b'}; text-transform: uppercase; letter-spacing: 1px;">Vérification au Poinçonnement (EC2 6.4) - Position: ${state.columnPosition}</h4>
         <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
           <div style="flex: 0 0 220px;">${renderPunchingDiagram(state, results)}</div>
           <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 13px; min-width: 260px;">
             <div><span style="color: #64748b; font-size: 11px; display: block;">Effort Ultime VEd</span><strong>${formatNum(results.VEd_punch, 1)} kN</strong></div>
             <div><span style="color: #64748b; font-size: 11px; display: block;">Résistance VRd,c</span><strong>${formatNum(results.VRd_c_punch, 1)} kN</strong></div>
             <div style="text-align: right;"><span style="color: #64748b; font-size: 11px; display: block;">Verdict</span><strong style="color: ${results.punchingOk ? '#166534' : '#991b1b'};">${results.punchingOk ? 'CONFORME ✓' : 'INSUFFISANT ✗'}</strong></div>
           </div>
         </div>
      </div>
      ` : ''}

      ${sectionTitle('5', 'DISPOSITIONS CONSTRUCTIVES & NOMENCLATURE (BBS)')}
      <div style="background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; color: #334155; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px 10px; font-weight: 800;">REP</th>
              <th style="padding: 12px 10px; font-weight: 800;">DÉSIGNATION DES ARMATURES</th>
              <th style="padding: 12px 10px; text-align: center; font-weight: 800;">ϕ (mm)</th>
              <th style="padding: 12px 10px; text-align: center; font-weight: 800;">NB</th>
              <th style="padding: 12px 10px; text-align: center; font-weight: 800;">L (m)</th>
              <th style="padding: 12px 10px; text-align: center; font-weight: 800;">ESP (mm)</th>
              <th style="padding: 12px 10px; text-align: center; font-weight: 800;">P.U. (kg/m)</th>
              <th style="padding: 12px 10px; text-align: right; font-weight: 800;">POIDS (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fff;">
              <td style="padding: 10px; font-weight: 800; color: #1a5276;">1</td>
              <td style="padding: 10px; font-weight: 600;">Nappe Inférieure - Sens Porteur (Lx)</td>
              <td style="padding: 10px; text-align: center; font-weight: 700;">${state.diam_inf_x}</td>
              <td style="padding: 10px; text-align: center;">${results.qty_x}</td>
              <td style="padding: 10px; text-align: center;">${formatNum(results.length_x, 2)}</td>
              <td style="padding: 10px; text-align: center;">${Math.round(results.esp_x_final)}</td>
              <td style="padding: 10px; text-align: center;">${formatNum(results.linear_weight_x, 3)}</td>
              <td style="padding: 10px; text-align: right; font-weight: 800;">${formatNum(results.weight_x, 2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fbfcfd;">
              <td style="padding: 10px; font-weight: 800; color: #1a5276;">2</td>
              <td style="padding: 10px; font-weight: 600;">${(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? 'Nappe Inférieure - Sens Ly' : 'Armatures de Répartition - Ly'}</td>
              <td style="padding: 10px; text-align: center; font-weight: 700;">${(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? state.diam_inf_y : 8}</td>
              <td style="padding: 10px; text-align: center;">${results.qty_y}</td>
              <td style="padding: 10px; text-align: center;">${formatNum(results.length_y, 2)}</td>
              <td style="padding: 10px; text-align: center;">${Math.round(results.esp_y_final)}</td>
              <td style="padding: 10px; text-align: center;">${formatNum(results.linear_weight_y, 3)}</td>
              <td style="padding: 10px; text-align: right; font-weight: 800;">${formatNum(results.weight_y, 2)}</td>
            </tr>
            ${results.weight_top > 0 ? `
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fff;">
              <td style="padding: 10px; font-weight: 800; color: #1a5276;">3</td>
              <td style="padding: 10px; font-weight: 600;">Armatures de Chapeaux (Moments sur appuis)</td>
              <td style="padding: 10px; text-align: center; font-weight: 700;">${state.diam_top ?? state.diam_inf_x}</td>
              <td style="padding: 10px; text-align: center;">${results.qty_top}</td>
              <td style="padding: 10px; text-align: center;">${results.len_top}</td>
              <td style="padding: 10px; text-align: center;">${Math.round(results.esp_top_final)}</td>
              <td style="padding: 10px; text-align: center;">${formatNum(results.linear_weight_top, 3)}</td>
              <td style="padding: 10px; text-align: right; font-weight: 800;">${formatNum(results.weight_top, 2)}</td>
            </tr>
            ` : ''}
            <tr style="background: #0f172a; color: white;">
              <td colspan="7" style="padding: 14px 10px; text-align: right; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 10px;">Masse Totale des Armatures</td>
              <td style="padding: 14px 10px; text-align: right; font-weight: 900; font-size: 15px; color: #3a9bd5;">${formatNum(results.weight_total, 2)} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-size: 10px; color: #94a3b8; margin: 0 0 15px;">Longueurs unitaires incluant l'ancrage réglementaire à chaque extrémité (lbd, EC2 §8.4.4). Poids linéique P.U. = ϕ²/162 (kg/m).</p>

      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 12px; font-size: 12px; color: #1a5276; text-transform: uppercase; font-weight: 800;">Ancrage & Recouvrement (ϕ de calcul = ${state.phi}mm)</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 12px;">
          <div><span style="color: #64748b; font-size: 10px; display: block;">lb,rqd (EC2 8.4.3)</span><strong>${Math.round(results.lb_rqd)} mm</strong></div>
          <div><span style="color: #64748b; font-size: 10px; display: block;">Recouvrement l0 (α6=1,2)</span><strong>${Math.round(results.l0)} mm</strong></div>
          <div><span style="color: #64748b; font-size: 10px; display: block;">Ancrage lbd (EC2 8.4.4)</span><strong>${Math.round(results.lbd)} mm</strong></div>
        </div>
      </div>

      ${sectionTitle('6', 'BIBLIOGRAPHIE')}
      <div style="background: #f8fafc; padding: 20px 25px; border-radius: 12px; margin-bottom: 25px; font-size: 12px; color: #334155;">
        <ol style="margin: 0; padding-left: 18px; line-height: 2;">
          <li>NF EN 1990:2002 + A1 — Eurocode 0 : Bases de calcul des structures.</li>
          <li>NF EN 1991-1-1:2002 — Eurocode 1 : Actions sur les structures — Partie 1-1 : Poids volumiques, poids propres, charges d'exploitation.</li>
          <li>NF EN 1992-1-1:2004 + A1 — Eurocode 2 : Calcul des structures en béton — Partie 1-1 : Règles générales et règles pour les bâtiments.</li>
          <li>Valeurs recommandées de l'Eurocode 2 utilisées en l'absence d'Annexe Nationale spécifiée par l'utilisateur (γc=1,5 ; γs=1,15 ; coefficients du Tableau 3.1, 7.1N, 7.4N, 9.1N).</li>
          <li>Méthode des coefficients (abaques type Pigeaud/Bares) pour la répartition des moments dans les dalles rectangulaires appuyées sur 4 côtés — pratique courante complémentaire à l'EC2, non normative.</li>
        </ol>
      </div>

      <div style="margin-top: 30px; padding: 25px; border: 3px solid ${globalOk ? '#166534' : '#991b1b'}; background: ${globalOk ? '#f0fdf4' : '#fef2f2'}; border-radius: 16px; text-align: center; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);">
        <div style="font-weight: 950; font-size: 24px; color: ${globalOk ? '#166534' : '#991b1b'}; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 5px;">
          ${globalOk ? 'Conception Validée ✓' : 'Dimensionnement Invalide ✗'}
        </div>
        <p style="margin: 0; font-size: 12px; color: ${globalOk ? '#166534' : '#991b1b'}; font-weight: 700; opacity: 0.8;">
          Note de calcul générée en conformité avec la NF EN 1992-1-1
        </p>
      </div>

      <div style="margin-top: 60px; padding-top: 40px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: end;">
        <div style="max-width: 250px;">
          <p style="margin: 0; font-size: 13px; font-weight: 900; color: #0f172a;">VISA DE L'INGÉNIEUR</p>
          <p style="margin: 6px 0 0; font-size: 11px; color: #64748b; font-style: italic;">Cachet et signature pour approbation technique</p>
          ${cartouche.engineerName ? `<p style="margin: 10px 0 0; font-size: 12px; color: #334155; font-weight: 700;">${cartouche.engineerName}</p>` : ''}
          <div style="margin-top: 20px; width: 180px; height: 75px; border: 2px dashed #e2e8f0; border-radius: 8px; background: #fafafa; display: flex; align-items: center; justify-content: center; color: #e2e8f0; font-size: 8px;">CADRE RÉSERVÉ</div>
        </div>
        <div style="text-align: right;">
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #334155; font-weight: 600;">
            <p style="margin: 0; color: #1a5276; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Expertise Structurelle</p>
            <p style="margin: 0;">${cartouche.companyName}${cartouche.companyTagline ? ' - ' + cartouche.companyTagline : ''}</p>
            ${cartouche.email ? `<p style="margin: 0;">E-mail : ${cartouche.email}</p>` : ''}
            ${cartouche.phone ? `<p style="margin: 0;">Tél : ${cartouche.phone}</p>` : ''}
          </div>
          <p style="margin-top: 15px; font-size: 9px; color: #94a3b8; font-weight: 500;">Système Expert ${cartouche.logoInitials || cartouche.companyName}</p>
        </div>
      </div>
    </div>
  `;
};