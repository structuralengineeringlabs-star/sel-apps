import { 
  CalculationState, 
  CalculationResults, 
  AppuiType, 
  BorderCondition, 
  ColumnPosition 
} from "../types";
import { 
  CONSTANTS, 
  BASE_CMIN_DUR, 
  STRUCT_DELTA, 
  EXPLOITATION_CATEGORIES,
  K_DEFLECTION,
  ONE_WAY_RATIO_LIMIT
} from "../constants";

export function getMomentsCoeff(ratio: number, borderCond: BorderCondition) {
  const table = [
    [1.0, 0.047, 0.047],
    [1.1, 0.054, 0.045],
    [1.2, 0.062, 0.043],
    [1.3, 0.069, 0.040],
    [1.4, 0.075, 0.037],
    [1.5, 0.081, 0.034],
    [1.6, 0.086, 0.031],
    [1.7, 0.090, 0.029],
    [1.8, 0.094, 0.027],
    [1.9, 0.097, 0.025],
    [2.0, 0.100, 0.023]
  ];
  const r = Math.min(ratio, 2.0);
  let alphaX = 0.047, alphaY = 0.047;
  
  for (let i = 0; i < table.length - 1; i++) {
    if (r >= table[i][0] && r <= table[i+1][0]) {
      const t = (r - table[i][0]) / (table[i+1][0] - table[i][0]);
      alphaX = table[i][1] + t * (table[i+1][1] - table[i][1]);
      alphaY = table[i][2] + t * (table[i+1][2] - table[i][2]);
      break;
    }
  }

  if (borderCond === BorderCondition.Continuous) {
    return { alphaX_trav: alphaX * 0.6, alphaY_trav: alphaY * 0.6, alphaX_app: -alphaX * 0.4, alphaY_app: -alphaY * 0.4 };
  } else if (borderCond === BorderCondition.Fixed) {
    return { alphaX_trav: alphaX * 0.5, alphaY_trav: alphaY * 0.5, alphaX_app: -alphaX * 0.5, alphaY_app: -alphaY * 0.5 };
  }
  return { alphaX_trav: alphaX, alphaY_trav: alphaY, alphaX_app: 0, alphaY_app: 0 };
}

export function computeLimitLd(rhoL: number, fck: number, K: number) {
  const rho0 = 0.001 * Math.sqrt(fck);
  if (rhoL <= rho0 && rhoL > 0) {
    return K * (11 + 1.5 * Math.sqrt(fck) * (rho0 / rhoL) + 3.2 * Math.sqrt(fck) * Math.pow(rho0 / rhoL - 1, 1.5));
  } else if (rhoL > rho0) {
    return K * (11 + 1.5 * Math.sqrt(fck) * (rho0 / rhoL) + (1 / 12) * Math.sqrt(fck) * Math.sqrt(rho0 / rhoL));
  }
  return 20;
}

