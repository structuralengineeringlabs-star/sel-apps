/**
 * Moteur de calcul — Dimensionnement de plancher à corps creux (EN 1992-1-1).
 *
 * Ce module est volontairement indépendant de React : ce sont des fonctions
 * pures (mêmes entrées => mêmes sorties, aucun effet de bord) qui peuvent
 * être testées et réutilisées indépendamment de l'interface.
 */
import type {
  Geometrie,
  Materiaux,
  Durability,
  ChargesDetails,
  ChoixManuel,
  EtriersParams,
  Resultats,
  ChoixAcier,
  EtriersResult,
} from '../types';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const FCK_CUBE_MAP: Record<number, number> = { 16: 20, 20: 25, 25: 30, 30: 37, 35: 45, 40: 50, 45: 55, 50: 60 };

export function classeBeton(fck: number): string {
  const fckCube = FCK_CUBE_MAP[fck] ?? fck + 5;
  return `C${fck}/${fckCube}`;
}

/** Valeurs limites Q (kN/m²) par catégorie d'usage — EN 1991-1-1 Tableau 6.2. */
export const CHARGES_EXPLOITATION: Record<string, number> = {
  A: 1.5,
  B: 2.5,
  C1: 3.0,
  C2: 4.0,
  C3: 5.0,
  D1: 5.0,
};

// ---------------------------------------------------------------------------
// Durabilité — enrobage
// ---------------------------------------------------------------------------

export function enrobageNominal(materiaux: Materiaux, durabilite: Durability): number {
  if (durabilite.enrobage_manuel > 0) return durabilite.enrobage_manuel;

  const { fck } = materiaux;
  const exp = durabilite.exposition;
  let c_min_dur = 15;

  if (exp === 'XC1') c_min_dur = fck >= 30 ? 15 : 20;
  else if (exp === 'XC2' || exp === 'XC3') c_min_dur = fck >= 35 ? 20 : fck >= 30 ? 25 : 30;
  else if (exp === 'XC4') c_min_dur = fck >= 35 ? 25 : fck >= 30 ? 30 : 35;
  else if (exp === 'XD1' || exp === 'XS1') c_min_dur = fck >= 35 ? 35 : fck >= 30 ? 40 : 45;

  if (durabilite.classe_structurale === 'S5') c_min_dur = Math.ceil(c_min_dur * 1.1);
  if (durabilite.classe_structurale === 'S6') c_min_dur = Math.ceil(c_min_dur * 1.2);

  const c_min = Math.max(12, c_min_dur, 10);
  const delta = durabilite.dev_ecart || 0;
  return c_min + delta;
}

export function hauteurUtile(geometrie: Geometrie, enrobage_mm: number, phiEtrier_mm: number, phiLongitudinal_mm: number): number {
  const h = (geometrie.epaisseur_dalle + geometrie.epaisseur_entrevous) / 100;
  const c = enrobage_mm / 1000;
  const phi_w = phiEtrier_mm / 1000;
  const phi_l = phiLongitudinal_mm / 1000;
  return h - c - phi_w - phi_l / 2;
}

// ---------------------------------------------------------------------------
// Charges
// ---------------------------------------------------------------------------

export function poidsEntrevousParM2(geometrie: Geometrie, chargesDetails: ChargesDetails): number {
  if (chargesDetails.poids_entrevous_manuel > 0) return chargesDetails.poids_entrevous_manuel;
  const REF_HAUTEUR_CM = 16;
  const REF_POIDS_KN_M2 = 0.6;
  return (REF_POIDS_KN_M2 / REF_HAUTEUR_CM) * geometrie.epaisseur_entrevous;
}

export function poidsLineaire(diam_mm: number): number {
  return (Math.PI * Math.pow(diam_mm / 1000, 2)) / 4 * 7850;
}

// ---------------------------------------------------------------------------
// Flexion ELU
// ---------------------------------------------------------------------------

export function asMinFlexion(bw_m: number, d: number, fck: number, fyk: number): number {
  const As_min_m2 = Math.max((0.26 * (0.3 * Math.pow(fck, 2 / 3)) / fyk) * bw_m * d, 0.0013 * bw_m * d);
  return parseFloat((As_min_m2 * 10000).toFixed(2));
}

export function asMaxSection(beff_m: number, hf_m: number, bw_m: number, hw_m: number): number {
  const Ac_m2 = beff_m * hf_m + bw_m * hw_m;
  return parseFloat((0.04 * Ac_m2 * 10000).toFixed(2));
}

