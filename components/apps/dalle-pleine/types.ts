export enum AppuiType {
  TwoSides = "2cotes",
  FourSides = "4cotes",
}

export enum BorderCondition {
  SimplySupported = "simplement_appuye",
  Continuous = "continu",
  Fixed = "encastre",
}

export enum ColumnPosition {
  Central = "central",
  Edge = "rive",
  Corner = "angle",
}

export interface CalculationState {
  appuiType: AppuiType;
  borderCond: BorderCondition;
  fck: number;
  fyk: number;
  exposure: string;
  structClass: string;
  deltaCdev: number;
  h: number;
  Lx: number;
  Ly: number;
  phi: number;
  g1: number;
  qkCategoryIndex: number;
  diam_inf_x: number;
  diam_inf_y: number;
  diam_top?: number;
  esp_x_manual?: number;
  esp_y_manual?: number;
  esp_top_manual?: number;
  checkPunching: boolean;
  columnSize: number;
  columnPosition: ColumnPosition;
}

export interface CalculationResults {
  fck: number;
  fcd: number;
  fctm: number;
  fyk: number;
  fyd: number;
  cmin_dur: number;
  cmin: number;
  cnom: number;
  d: number;
  g0: number;
  g_total: number;
  qk: number;
  pu: number;
  pser_qp: number;
  ratioLxLy: number;
  effectiveOneWay: boolean;
  MEd_x: number;
  MEd_y: number;
  MEd_app_x: number;
  VEd: number;
  MEd_max: number;
  mu: number;
  muSafe: number;
  z: number;
  As_th_mm2: number;
  rhoMin: number;
  As_min_mm2: number;
  As_used_mm2: number;
  As_req_x: number;
  As_req_y: number;
  As_max_mm2: number;
  asMaxOk: boolean;
  rho_l: number;
  VRd_c: number;
  shearOk: boolean;
  Ld_real: number;
  limitLd: number;
  deflectionOk: boolean;
  Ecm: number;
  alpha_e: number;
  x: number;
  Icr: number;
  sigma_s: number;
  steelOk: boolean;
  w_max: number;
  wk: number;
  crackOk: boolean;
  punchingOk: boolean;
  VRd_c_punch: number;
  VEd_punch: number;
  punchActive: boolean;
  lb_rqd: number;
  l0: number;
  lbd: number;
  lbd_x: number;
  lbd_y: number;
  length_x: number;
  length_y: number;
  maxSpacing_x: number;
  maxSpacing_y: number;
  spacingXOk: boolean;
  spacingYOk: boolean;
  esp_x_final: number;
  esp_x_auto: number;
  As_reel_x: number;
  esp_y_final: number;
  esp_y_auto: number;
  As_reel_y: number;
  sectionSufficientX: boolean;
  sectionSufficientY: boolean;
  As_req_top: number;
  esp_top_auto: number;
  esp_top_final: number;
  As_reel_top: number;
  sectionSufficientTop: boolean;
  maxSpacing_top: number;
  spacingTopOk: boolean;
  linear_weight_top: number;
  lbd_top: number;
  coeffs: any;
  rho_l_punch: number;
  linear_weight_x: number;
  linear_weight_y: number;
  weight_total: number;
  weight_x: number;
  weight_y: number;
  qty_x: number;
  qty_y: number;
  weight_top: number;
  len_top: number;
  qty_top: number;
}

export interface CartoucheSettings {
  companyName: string;
  companyTagline: string;
  logoInitials: string;
  documentTitle: string;
  engineerName: string;
  email: string;
  phone: string;
}

export const DEFAULT_CARTOUCHE: CartoucheSettings = {
  companyName: "Structural & Engineering Labs",
  companyTagline: "Ingénierie du Béton Armé",
  logoInitials: "S.E.L.",
  documentTitle: "Note de Calcul Pro",
  engineerName: "",
  email: "structuralengineeringlabs@gmail.com",
  phone: "+237 6 51 13 56 05",
};