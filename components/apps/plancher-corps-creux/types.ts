export type AppuiType = 'simple' | 'continu';

// Classes d'exposition couvertes par le moteur de calcul de l'enrobage.
export type ExpositionClass = 'XC1' | 'XC2' | 'XC3' | 'XC4' | 'XD1' | 'XS1';

// Classes structurales EN 1992-1-1 Tableau 4.3N réellement différenciées par le moteur.
export type ClasseStructurale = 'S3' | 'S4' | 'S5' | 'S6';

// Catégories d'exploitation EN 1991-1-1 Tableau 6.1 couvertes par le moteur de calcul.
export type TypeLocal = 'A' | 'B' | 'C1' | 'C2' | 'C3' | 'D1';

export interface Geometrie {
  type_appui: AppuiType;
  portee: number;
  entraxe: number;
  largeur_ame: number;
  epaisseur_entrevous: number;
  epaisseur_dalle: number;
}

export interface Materiaux {
  fck: number;
  fyk: number;
}

export interface Durability {
  exposition: ExpositionClass;
  classe_structurale: ClasseStructurale;
  dev_ecart: number;
  enrobage_manuel: number;
}

export interface ChargesDetails {
  revetement_sol: number;
  chape: number;
  faux_plafond: number;
  cloisons: number;
  type_local: TypeLocal;
  poids_entrevous_manuel: number;
}

export interface ChoixManuel {
  nb_travee: number;
  diametre_travee: number;
  nb_appui: number;
  diametre_appui: number;
  nb_branches_etrier: number;
  diametre_etrier: number;
}

export interface EtriersParams {
  cot_theta: number;
}

export interface ChoixAcier {
  nb: number;
  diametre: number;
  as_fourni: number;
  nom: string;
}

export interface EtriersResult {
  s_cm: number;
  s_max_cm: number;
  Asw_s_req: string;
  Asw_unitaire: string;
  statut: string;
  V_Rds: string;
  erreur: boolean;
}

export interface InfosProjet {
  nom: string;
  reference: string;
  redacteur: string;
  date: string;
  typeCalcul: string;
  auteur: string;
  copyright: string;
}

export interface Resultats {
  hypothese_structurelle: string;
  est_valide: boolean;
  details_charges: {
    G0_surf: string;
    p_elu_lin: string;
    p_els_lin: string;
    g_lin: string;
    q_lin: string;
    G_prime_surf: string;
    Q_surf: string;
    poids_entrevous_surf: string;
  };
  sollicitations: {
    M_ed_travee: string;
    M_ed_appui: string;
    V_ed: string;
    M_els_travee: string;
    M0_elu: string;
    M0_els: string;
  };
  ferraillage: {
    As_travee: number;
    As_travee_min: string;
    As_appui: number;
    choix_travee: ChoixAcier;
    choix_appui: ChoixAcier;
    appui_calcule: boolean;
    etriers: EtriersResult;
    d_eff: string;
    fcd: string;
    fyd: string;
  };
  verifications: {
    ferraillage: {
      ratio: number;
      conforme: boolean;
    };
    flexion: {
      ratio: number;
      conforme: boolean;
    };
    effort_tranchant: {
      ratio: number;
      conforme: boolean;
    };
    cisaillement: {
      V_Rdc: string;
      statut: string;
      besoin_etriers: boolean;
    } | null;
    fleche: {
      L_d_reel: string;
      L_d_limite: string;
      conforme: boolean;
      statut: string;
    } | null;
    els: {
      sigma_c: string;
      sigma_s: string;
      limite_c: string;
      limite_s: string;
      conforme: boolean;
      statut: string;
      M_els: string;
    } | null;
    pourcentage_armature: {
      As_max_cm2: string;
      conforme: boolean;
    };
    espacement_etriers: {
      s_max_cm: number;
      conforme: boolean;
    };
    ancrage: {
      lbd_mm: string;
      conforme_40phi: boolean;
    };
  };
  courbes: {
    M_vals: number[];
    V_vals: number[];
    V_start_val: string;
    V_end_val: string;
  };
}