export function longueurAncrage(diam_mm: number, fck: number, fyk: number): number {
  const fctm = 0.3 * Math.pow(fck, 2 / 3);
  const fctd = (0.7 * fctm) / 1.5;
  const fbd = 2.25 * fctd;
  const fyd = fyk / 1.15;
  const lb_rqd = (diam_mm / 4) * (fyd / fbd);
  const lb_min = Math.max(0.3 * lb_rqd, 10 * diam_mm, 100);
  return Math.max(lb_rqd, lb_min);
}

export function calculerSectionAcierTheorique(
  M_ed_kNm: number,
  b_m: number,
  bw_m: number,
  hf_m: number,
  fck: number,
  fyk: number,
  d: number,
  est_section_T: boolean
): number {
  if (M_ed_kNm <= 0.01) return 0.0;
  const fcd = fck / 1.5;
  const fyd = fyk / 1.15;
  const M_ed_MNm = M_ed_kNm / 1000;
  let largeur_calcul = bw_m;
  let As_m2 = 0;

  if (est_section_T) {
    const M_table = b_m * hf_m * fcd * (d - hf_m / 2);
    if (M_ed_MNm <= M_table) {
      largeur_calcul = b_m;
    } else {
      const M1 = (b_m - bw_m) * hf_m * fcd * (d - hf_m / 2);
      const M2 = M_ed_MNm - M1;
      const mu_w = M2 / (bw_m * d * d * fcd);
      if (mu_w > 0.371) return Infinity;
      const alpha_w = 1.25 * (1 - Math.sqrt(1 - 2 * mu_w));
      As_m2 = M1 / (fyd * (d - hf_m / 2)) + M2 / (d * (1 - 0.4 * alpha_w) * fyd);
    }
  }

  if (As_m2 === 0) {
    const mu = M_ed_MNm / (largeur_calcul * d * d * fcd);
    if (mu > 0.371) return Infinity;
    const alpha = 1.25 * (1 - Math.sqrt(1 - 2 * mu));
    As_m2 = M_ed_MNm / (d * (1 - 0.4 * alpha) * fyd);
  }

  const As_min_cm2 = asMinFlexion(bw_m, d, fck, fyk);
  return parseFloat(Math.max(As_m2 * 10000, As_min_cm2).toFixed(2));
}

// ---------------------------------------------------------------------------
// États limites de service — contraintes
// ---------------------------------------------------------------------------

export function verifierELS(M_els_kNm: number, b_eff_m: number, As_prov_cm2: number, fck: number, fyk: number, d: number) {
  if (M_els_kNm <= 0 || As_prov_cm2 <= 0) {
    return { conforme: true, statut: 'Attente', sigma_c: '0', sigma_s: '0', limite_c: '0', limite_s: '0', M_els: '0' };
  }
  const M_els_MNm = M_els_kNm / 1000;
  const As_m2 = As_prov_cm2 / 10000;
  const ae = 15;
  const a = 0.5 * b_eff_m;
  const b2 = ae * As_m2;
  const c = -ae * As_m2 * d;
  const y1 = (-b2 + Math.sqrt(b2 * b2 - 4 * a * c)) / (2 * a);
  const Icr = (b_eff_m * Math.pow(y1, 3)) / 3 + ae * As_m2 * Math.pow(d - y1, 2);
  const sigma_c = (M_els_MNm * y1) / Icr;
  const sigma_s = (ae * (M_els_MNm * (d - y1))) / Icr;
  const limite_c = 0.6 * fck;
  const limite_s = 0.8 * fyk;
  const conforme = sigma_c <= limite_c && sigma_s <= limite_s;
  const statut = conforme ? 'Contraintes OK' : sigma_c > limite_c ? 'Béton trop comprimé' : 'Acier trop tendu';
  return {
    sigma_c: sigma_c.toFixed(1),
    sigma_s: sigma_s.toFixed(1),
    limite_c: limite_c.toFixed(1),
    limite_s: limite_s.toFixed(1),
    conforme,
    statut,
    M_els: M_els_kNm.toFixed(2),
  };
}

// ---------------------------------------------------------------------------
// Effort tranchant — béton seul
// ---------------------------------------------------------------------------