export function computeAll(rawState: CalculationState): CalculationResults {
  const state: CalculationState = {
    ...rawState,
    Lx: Math.max(rawState.Lx || 0, 0.1),
    Ly: Math.max(rawState.Ly || 0, 0.1),
    h: Math.max(rawState.h || 0, 50),
  };
  let { Lx, Ly } = state;
  if (state.appuiType === AppuiType.FourSides && Ly < Lx) {
    [Lx, Ly] = [Ly, Lx];
  }

  const fck = state.fck;
  const fcd = fck / CONSTANTS.gammaC;
  const fctm = 0.30 * Math.pow(fck, 2 / 3);
  const fyk = state.fyk;
  const fyd = fyk / CONSTANTS.gammaS;

  const cmin_dur = Math.max(BASE_CMIN_DUR[state.exposure] + STRUCT_DELTA[state.structClass], 10);
  const cmin = Math.max(cmin_dur, state.phi, 10);
  const cnom = cmin + state.deltaCdev;
  const d = Math.max(state.h - cnom - state.phi / 2, 20);

  const g0 = 25 * (state.h / 1000);
  const g_total = g0 + state.g1;
  const qk = EXPLOITATION_CATEGORIES[state.qkCategoryIndex].qk;
  const pu = 1.35 * g_total + 1.5 * qk;
  const pser_qp = g_total + EXPLOITATION_CATEGORIES[state.qkCategoryIndex].psi2 * qk;

  const ratioLxLy = state.appuiType === AppuiType.FourSides ? Math.max(Ly / Lx, 1.0) : 1.0;
  const effectiveOneWay = state.appuiType === AppuiType.FourSides && ratioLxLy > ONE_WAY_RATIO_LIMIT;

  let MEd_x = 0, MEd_y = 0, MEd_app_x = 0, VEd = 0;
  let coeffs = null;

  if (state.appuiType === AppuiType.TwoSides || effectiveOneWay) {
    const M0 = pu * Lx * Lx / 8;
    if (state.borderCond === BorderCondition.Continuous) {
      MEd_x = 0.6 * M0;
      MEd_app_x = -0.4 * M0;
    } else if (state.borderCond === BorderCondition.Fixed) {
      MEd_x = 0.5 * M0;
      MEd_app_x = -0.5 * M0;
    } else {
      MEd_x = M0;
    }
    VEd = pu * Lx / 2;
  } else {
    coeffs = getMomentsCoeff(ratioLxLy, state.borderCond);
    MEd_x = coeffs.alphaX_trav * pu * Lx * Lx;
    MEd_y = coeffs.alphaY_trav * pu * Lx * Lx;
    MEd_app_x = coeffs.alphaX_app * pu * Lx * Lx;
    VEd = pu * Lx / 2;
  }

  const MEd_max = Math.max(Math.abs(MEd_x), Math.abs(MEd_y), Math.abs(MEd_app_x));
  const mu = MEd_max * 1e6 / (CONSTANTS.b * d * d * fcd);
  const muSafe = Math.min(mu, 0.5);
  let alpha = 0;
  let z = d;
  if (muSafe > 0) {
    alpha = 1 - Math.sqrt(1 - 2 * muSafe);
    z = d * (1 - 0.5 * alpha);
  }

  const As_th_mm2 = MEd_max * 1e6 / (z * fyd);
  const rhoMin = Math.max(0.26 * (fctm / fyk), 0.0013);
  const As_min_mm2 = rhoMin * CONSTANTS.b * d;
  const As_used_mm2 = Math.max(As_th_mm2, As_min_mm2);

  let As_req_x = As_used_mm2;
  if (state.appuiType === AppuiType.FourSides && !effectiveOneWay) {
    As_req_x = Math.max(Math.abs(MEd_x) * 1e6 / (0.9 * d * fyd), As_min_mm2);
  }
  const As_req_y = (state.appuiType === AppuiType.FourSides && !effectiveOneWay)
    ? Math.max(Math.abs(MEd_y) * 1e6 / (0.9 * d * fyd), As_min_mm2)
    : Math.max(As_req_x * 0.2, As_min_mm2 * 0.25);

  const rho_l = Math.min(As_used_mm2 / (CONSTANTS.b * d), 0.02);
  const As_max_mm2 = 0.04 * CONSTANTS.b * state.h;
  const asMaxOk = As_used_mm2 <= As_max_mm2 && As_req_y <= As_max_mm2;

  const k_v = Math.min(1 + Math.sqrt(200 / d), 2.0);
  const CRd_c = 0.18 / CONSTANTS.gammaC;
  const vmin = 0.035 * Math.pow(k_v, 1.5) * Math.sqrt(fck);
  const VRd_c = Math.max(CRd_c * k_v * Math.pow(100 * rho_l * fck, 1/3) * CONSTANTS.b * d, vmin * CONSTANTS.b * d) / 1000;
  const shearOk = VEd <= VRd_c;

  const Ld_real = (Lx * 1000) / d;
  const K_defl = K_DEFLECTION[state.borderCond] ?? 1.0;
  let limitLd = computeLimitLd(rho_l, fck, K_defl);
  limitLd = Math.min(limitLd, 45);
  const deflectionOk = Ld_real <= limitLd;

  const Ecm = 22000 * Math.pow(fck / 10, 0.3);
  const alpha_e = CONSTANTS.Es / Ecm;
  
  let x = 0;
  if (As_used_mm2 > 0) {
    const a = CONSTANTS.b / 2;
    const bcoef = alpha_e * As_used_mm2;
    const ccoef = -alpha_e * As_used_mm2 * d;
    const delta = bcoef * bcoef - 4 * a * ccoef;
    if (delta >= 0) {
      x = (-bcoef + Math.sqrt(delta)) / (2 * a);
    }
  }
  if (x <= 0) x = 0.2 * d;

  const Icr = (CONSTANTS.b * x * x * x / 3) + alpha_e * As_used_mm2 * Math.pow(d - x, 2);
  const M_ser_Nmm = (pser_qp * Lx * Lx / 8) * 1e6;
  let sigma_s = 0;
  if (Icr > 0) {
    sigma_s = alpha_e * M_ser_Nmm * (d - x) / Icr;
  }
  const steelOk = sigma_s <= 0.8 * fyk;

  const getWmax = (exposure: string) => (exposure === "XC1" || exposure === "X0") ? 0.4 : 0.3;
  const w_max = getWmax(state.exposure);
  const kt = 0.4;
  const h_eff = Math.min(2.5 * (state.h - d), (state.h - x) / 3, state.h / 2);
  const Ac_eff = CONSTANTS.b * Math.max(h_eff, cnom);
  const rho_p_eff = As_used_mm2 / Ac_eff;
  
  let eps_sm_eps_cm = 0;
  if (rho_p_eff > 0) {
    eps_sm_eps_cm = Math.max((sigma_s - kt * (fctm / rho_p_eff) * (1 + alpha_e * rho_p_eff)) / CONSTANTS.Es, 0.6 * sigma_s / CONSTANTS.Es);
  }
  const sr_max = Math.min(3.4 * cnom + 0.8 * 0.5 * 0.425 * state.phi / rho_p_eff, 1.3 * (state.h - x));
  let wk = sr_max * eps_sm_eps_cm;
  const crackOk = wk <= w_max;

  let punchingOk = true;
  let VRd_c_punch = 0;
  let VEd_punch = 0;
  let rho_l_punch = 0;
  const punchActive = state.checkPunching && state.appuiType === AppuiType.FourSides;
  
  if (punchActive) {
    const colSize = state.columnSize;
    const d_avg = d;
    let beta = 1.15;
    let u1 = 0;

    if (state.columnPosition === ColumnPosition.Central) {
      beta = 1.15;
      u1 = (4 * colSize) + (2 * Math.PI * 2 * d_avg);
    } else if (state.columnPosition === ColumnPosition.Edge) {
      beta = 1.40;
      u1 = (3 * colSize) + (Math.PI * 2 * d_avg); 
    } else if (state.columnPosition === ColumnPosition.Corner) {
      beta = 1.50;
      u1 = (2 * colSize) + (0.5 * Math.PI * 2 * d_avg);
    }

    const aire_x = Math.PI * Math.pow(state.diam_inf_x, 2) / 4;
    const aire_y = Math.PI * Math.pow(state.diam_inf_y, 2) / 4;
    
    const ep_x = Math.min(Math.max((aire_x * 1000) / As_req_x, 50), 250);
    const ep_y = Math.min(Math.max((aire_y * 1000) / As_req_y, 50), 250);
    
    const As_rl_x = (aire_x * 1000) / ep_x;
    const As_rl_y = (aire_y * 1000) / ep_y;
    
    rho_l_punch = Math.min(Math.sqrt((As_rl_x / (CONSTANTS.b * d_avg)) * (As_rl_y / (CONSTANTS.b * d_avg))), 0.02);
    
    const k_p = Math.min(1 + Math.sqrt(200 / d_avg), 2.0);
    const vmin_p = 0.035 * Math.pow(k_p, 1.5) * Math.sqrt(fck);
    const vRd_c_p = Math.max((0.18 / CONSTANTS.gammaC) * k_p * Math.pow(100 * rho_l_punch * fck, 1/3), vmin_p);
    
    let area_inside = 0;
    if (state.columnPosition === ColumnPosition.Central) {
      area_inside = (Math.pow(colSize, 2) + 4 * colSize * 2 * d_avg + Math.PI * Math.pow(2 * d_avg, 2)) / 1e6;
    } else {
      area_inside = Math.pow(colSize, 2) / 1e6;
    }
    
    VEd_punch = beta * pu * (Lx * Ly - area_inside);
    const vEd_p = VEd_punch * 1000 / (u1 * d_avg);
    
    VRd_c_punch = vRd_c_p * u1 * d_avg / 1000;
    punchingOk = vEd_p <= vRd_c_p;
  }

  const fctd = 0.7 * fctm / CONSTANTS.gammaC;
  const fbd = 2.25 * fctd;
  const lb_rqd = (state.phi / 4) * (fyd / fbd);
  const l0 = 1.2 * lb_rqd;
  const lbd = Math.max(lb_rqd, 0.3 * lb_rqd, 10 * state.phi, 100);

  const computeLbd = (phi: number) => {
    const lbrqd = (phi / 4) * (fyd / fbd);
    return Math.max(lbrqd, 0.3 * lbrqd, 10 * phi, 100);
  };
  const isSecondaryY = state.appuiType !== AppuiType.FourSides || effectiveOneWay;
  const diam_y_used = isSecondaryY ? 8 : state.diam_inf_y;
  const lbd_x = computeLbd(state.diam_inf_x);
  const lbd_y = computeLbd(diam_y_used);

  const aire_x = Math.PI * state.diam_inf_x ** 2 / 4;
  const esp_x_auto = Math.min(Math.max((aire_x * 1000) / As_req_x, 50), 250);
  const esp_x_final = (state.esp_x_manual && state.esp_x_manual > 0) ? state.esp_x_manual : esp_x_auto;
  const As_reel_x = (aire_x * 1000) / esp_x_final;

  const isMainY = state.appuiType === AppuiType.FourSides && !effectiveOneWay;
  const aire_y = isMainY ? Math.PI * state.diam_inf_y ** 2 / 4 : Math.PI * 8 ** 2 / 4;
  const esp_y_auto = Math.min(Math.max((aire_y * 1000) / As_req_y, 50), isMainY ? 250 : 300);
  const esp_y_final = (state.esp_y_manual && state.esp_y_manual > 0) ? state.esp_y_manual : esp_y_auto;
  const As_reel_y = (aire_y * 1000) / esp_y_final;

  const maxSpacing_x = Math.min(3 * state.h, 400);
  const maxSpacing_y = isSecondaryY ? Math.min(3.5 * state.h, 450) : Math.min(3 * state.h, 400);
  const spacingXOk = esp_x_final <= maxSpacing_x;
  const spacingYOk = esp_y_final <= maxSpacing_y;

  const sectionSufficientX = As_reel_x >= As_req_x - 1e-6;
  const sectionSufficientY = As_reel_y >= As_req_y - 1e-6;

  const qty_x = Math.ceil((Ly * 1000) / esp_x_final) + 1;
  const qty_y = Math.ceil((Lx * 1000) / esp_y_final) + 1;

  const length_x = Lx + 2 * (lbd_x / 1000);
  const length_y = Ly + 2 * (lbd_y / 1000);

  const linear_weight_x = (state.diam_inf_x ** 2) / 162;
  const linear_weight_y = (diam_y_used ** 2) / 162;
  const weight_x = qty_x * length_x * linear_weight_x;
  const weight_y = qty_y * length_y * linear_weight_y;

  const As_req_top = Math.abs(MEd_app_x) > 1e-9
    ? Math.max(Math.abs(MEd_app_x) * 1e6 / (0.9 * d * fyd), As_min_mm2)
    : 0;
  const diam_top = state.diam_top || state.diam_inf_x;
  const aire_top = Math.PI * diam_top ** 2 / 4;
  const esp_top_auto = As_req_top > 0 ? Math.min(Math.max((aire_top * 1000) / As_req_top, 50), 250) : 250;
  const esp_top_final = (state.esp_top_manual && state.esp_top_manual > 0) ? state.esp_top_manual : esp_top_auto;
  const As_reel_top = As_req_top > 0 ? (aire_top * 1000) / esp_top_final : 0;
  const sectionSufficientTop = As_req_top === 0 || As_reel_top >= As_req_top - 1e-6;
  const maxSpacing_top = Math.min(3 * state.h, 400);
  const spacingTopOk = As_req_top === 0 || esp_top_final <= maxSpacing_top;
  const lbd_top = computeLbd(diam_top);

  let len_top = 0;
  let qty_top = 0;
  let weight_top = 0;
  const linear_weight_top = (diam_top ** 2) / 162;

  if (As_req_top > 0) {
    len_top = Math.round((Lx * 0.25 + lbd_top / 1000) * 100) / 100;
    qty_top = Math.ceil((Ly * 1000) / esp_top_final) + 1;
    weight_top = qty_top * len_top * linear_weight_top;
  }

  const weight_total = weight_x + weight_y + weight_top;

  return {
    fck, fcd, fctm, fyk, fyd, cmin_dur, cmin, cnom, d, g0, g_total, qk, pu, pser_qp,
    ratioLxLy, effectiveOneWay,
    MEd_x, MEd_y, MEd_app_x, VEd, MEd_max, mu, muSafe, z, As_th_mm2, rhoMin, As_min_mm2,
    As_used_mm2, As_req_x, As_req_y, As_max_mm2, asMaxOk, rho_l, VRd_c, shearOk, Ld_real, limitLd, deflectionOk,
    Ecm, alpha_e, x, Icr, sigma_s, steelOk, w_max, wk, crackOk, punchingOk, VRd_c_punch, VEd_punch,
    punchActive, lb_rqd, l0, lbd, lbd_x, lbd_y, length_x, length_y,
    maxSpacing_x, maxSpacing_y, spacingXOk, spacingYOk,
    esp_x_auto, esp_y_auto, sectionSufficientX, sectionSufficientY,
    As_req_top, esp_top_auto, esp_top_final, As_reel_top, sectionSufficientTop,
    maxSpacing_top, spacingTopOk, linear_weight_top, lbd_top,
    esp_x_final, As_reel_x, esp_y_final, As_reel_y, coeffs, rho_l_punch,
    linear_weight_x, linear_weight_y,
    weight_total, weight_x, weight_y, qty_x, qty_y,
    weight_top, len_top, qty_top 
  };
}