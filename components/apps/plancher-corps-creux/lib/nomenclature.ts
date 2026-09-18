import type { Geometrie } from '../types';

/**
 * Codes de forme simplifiés (inspirés d'EN ISO 3766 / usage courant des
 * bordereaux d'armatures) utilisés dans la nomenclature. Centralisés ici
 * pour que la Synthèse et la Note de calcul restent toujours cohérentes.
 */
export function formeTravee(lbd_mm: string): string {
  return `00 – Droit, ancrage lbd = ${lbd_mm} mm à chaque about (EN 1992-1-1 §8.4)`;
}

export function formeChapeau(appui_calcule: boolean): string {
  return appui_calcule
    ? '00 – Droit (prolongement forfaitaire L/2 de part et d’autre de l’appui)'
    : '01 – L avec crochet plongeant (chapeau de construction, forfaitaire)';
}

export interface FormeEtrier {
  label: string;
  /** Base du triangle : portée horizontale entre les deux angles bas (bw − 2c), en cm. */
  A_cm: number;
  /** Hauteur du triangle : de la base au sommet, au lit de chapeau (h − 2c), en cm. */
  B_cm: number;
}

/**
 * Étrier triangulaire **fermé** — une base (le long des barres de travée
 * extrêmes) et deux côtés (B, C) montant jusqu'à un sommet commun au
 * niveau du lit de chapeau, les trois angles étant de simples pliures. Le
 * façonnage se ferme au sommet par un crochet à 135° avec une queue de
 * 10 diamètres (« 10d »).
 */
export function formeEtrier(geometrie: Geometrie, enrobage_nominal_mm: number): FormeEtrier {
  const enrobage_cm = enrobage_nominal_mm / 10;
  const A_cm = Math.max(geometrie.largeur_ame - 2 * enrobage_cm, 0);
  const B_cm = Math.max(geometrie.epaisseur_dalle + geometrie.epaisseur_entrevous - 2 * enrobage_cm, 0);
  return {
    label: 'Étrier triangulaire fermé : base + côtés B/C, crochet de fermeture 135°/10d au sommet (EN ISO 4066 / NF A 35-027 pour le crochet ; façonnage spécifique par ailleurs)',
    A_cm,
    B_cm,
  };
}

/**
 * Longueur développée de l'étrier — périmètre du triangle réellement fermé
 * (base + 2 côtés, chacun l'hypoténuse base/hauteur) plus la longueur exacte
 * du crochet de fermeture normé — 10 diamètres (« 10d »), comptée deux fois
 * puisque les deux extrémités du fil se referment chacune par ce crochet
 * au sommet.
 */
export function longueurEtrier(geometrie: Geometrie, enrobage_nominal_mm: number, diametre_etrier_mm: number): number {
  const { A_cm, B_cm } = formeEtrier(geometrie, enrobage_nominal_mm);
  const cote_cm = Math.sqrt(Math.pow(A_cm / 2, 2) + Math.pow(B_cm, 2));
  const crochet_cm = (10 * diametre_etrier_mm) / 10; // 10d, converti mm -> cm
  return (A_cm + 2 * cote_cm + 2 * crochet_cm) / 100;
}