export function verifierCisaillement(V_ed_kN: number, bw_m: number, fck: number, As_tension_cm2: number, d: number) {
  if (V_ed_kN <= 0.01) return { V_Rdc: '0', statut: 'Aucun effort', besoin_etriers: false };

  const As = Math.max(As_tension_cm2, 0) / 10000;
  const k = Math.min(1 + Math.sqrt(0.2 / d), 2.0);
  const rho_l = Math.min(As / (bw_m * d), 0.02);
  const Vrdc =
    Math.max((0.18 / 1.5) * k * Math.pow(100 * rho_l * fck, 1 / 3) * bw_m * d, 0.035 * Math.pow(k, 1.5) * Math.sqrt(fck) * bw_m * d) * 1000;
  return { V_Rdc: Vrdc.toFixed(2), statut: V_ed_kN > Vrdc ? 'Étriers requis' : 'Béton seul OK', besoin_etriers: V_ed_kN > Vrdc };
}

// ---------------------------------------------------------------------------
// Effort tranchant — étriers (treillis de Mörsch)
// ---------------------------------------------------------------------------

export function calculerEtriers(
  V_ed_kN: number,
  bw_m: number,
  fck: number,
  fyk: number,
  diam_mm: number,
  nb_branches: number,
  cot_theta: number,
  d: number
): EtriersResult {
  const z = 0.9 * d;
  const fyd = fyk / 1.15;
  const cotTheta = cot_theta;
  const tanTheta = 1 / cotTheta;
  const V_ed_MN = V_ed_kN / 1000;

  const fcd = fck / 1.5;
  const v1 = 0.6 * (1 - fck / 250);
  const V_Rd_max_kN = ((bw_m * z * v1 * fcd) / (cotTheta + tanTheta)) * 1000;

  if (V_ed_kN > V_Rd_max_kN) {
    return {
      s_cm: 0,
      s_max_cm: 0,
      Asw_s_req: '0',
      Asw_unitaire: '0',
      statut: `Écrasement de la bielle de béton : VEd > VRd,max (${V_Rd_max_kN.toFixed(1)} kN)`,
      V_Rds: '0',
      erreur: true,
    };
  }

  let Asw_s_req_m2_m = V_ed_MN / (z * fyd * cotTheta);

  const rho_w_min = (0.08 * Math.sqrt(fck)) / fyk;
  const Asw_s_min_m2_m = rho_w_min * bw_m;

  let dimensionnement_minimum = false;
  if (Asw_s_req_m2_m < Asw_s_min_m2_m) {
    Asw_s_req_m2_m = Asw_s_min_m2_m;
    dimensionnement_minimum = true;
  }

  const Asw_section_cm2 = nb_branches * Math.PI * Math.pow(diam_mm / 10 / 2, 2);
  const Asw_section_m2 = Asw_section_cm2 / 10000;

  let s_m = Asw_section_m2 / Asw_s_req_m2_m;
  const s_max_m = Math.min(0.75 * d, 0.3);
  s_m = Math.min(s_m, s_max_m);

  let s_cm = Math.floor(s_m * 100);
  if (s_cm > 30) s_cm = 30;
  if (s_cm < 5) s_cm = 5;
  const V_Rds_reel_kN = ((Asw_section_m2 / (s_cm / 100)) * z * fyd * cotTheta) * 1000;
  const V_Rd_final_kN = Math.min(V_Rds_reel_kN, V_Rd_max_kN);

  return {
    s_cm,
    s_max_cm: Math.round(s_max_m * 100),
    Asw_s_req: (Asw_s_req_m2_m * 10000).toFixed(2),
    Asw_unitaire: Asw_section_cm2.toFixed(3),
    statut: dimensionnement_minimum ? 'Ferraillage minimum' : `Calculé (cotθ=${cotTheta})`,
    V_Rds: V_Rd_final_kN.toFixed(2),
    erreur: false,
  };
}

// ---------------------------------------------------------------------------
// Flèche (ELS) — ratio L/d
// ---------------------------------------------------------------------------

export function verifierFleche(L: number, fck: number, As_req: number, As_prov: number, bw: number, type: string, d: number) {
  if (As_req <= 0 || !Number.isFinite(As_req)) return { statut: 'Attente', conforme: false, L_d_reel: '0', L_d_limite: '0' };
  const Ld = L / d;
  const K = type === 'continu' ? 1.3 : 1.0;
  const rho = As_req / 10000 / (bw * d);
  const rho0 = 1e-3 * Math.sqrt(fck);

  let Ldlim =
    rho <= rho0
      ? K * (11 + 1.5 * Math.sqrt(fck) * (rho0 / rho) + 3.2 * Math.sqrt(fck) * Math.pow(rho0 / rho - 1, 1.5))
      : K * (11 + 1.5 * Math.sqrt(fck) * (rho0 / rho));

  if (As_prov > As_req) {
    const ratio = Math.min(As_prov / As_req, 1.5);
    Ldlim *= ratio;
  }
  if (L > 7) Ldlim *= 7 / L;

  return {
    L_d_reel: Ld.toFixed(1),
    L_d_limite: Ldlim.toFixed(1),
    conforme: Ld <= Ldlim,
    statut: Ld <= Ldlim ? 'Flèche OK' : 'Poutre souple',
  };
}

