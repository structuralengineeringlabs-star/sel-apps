/**
 * Formatage d'affichage pour les grandeurs pouvant être non finies
 * (voir CORRECTIF sur la sentinelle "999" dans eurocode2.ts) : on montre un
 * message explicite plutôt qu'un nombre qui pourrait passer pour un vrai
 * résultat de calcul.
 */
export function formatAsCm2(As: number): string {
  if (!Number.isFinite(As)) return 'Section insuffisante';
  return `${As.toFixed(2)} cm²`;
}

export function formatRatioPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '>999 %';
  return `${(ratio * 100).toFixed(1)}%`;
}