export const CONSTANTS = {
  b: 1000,
  Es: 200000,
  gammaC: 1.5,
  gammaS: 1.15,
  mu_limit: 0.372
};

// EC2 §5.3.1(5) : au-delà de ce rapport Ly/Lx, une dalle appuyée sur 4 côtés
// est considérée comme portant dans un seul sens.
export const ONE_WAY_RATIO_LIMIT = 2.0;

export const K_DEFLECTION: Record<string, number> = {
  "simplement_appuye": 1.0,
  "continu": 1.3,
  "encastre": 1.5
};

export const EXPLOITATION_CATEGORIES = [
  { label: "A – Logements", qk: 1.5, psi2: 0.3 },
  { label: "B – Bureaux", qk: 2.5, psi2: 0.3 },
  { label: "C1 – Salles réunion", qk: 2.5, psi2: 0.6 },
  { label: "C2 – Tables mobiles", qk: 3.0, psi2: 0.6 },
  { label: "C3 – Zones sans obstacle", qk: 4.0, psi2: 0.6 },
  { label: "C4 – Activités physiques", qk: 5.0, psi2: 0.6 },
  { label: "C5 – Grandes foules", qk: 5.0, psi2: 0.6 },
  { label: "D1 – Commerces", qk: 4.0, psi2: 0.6 },
  { label: "D2 – Grandes surfaces", qk: 5.0, psi2: 0.6 },
  { label: "E – Stockage", qk: 7.5, psi2: 0.6 },
  { label: "F – Parking voitures", qk: 2.5, psi2: 0.6 },
  { label: "G – Parking camions", qk: 5.0, psi2: 0.6 },
  { label: "H – Toitures inaccessibles", qk: 1.0, psi2: 0.0 }
];

export const G1_OPTIONS = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

// EC2 Tableau 4.4N
export const BASE_CMIN_DUR: Record<string, number> = {
  "XC1": 15, "XC2": 25, "XC3": 25, "XC4": 30,
  "XD1": 35, "XD2": 40, "XD3": 45,
  "XS1": 35, "XS2": 40, "XS3": 45,
  "XF1": 25, "XF2": 30, "XF3": 35
};

export const STRUCT_DELTA: Record<string, number> = {
  "S1": -15, "S2": -10, "S3": -5, "S4": 0, "S5": 5, "S6": 10
};

export const FCK_OPTIONS = ["C20/25", "C25/30", "C30/37", "C35/45", "C40/50", "C45/55", "C50/60"];

export const FCK_MAP: Record<string, number> = {
  "C20/25": 20, "C25/30": 25, "C30/37": 30,
  "C35/45": 35, "C40/50": 40, "C45/55": 45, "C50/60": 50
};

export const FYK_OPTIONS = [400, 500, 550];
export const DIAM_OPTIONS = [6, 8, 10, 12, 14, 16, 20, 25, 32];
export const EXPOSURE_OPTIONS = ["XC1", "XC2", "XC3", "XC4", "XD1", "XD2", "XS1", "XF1"];
export const STRUCT_CLASS_OPTIONS = ["S1", "S2", "S3", "S4", "S5", "S6"];
export const DELTA_CDEV_OPTIONS = [5, 10, 15];