// ---------------------------------------------------------------------------
// Diagrammes M(x) / V(x)
// ---------------------------------------------------------------------------

export function calculerCourbesStatiques(l: number, Mtra: number, Mapp: number, Ved: number, type: string) {
  const n = 50;
  const M_vals: number[] = [];
  const V_vals: number[] = [];
  const continu = type === 'continu';

  for (let i = 0; i <= n; i++) {
    const x = (i / n) * l;
    const M = continu
      ? -Mapp + (Mtra + Mapp) * ((4 * x * (l - x)) / (l * l))
      : (4 * Mtra * x * (l - x)) / (l * l);
    const V = Ved * (1 - (2 * x) / l);
    M_vals.push(M);
    V_vals.push(V);
  }

  return { M_vals, V_vals, V_start_val: V_vals[0].toFixed(1), V_end_val: V_vals[n].toFixed(1) };
}

// ---------------------------------------------------------------------------
// Orchestrateur principal
// ---------------------------------------------------------------------------

export interface CalculInputs {
  geometrie: Geometrie;
  materiaux: Materiaux;
  durabilite: Durability;
  chargesDetails: ChargesDetails;
  choixManuel: ChoixManuel;
  etriersParams: EtriersParams;
}

export function calculerResultats(inputs: CalculInputs): Resultats | null {
  const { geometrie, materiaux, durabilite, chargesDetails, choixManuel, etriersParams } = inputs;

  if (!geometrie.portee || geometrie.portee <= 0) return null;
  if (!geometrie.entraxe || geometrie.entraxe <= 0) return null;
  if (!geometrie.largeur_ame || geometrie.largeur_ame <= 0) return null;

  const enrobage = enrobageNominal(materiaux, durabilite);
  const d = hauteurUtile(geometrie, enrobage, choixManuel.diametre_etrier, choixManuel.diametre_travee);

  if (!(d > 0)) return null;

  const bw = geometrie.largeur_ame / 100;
  const hf = geometrie.epaisseur_dalle / 100;
  const hw = geometrie.epaisseur_entrevous / 100;
  const beff = geometrie.entraxe;

  const poidsEntrevous = poidsEntrevousParM2(geometrie, chargesDetails);
  const G0 = (beff * hf * 25 + bw * hw * 25 + poidsEntrevous * (beff - bw)) / beff;
  const G_prime_total = chargesDetails.revetement_sol + chargesDetails.chape + chargesDetails.faux_plafond + chargesDetails.cloisons;
  const Q_total = CHARGES_EXPLOITATION[chargesDetails.type_local] ?? 1.5;

  const g = (G0 + G_prime_total) * beff;
  const q = Q_total * beff;
  const pELU = 1.35 * g + 1.5 * q;
  const pELS = g + q;
  const L = geometrie.portee;

  const m0 = (pELU * L * L) / 8;
  const m0ELS = (pELS * L * L) / 8;
  const v0 = (pELU * L) / 2;
  const cont = geometrie.type_appui === 'continu';

  const Mtra = cont ? 0.8 * m0 : m0;
  const Mapp = cont ? 0.5 * m0 : 0;
  const Mels = cont ? 0.8 * m0ELS : m0ELS;
  const Ved = cont ? 1.1 * v0 : v0;

  const fcd = materiaux.fck / 1.5;
  const fyd = materiaux.fyk / 1.15;

  const AsT = calculerSectionAcierTheorique(Mtra, beff, bw, hf, materiaux.fck, materiaux.fyk, d, true);
  const AsT_min = asMinFlexion(bw, d, materiaux.fck, materiaux.fyk);
  const AsA_calculee = calculerSectionAcierTheorique(Mapp, beff, bw, hf, materiaux.fck, materiaux.fyk, d, false);

  const appui_calcule = cont;
  const AsA = appui_calcule ? AsA_calculee : Math.max(asMinFlexion(bw, d, materiaux.fck, materiaux.fyk), 0.15 * (Number.isFinite(AsT) ? AsT : 0));

  const choixT: ChoixAcier = {
    nb: choixManuel.nb_travee,
    diametre: choixManuel.diametre_travee,
    as_fourni: choixManuel.nb_travee * (Math.PI * Math.pow(choixManuel.diametre_travee / 10 / 2, 2)),
    nom: `${choixManuel.nb_travee} HA ${choixManuel.diametre_travee}`,
  };
  const choixA: ChoixAcier = {
    nb: choixManuel.nb_appui,
    diametre: choixManuel.diametre_appui,
    as_fourni: choixManuel.nb_appui * (Math.PI * Math.pow(choixManuel.diametre_appui / 10 / 2, 2)),
    nom: `${choixManuel.nb_appui} HA ${choixManuel.diametre_appui}`,
  };

  const curves = calculerCourbesStatiques(L, Mtra, Mapp, Ved, geometrie.type_appui);
  const etriers = calculerEtriers(
    Ved,
    bw,
    materiaux.fck,
    materiaux.fyk,
    choixManuel.diametre_etrier,
    choixManuel.nb_branches_etrier,
    etriersParams.cot_theta,
    d
  );

  const as_ratio = AsT > 0 ? AsT / choixT.as_fourni : 0;

  const z = 0.9 * d;
  const M_rd = (choixT.as_fourni / 10000) * fyd * z * 1000;
  const flexion_ratio = Mtra / M_rd;

  const V_rd_val = parseFloat(etriers.V_Rds);
  const effort_tranchant_ratio = etriers.erreur ? Infinity : V_rd_val > 0 ? Ved / V_rd_val : Ved > 0.01 ? Infinity : 0;

  const fleche_res = verifierFleche(L, materiaux.fck, AsT, choixT.as_fourni, bw, geometrie.type_appui, d);
  const els_res = verifierELS(Mels, beff, choixT.as_fourni, materiaux.fck, materiaux.fyk, d);

  const as_tension_pour_cisaillement = cont ? choixA.as_fourni : choixT.as_fourni;
  const cisaillement = verifierCisaillement(Ved, bw, materiaux.fck, as_tension_pour_cisaillement, d);

  const As_max_cm2 = asMaxSection(beff, hf, bw, hw);
  const pourcentage_armature = {
    As_max_cm2: As_max_cm2.toFixed(2),
    conforme: choixT.as_fourni <= As_max_cm2 && choixA.as_fourni <= As_max_cm2,
  };
  const espacement_etriers = {
    s_max_cm: etriers.s_max_cm,
    conforme: etriers.erreur || etriers.s_cm <= etriers.s_max_cm,
  };
  const lbd_mm = longueurAncrage(choixManuel.diametre_travee, materiaux.fck, materiaux.fyk);
  const ancrage = {
    lbd_mm: lbd_mm.toFixed(0),
    conforme_40phi: 40 * choixManuel.diametre_travee >= lbd_mm,
  };

  const est_valide =
    as_ratio <= 1 &&
    flexion_ratio <= 1 &&
    effort_tranchant_ratio <= 1 &&
    !etriers.erreur &&
    fleche_res.conforme &&
    els_res.conforme &&
    pourcentage_armature.conforme;

  return {
    hypothese_structurelle: cont ? 'Continue' : 'Isostatique',
    est_valide,
    details_charges: {
      G0_surf: G0.toFixed(2),
      G_prime_surf: G_prime_total.toFixed(2),
      Q_surf: Q_total.toFixed(2),
      g_lin: g.toFixed(2),
      q_lin: q.toFixed(2),
      p_elu_lin: pELU.toFixed(2),
      p_els_lin: pELS.toFixed(2),
      poids_entrevous_surf: poidsEntrevous.toFixed(3),
    },
    sollicitations: {
      M_ed_travee: Mtra.toFixed(2),
      M_ed_appui: Mapp.toFixed(2),
      V_ed: Ved.toFixed(2),
      M_els_travee: Mels.toFixed(2),
      M0_elu: m0.toFixed(2),
      M0_els: m0ELS.toFixed(2),
    },
    ferraillage: {
      As_travee: AsT,
      As_travee_min: AsT_min.toFixed(2),
      As_appui: AsA,
      choix_travee: choixT,
      choix_appui: choixA,
      appui_calcule,
      etriers,
      d_eff: (d * 100).toFixed(1),
      fcd: fcd.toFixed(2),
      fyd: fyd.toFixed(2),
    },
    verifications: {
      ferraillage: { ratio: as_ratio, conforme: as_ratio <= 1 },
      flexion: { ratio: flexion_ratio, conforme: flexion_ratio <= 1 },
      effort_tranchant: { ratio: effort_tranchant_ratio, conforme: effort_tranchant_ratio <= 1 },
      cisaillement,
      fleche: fleche_res,
      els: els_res,
      pourcentage_armature,
      espacement_etriers,
      ancrage,
    },
    courbes: curves,
  };
}