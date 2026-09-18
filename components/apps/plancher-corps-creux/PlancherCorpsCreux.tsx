"use client";

import { useMemo, useState } from 'react';
import { Calculator, FileText, Printer, CheckCircle2, AlertCircle, ChevronRight, HelpCircle, AlertTriangle, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Geometrie, Materiaux, Durability, ChargesDetails, ChoixManuel, EtriersParams, AppuiType, Resultats, InfosProjet } from './types';
import { calculerResultats, classeBeton, poidsLineaire, enrobageNominal } from './lib/eurocode2';
import { formatAsCm2, formatRatioPct } from './lib/format';
import { formeTravee, formeChapeau, formeEtrier, longueurEtrier } from './lib/nomenclature';
import { CoupeTransversale } from './components/CoupeTransversale';
import { ManuelModal } from './components/ManuelModal';
import { Cartouche } from './components/Cartouche';
import { CartoucheSettingsModal } from './components/CartoucheSettingsModal';

const CHAMPS_CHARGES: { label: string; key: 'chape' | 'revetement_sol' | 'faux_plafond' | 'cloisons' }[] = [
  { label: 'Chape', key: 'chape' },
  { label: 'Revêtement', key: 'revetement_sol' },
  { label: 'Plafond', key: 'faux_plafond' },
  { label: 'Cloisons', key: 'cloisons' },
];

const ONGLETS: { id: 'resultats' | 'rapport'; icon: typeof Calculator; label: string }[] = [
  { id: 'resultats', icon: Calculator, label: 'Synthèse' },
  { id: 'rapport', icon: FileText, label: 'Note de Calcul' },
];

export default function PlancherCorpsCreux() {
  const [activeTab, setActiveTab] = useState<'resultats' | 'rapport'>('resultats');
  const [geometrie, setGeometrie] = useState<Geometrie>({ type_appui: 'continu', portee: 4.5, entraxe: 0.6, largeur_ame: 12, epaisseur_entrevous: 16, epaisseur_dalle: 4 });
  const [materiaux, setMateriaux] = useState<Materiaux>({ fck: 25, fyk: 500 });
  const [durabilite, setDurabilite] = useState<Durability>({ exposition: 'XC1', classe_structurale: 'S4', dev_ecart: 0, enrobage_manuel: 0 });
  const [chargesDetails, setChargesDetails] = useState<ChargesDetails>({ revetement_sol: 0.5, chape: 1.2, faux_plafond: 0.2, cloisons: 1.0, type_local: 'A', poids_entrevous_manuel: 0 });
  const [choixManuel, setChoixManuel] = useState<ChoixManuel>({ nb_travee: 2, diametre_travee: 10, nb_appui: 1, diametre_appui: 8, nb_branches_etrier: 2, diametre_etrier: 6 });
  const [etriersParams, setEtriersParams] = useState<EtriersParams>({ cot_theta: 2.5 });
  const [infosProjet, setInfosProjet] = useState<InfosProjet>({ nom: 'Plancher Corps Creux', reference: 'BC-2024-001', redacteur: 'J. DOE', date: new Date().toLocaleDateString('fr-FR'), typeCalcul: 'PLANCHER CORPS CREUX', auteur: 'Structural & Engineering Labs', copyright: 'Structural & Engineering Labs © 2026' });
  const [showHelp, setShowHelp] = useState(false);

  const enrobage_nominal = useMemo(() => enrobageNominal(materiaux, durabilite), [materiaux, durabilite]);
  const resultats = useMemo(() => calculerResultats({ geometrie, materiaux, durabilite, chargesDetails, choixManuel, etriersParams }), [geometrie, materiaux, durabilite, chargesDetails, choixManuel, etriersParams]);
  const longueur_barre_travee = useMemo(() => (resultats ? geometrie.portee + 2 * (parseFloat(resultats.verifications.ancrage.lbd_mm) / 1000) : 0), [resultats, geometrie.portee]);
  const nombre_etriers = useMemo(() => { if (!resultats || resultats.ferraillage.etriers.erreur || resultats.ferraillage.etriers.s_cm <= 0) return 0; return Math.floor((geometrie.portee * 100) / resultats.ferraillage.etriers.s_cm) + 1; }, [resultats, geometrie.portee]);
  const longueur_etrier_unitaire = useMemo(() => longueurEtrier(geometrie, enrobage_nominal, choixManuel.diametre_etrier), [geometrie, enrobage_nominal, choixManuel.diametre_etrier]);
  const longueur_chapeau = useMemo(() => { if (!resultats) return 0; if (resultats.ferraillage.appui_calcule) return geometrie.portee * 0.5; const hauteur_m = (geometrie.epaisseur_dalle + geometrie.epaisseur_entrevous) / 100; const c_m = enrobage_nominal / 1000; const retombee_m = Math.max(hauteur_m - c_m - choixManuel.diametre_appui / 1000, 0.1); return geometrie.portee / 5 + retombee_m + 0.1; }, [resultats, geometrie, enrobage_nominal, choixManuel.diametre_appui]);
  const total_acier_kg = useMemo(() => { if (!resultats) return 0; const travee = resultats.ferraillage.choix_travee.nb * longueur_barre_travee * poidsLineaire(resultats.ferraillage.choix_travee.diametre); const appui = resultats.ferraillage.choix_appui.nb * longueur_chapeau * poidsLineaire(resultats.ferraillage.choix_appui.diametre); const etriers = nombre_etriers * longueur_etrier_unitaire * poidsLineaire(choixManuel.diametre_etrier); return travee + appui + etriers; }, [resultats, longueur_barre_travee, longueur_chapeau, nombre_etriers, longueur_etrier_unitaire, choixManuel.diametre_etrier]);
  const courbesM = useMemo(() => { if (!resultats) return ''; const vals = resultats.courbes.M_vals; const maxM = Math.max(...vals.map(Math.abs), 0.1); const scale = 70 / maxM; return vals.map((M, i) => `${40 + (i / (vals.length - 1)) * 320},${90 - M * scale}`).join(' '); }, [resultats]);
  const courbesV = useMemo(() => { if (!resultats) return ''; const vals = resultats.courbes.V_vals; const maxV = Math.max(...vals.map(Math.abs), 0.1); const scale = 70 / maxV; return vals.map((V, i) => `${40 + (i / (vals.length - 1)) * 320},${90 - V * scale}`).join(' '); }, [resultats]);

  return (
    <div className="w-full py-4 px-2 sm:px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">Calculette EC2 Plancher Corps Creux</h1>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest opacity-70">EN 1992-1-1 · v1.0</p>
          </div>
          <button onClick={() => setShowHelp(true)} className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Manuel">
            <HelpCircle size={16} />
          </button>
        </div>

        <div className="p-1 border border-slate-200 bg-white rounded-md flex gap-1">
          {ONGLETS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              <tab.icon size={12} />
              <span className="uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'resultats' && (
          <SyntheseCompacte
            geometrie={geometrie} setGeometrie={setGeometrie}
            materiaux={materiaux} setMateriaux={setMateriaux}
            durabilite={durabilite} setDurabilite={setDurabilite}
            chargesDetails={chargesDetails} setChargesDetails={setChargesDetails}
            choixManuel={choixManuel} setChoixManuel={setChoixManuel}
            etriersParams={etriersParams} setEtriersParams={setEtriersParams}
            enrobage_nominal={enrobage_nominal} resultats={resultats}
            total_acier_kg={total_acier_kg} longueur_barre_travee={longueur_barre_travee}
            longueur_chapeau={longueur_chapeau} nombre_etriers={nombre_etriers}
            longueur_etrier_unitaire={longueur_etrier_unitaire}
            onVoirRapport={() => setActiveTab('rapport')}
          />
        )}

        {activeTab === 'rapport' && (
          <RapportTab
            resultats={resultats} geometrie={geometrie} materiaux={materiaux} durabilite={durabilite}
            chargesDetails={chargesDetails} choixManuel={choixManuel} infosProjet={infosProjet}
            setInfosProjet={setInfosProjet} enrobage_nominal={enrobage_nominal}
            courbesM={courbesM} courbesV={courbesV} total_acier_kg={total_acier_kg}
            longueur_barre_travee={longueur_barre_travee} longueur_chapeau={longueur_chapeau}
            nombre_etriers={nombre_etriers} longueur_etrier_unitaire={longueur_etrier_unitaire}
          />
        )}

        <div className="text-center pt-2">
          <input className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-transparent border-none text-center focus:ring-0 w-full" value={infosProjet.copyright} onChange={(e) => setInfosProjet({ ...infosProjet, copyright: e.target.value })} />
        </div>
      </div>
      <ManuelModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

function LigneChamp({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-[11px] text-slate-500 shrink-0">{label}</span>
      {children}
    </div>
  );
}

const CHAMP_INPUT_STYLE: React.CSSProperties = { width: '78px', height: '26px', padding: '2px 8px', fontSize: '12px' };
const CHAMP_SELECT_STYLE: React.CSSProperties = { width: '96px', height: '26px', padding: '2px 6px', fontSize: '12px' };

function EntreeNombre({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <LigneChamp label={label}>
      <input type="number" step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="win-input text-right" style={CHAMP_INPUT_STYLE} />
    </LigneChamp>
  );
}

function EntreeSelect({ label, value, onChange, options }: { label: string; value: string | number; onChange: (v: string) => void; options: { value: string | number; label: string }[] }) {
  return (
    <LigneChamp label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="win-input" style={CHAMP_SELECT_STYLE}>
        {options.map((o) => (<option key={String(o.value)} value={o.value}>{o.label}</option>))}
      </select>
    </LigneChamp>
  );
}

function GroupeCompact({ titre, children, className = '' }: { titre: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`win-card p-3 ${className}`}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{titre}</div>
      {children}
    </div>
  );
}

function StatutIcone({ conforme }: { conforme: boolean }) {
  return conforme ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <AlertCircle size={14} className="text-red-500 shrink-0" />;
}

function SyntheseCompacte({
  geometrie, setGeometrie, materiaux, setMateriaux, durabilite, setDurabilite,
  chargesDetails, setChargesDetails, choixManuel, setChoixManuel, etriersParams, setEtriersParams,
  enrobage_nominal, resultats, total_acier_kg, longueur_barre_travee, longueur_chapeau,
  nombre_etriers, longueur_etrier_unitaire, onVoirRapport,
}: {
  geometrie: Geometrie; setGeometrie: (g: Geometrie) => void;
  materiaux: Materiaux; setMateriaux: (m: Materiaux) => void;
  durabilite: Durability; setDurabilite: (d: Durability) => void;
  chargesDetails: ChargesDetails; setChargesDetails: (c: ChargesDetails) => void;
  choixManuel: ChoixManuel; setChoixManuel: (c: ChoixManuel) => void;
  etriersParams: EtriersParams; setEtriersParams: (e: EtriersParams) => void;
  enrobage_nominal: number; resultats: Resultats | null;
  total_acier_kg: number; longueur_barre_travee: number; longueur_chapeau: number;
  nombre_etriers: number; longueur_etrier_unitaire: number; onVoirRapport: () => void;
}) {
  const [avanceOuvert, setAvanceOuvert] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GroupeCompact titre="Géométrie">
          <EntreeSelect label="Système" value={geometrie.type_appui} onChange={(v) => setGeometrie({ ...geometrie, type_appui: v as AppuiType })} options={[{ value: 'simple', label: 'Isostatique' }, { value: 'continu', label: 'Continue' }]} />
          <EntreeNombre label="Portée L (m)" value={geometrie.portee} onChange={(v) => setGeometrie({ ...geometrie, portee: v })} step="0.1" />
          <EntreeNombre label="Entraxe b (m)" value={geometrie.entraxe} onChange={(v) => setGeometrie({ ...geometrie, entraxe: v })} step="0.05" />
          <EntreeNombre label="Âme bw (cm)" value={geometrie.largeur_ame} onChange={(v) => setGeometrie({ ...geometrie, largeur_ame: v })} />
          <EntreeNombre label="Corps hw (cm)" value={geometrie.epaisseur_entrevous} onChange={(v) => setGeometrie({ ...geometrie, epaisseur_entrevous: v })} />
          <EntreeNombre label="Dalle hf (cm)" value={geometrie.epaisseur_dalle} onChange={(v) => setGeometrie({ ...geometrie, epaisseur_dalle: v })} />
        </GroupeCompact>

        <GroupeCompact titre="Matériaux & Durabilité">
          <EntreeSelect label="Béton" value={materiaux.fck} onChange={(v) => setMateriaux({ ...materiaux, fck: +v })} options={[20, 25, 30, 35].map((v) => ({ value: v, label: classeBeton(v) }))} />
          <EntreeNombre label="Acier fyk (MPa)" value={materiaux.fyk} onChange={(v) => setMateriaux({ ...materiaux, fyk: v })} />
          <EntreeSelect label="Exposition" value={durabilite.exposition} onChange={(v) => setDurabilite({ ...durabilite, exposition: v as Durability['exposition'] })} options={['XC1', 'XC2', 'XC3', 'XC4', 'XD1', 'XS1'].map((v) => ({ value: v, label: v }))} />
          <EntreeSelect label="Classe struct." value={durabilite.classe_structurale} onChange={(v) => setDurabilite({ ...durabilite, classe_structurale: v as Durability['classe_structurale'] })} options={[{ value: 'S4', label: 'S4 (standard)' }, { value: 'S5', label: 'S5 (+10%)' }, { value: 'S6', label: 'S6 (+20%)' }]} />
          <LigneChamp label="Enrobage cnom"><span className="text-xs font-bold text-[#0078d4]">{enrobage_nominal} mm</span></LigneChamp>
        </GroupeCompact>

        <GroupeCompact titre="Charges">
          <EntreeSelect label="Usage" value={chargesDetails.type_local} onChange={(v) => setChargesDetails({ ...chargesDetails, type_local: v as ChargesDetails['type_local'] })} options={[{ value: 'A', label: 'A · Habitation' }, { value: 'B', label: 'B · Bureaux' }, { value: 'C1', label: 'C1 · Enseign.' }, { value: 'C2', label: 'C2 · Réunions' }, { value: 'C3', label: 'C3 · Dense' }, { value: 'D1', label: 'D1 · Commerces' }]} />
          {CHAMPS_CHARGES.map((f) => (<EntreeNombre key={f.key} label={`${f.label} (kN/m²)`} value={chargesDetails[f.key]} onChange={(v) => setChargesDetails({ ...chargesDetails, [f.key]: v })} step="0.1" />))}
        </GroupeCompact>

        <GroupeCompact titre="Armatures">
          <EntreeNombre label="Nb barres travée" value={choixManuel.nb_travee} onChange={(v) => setChoixManuel({ ...choixManuel, nb_travee: v })} />
          <EntreeSelect label="Ø travée (mm)" value={choixManuel.diametre_travee} onChange={(v) => setChoixManuel({ ...choixManuel, diametre_travee: +v })} options={[8, 10, 12, 14, 16].map((d) => ({ value: d, label: `HA${d}` }))} />
          <EntreeSelect label="Ø étrier (mm)" value={choixManuel.diametre_etrier} onChange={(v) => setChoixManuel({ ...choixManuel, diametre_etrier: +v })} options={[6, 8, 10].map((d) => ({ value: d, label: `HA${d}` }))} />
          <EntreeSelect label="Inclinaison cotθ" value={etriersParams.cot_theta} onChange={(v) => setEtriersParams({ cot_theta: +v })} options={[1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5].map((v) => ({ value: v, label: `${v}` }))} />
        </GroupeCompact>
      </div>

      <div className="win-card p-3">
        <button onClick={() => setAvanceOuvert(!avanceOuvert)} className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          Options avancées
          <ChevronRight size={14} className={`transition-transform ${avanceOuvert ? 'rotate-90' : ''}`} />
        </button>
        {avanceOuvert && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <EntreeNombre label="Forcer enrobage (mm, 0=auto)" value={durabilite.enrobage_manuel} onChange={(v) => setDurabilite({ ...durabilite, enrobage_manuel: v })} />
            <EntreeNombre label="Poids entrevous (kN/m², 0=auto)" value={chargesDetails.poids_entrevous_manuel} onChange={(v) => setChargesDetails({ ...chargesDetails, poids_entrevous_manuel: v })} step="0.05" />
            <EntreeSelect label="Nb barres chapeau" value={choixManuel.nb_appui} onChange={(v) => setChoixManuel({ ...choixManuel, nb_appui: +v })} options={[1, 2, 3].map((n) => ({ value: n, label: `${n}` }))} />
            <EntreeSelect label="Ø chapeau (mm)" value={choixManuel.diametre_appui} onChange={(v) => setChoixManuel({ ...choixManuel, diametre_appui: +v })} options={[8, 10, 12, 14, 16].map((d) => ({ value: d, label: `HA${d}` }))} />
            <EntreeSelect label="Brins étrier" value={choixManuel.nb_branches_etrier} onChange={(v) => setChoixManuel({ ...choixManuel, nb_branches_etrier: +v })} options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n}` }))} />
          </div>
        )}
      </div>

      {!resultats ? (
        <div className="win-card p-8 text-center text-slate-400 text-sm">Renseignez la géométrie pour lancer le calcul.</div>
      ) : (
        <>
          <div className={`rounded-md px-3 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide ${resultats.est_valide ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span className="flex items-center gap-2">
              {resultats.est_valide ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {resultats.est_valide ? 'Structure conforme' : 'Structure non conforme'}
            </span>
          </div>

          {resultats.ferraillage.etriers.erreur && (
            <div className="rounded-md px-3 py-2 bg-red-50 text-red-700 text-[11px] font-semibold flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              {resultats.ferraillage.etriers.statut}
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: 'M travée', value: `${resultats.sollicitations.M_ed_travee}`, unite: 'kN.m' },
              { label: 'V Ed', value: `${resultats.sollicitations.V_ed}`, unite: 'kN' },
              { label: 'Masse', value: total_acier_kg.toFixed(1), unite: 'kg' },
              { label: 'As chapeau', value: formatAsCm2(resultats.ferraillage.As_appui).replace(' cm²', ''), unite: 'cm²' },
              { label: 'Étrier e', value: `${resultats.ferraillage.etriers.s_cm}`, unite: 'cm' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-md p-2 text-center">
                <div className="text-[9px] text-slate-400 uppercase">{s.label}</div>
                <div className="text-sm font-bold text-slate-800">{s.value} <span className="text-[9px] font-normal text-slate-400">{s.unite}</span></div>
              </div>
            ))}
          </div>

          <GroupeCompact titre="Ferraillage retenu">
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 flex-wrap">
              <span className="text-[11px] text-slate-500 w-16 shrink-0">Travée</span>
              <div className="flex items-center gap-1">
                <input type="number" value={choixManuel.nb_travee} onChange={(e) => setChoixManuel({ ...choixManuel, nb_travee: +e.target.value })} className="win-input text-right" style={{ width: '38px', height: '24px', padding: '2px 4px', fontSize: '11px' }} />
                <select value={choixManuel.diametre_travee} onChange={(e) => setChoixManuel({ ...choixManuel, diametre_travee: +e.target.value })} className="win-input" style={{ width: '62px', height: '24px', padding: '2px 4px', fontSize: '11px' }}>
                  {[8, 10, 12, 14, 16].map((d) => (<option key={d} value={d}>HA{d}</option>))}
                </select>
              </div>
              <span className="text-[11px] text-slate-600">{formatAsCm2(resultats.ferraillage.As_travee)} → {resultats.ferraillage.choix_travee.as_fourni.toFixed(2)} cm²</span>
              <StatutIcone conforme={resultats.verifications.ferraillage.conforme} />
            </div>
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 flex-wrap">
              <span className="text-[11px] text-slate-500 w-16 shrink-0">{resultats.ferraillage.appui_calcule ? 'Chapeau' : 'Construction'}</span>
              <div className="flex items-center gap-1">
                <select value={choixManuel.nb_appui} onChange={(e) => setChoixManuel({ ...choixManuel, nb_appui: +e.target.value })} className="win-input text-right" style={{ width: '38px', height: '24px', padding: '2px 4px', fontSize: '11px' }}>
                  {[1, 2, 3].map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
                <select value={choixManuel.diametre_appui} onChange={(e) => setChoixManuel({ ...choixManuel, diametre_appui: +e.target.value })} className="win-input" style={{ width: '62px', height: '24px', padding: '2px 4px', fontSize: '11px' }}>
                  {[8, 10, 12, 14, 16].map((d) => (<option key={d} value={d}>HA{d}</option>))}
                </select>
              </div>
              <span className="text-[11px] text-slate-600">{formatAsCm2(resultats.ferraillage.As_appui)} → {resultats.ferraillage.choix_appui.as_fourni.toFixed(2)} cm²</span>
              <StatutIcone conforme={resultats.ferraillage.choix_appui.as_fourni >= resultats.ferraillage.As_appui} />
            </div>
            <div className="flex items-center justify-between gap-2 py-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 w-16 shrink-0">Étrier</span>
              <div className="flex items-center gap-1">
                <select value={choixManuel.diametre_etrier} onChange={(e) => setChoixManuel({ ...choixManuel, diametre_etrier: +e.target.value })} className="win-input" style={{ width: '62px', height: '24px', padding: '2px 4px', fontSize: '11px' }}>
                  {[6, 8, 10].map((d) => (<option key={d} value={d}>HA{d}</option>))}
                </select>
              </div>
              <span className="text-[11px] text-slate-600">{resultats.ferraillage.etriers.erreur ? resultats.ferraillage.etriers.statut : `espacement s = ${resultats.ferraillage.etriers.s_cm} cm`}</span>
              <StatutIcone conforme={!resultats.ferraillage.etriers.erreur && resultats.verifications.effort_tranchant.conforme} />
            </div>
          </GroupeCompact>

          <GroupeCompact titre="Vérifications EC2 (8)">
            <div className="grid grid-cols-2 gap-x-4">
              {[
                { label: 'Ferraillage', conforme: resultats.verifications.ferraillage.conforme },
                { label: 'Flexion', conforme: resultats.verifications.flexion.conforme },
                { label: 'Cisaillement', conforme: !resultats.ferraillage.etriers.erreur && resultats.verifications.effort_tranchant.conforme },
                { label: 'Flèche', conforme: !!resultats.verifications.fleche?.conforme },
                { label: 'Contraintes ELS', conforme: !!resultats.verifications.els?.conforme },
                { label: 'Pourcentage As max', conforme: resultats.verifications.pourcentage_armature.conforme },
                { label: 'Espacement étrier', conforme: resultats.verifications.espacement_etriers.conforme },
                { label: 'Ancrage', conforme: true },
              ].map((v) => (
                <div key={v.label} className="flex items-center justify-between py-1 text-[11px]">
                  <span className="text-slate-600">{v.label}</span>
                  <StatutIcone conforme={v.conforme} />
                </div>
              ))}
            </div>
          </GroupeCompact>

          <GroupeCompact titre="Nomenclature">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="font-normal pb-1">Désignation</th>
                  <th className="font-normal pb-1">Diam.</th>
                  <th className="font-normal pb-1">Nb</th>
                  <th className="font-normal pb-1 text-right">Poids</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="py-0.5">Travée</td>
                  <td>HA{resultats.ferraillage.choix_travee.diametre}</td>
                  <td>{resultats.ferraillage.choix_travee.nb}</td>
                  <td className="text-right font-semibold">{(resultats.ferraillage.choix_travee.nb * longueur_barre_travee * poidsLineaire(resultats.ferraillage.choix_travee.diametre)).toFixed(2)} kg</td>
                </tr>
                <tr>
                  <td className="py-0.5">{resultats.ferraillage.appui_calcule ? 'Chapeau' : 'Construction'}</td>
                  <td>HA{resultats.ferraillage.choix_appui.diametre}</td>
                  <td>{resultats.ferraillage.choix_appui.nb}</td>
                  <td className="text-right font-semibold">{(resultats.ferraillage.choix_appui.nb * longueur_chapeau * poidsLineaire(resultats.ferraillage.choix_appui.diametre)).toFixed(2)} kg</td>
                </tr>
                <tr>
                  <td className="py-0.5">Étriers</td>
                  <td>HA{choixManuel.diametre_etrier}</td>
                  <td>{nombre_etriers}</td>
                  <td className="text-right font-semibold">{(nombre_etriers * longueur_etrier_unitaire * poidsLineaire(choixManuel.diametre_etrier)).toFixed(2)} kg</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={3} className="pt-1 text-right text-[10px] text-slate-400 uppercase">Total</td>
                  <td className="pt-1 text-right font-bold text-[#107c10]">{total_acier_kg.toFixed(2)} kg</td>
                </tr>
              </tfoot>
            </table>
          </GroupeCompact>

          <p className="text-[9px] text-slate-400 italic px-1">
            Forme travée : {formeTravee(resultats.verifications.ancrage.lbd_mm)}
            {!resultats.verifications.ancrage.conforme_40phi && ' — le forfait usuel "40Ø" était insuffisant ici, lbd calculé utilisé'}. Forme chapeau : {formeChapeau(resultats.ferraillage.appui_calcule)}. Forme étrier : {formeEtrier(geometrie, enrobage_nominal).label}
          </p>
        </>
      )}

      <button onClick={onVoirRapport} className="win-button w-full text-xs py-2 flex items-center justify-center gap-2">
        <FileText size={14} />
        Voir le rapport complet
      </button>
    </motion.div>
  );
}

function RapportTab({
  resultats, geometrie, materiaux, durabilite, chargesDetails, choixManuel, infosProjet, setInfosProjet,
  enrobage_nominal, courbesM, courbesV, total_acier_kg, longueur_barre_travee, longueur_chapeau, nombre_etriers, longueur_etrier_unitaire,
}: {
  resultats: Resultats | null; geometrie: Geometrie; materiaux: Materiaux; durabilite: Durability;
  chargesDetails: ChargesDetails; choixManuel: ChoixManuel; infosProjet: InfosProjet;
  setInfosProjet: (v: InfosProjet) => void; enrobage_nominal: number;
  courbesM: string; courbesV: string; total_acier_kg: number;
  longueur_barre_travee: number; longueur_chapeau: number; nombre_etriers: number; longueur_etrier_unitaire: number;
}) {
  const formeEtrierInfo = formeEtrier(geometrie, enrobage_nominal);
  const [showCartoucheSettings, setShowCartoucheSettings] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {!resultats ? (
        <div className="win-card p-12 text-center opacity-50">
          <FileText size={48} className="mx-auto mb-4" />
          <p className="font-bold uppercase tracking-widest text-[#0078d4]">Génération du rapport...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCartoucheSettings(true)} className="win-button-secondary py-2 px-4 text-xs flex items-center gap-2">
              <Settings2 size={16} />
              Paramétrer le cartouche
            </button>
            <button
              onClick={() => {
                const noteElement = document.querySelector('.note-de-calcul');
                if (!noteElement) { alert('Note de calcul introuvable'); return; }
                const printWindow = window.open('', '_blank', 'width=900,height=1200');
                if (!printWindow) { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); return; }
                const stylesHTML = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((s) => s.outerHTML).join('');
                printWindow.document.write(`
                  <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Note de calcul — ${infosProjet.nom}</title>${stylesHTML}
                  <style>
                    * { box-sizing: border-box; }
                    html, body { background: white; padding: 0; margin: 0; font-family: 'Georgia', 'Times New Roman', Times, serif; font-size: 13px; line-height: 1.45; color: #1e293b; }
                    .note-de-calcul { padding: 15mm 12mm !important; margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; max-width: 100% !important; font-size: 13px !important; }
                    .note-de-calcul h2 { font-size: 16px !important; }
                    .note-de-calcul h3 { font-size: 14px !important; }
                    .note-de-calcul h4 { font-size: 12px !important; }
                    .note-de-calcul table { font-size: 11px !important; }
                    .note-de-calcul th, .note-de-calcul td { padding: 3px 6px !important; }
                    .note-de-calcul .schema-box { padding: 0.5rem !important; margin: 0.5rem 0 !important; }
                    .note-de-calcul h2, .note-de-calcul h3, .note-de-calcul h4 { page-break-after: avoid; break-after: avoid; }
                    .note-de-calcul table, .note-de-calcul tr, .note-de-calcul svg { page-break-inside: avoid; break-inside: avoid; }
                    .cartouche-sel { background: #ffffff !important; color: #000000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .cartouche-sel .cartouche-sel-border { border-color: #000000 !important; }
                    .cartouche-sel .text-\\[\\#6b8aaa\\] { color: #555555 !important; }
                    .cartouche-sel .text-\\[\\#3a9bd5\\] { color: #3a9bd5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    @page { size: A4; margin: 12mm 10mm; }
                  </style></head><body>${noteElement.outerHTML}</body></html>
                `);
                printWindow.document.close();
                setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
              }}
              className="win-button py-2 px-6 text-xs flex items-center gap-2">
              <Printer size={16} />
              EXPORTER EN PDF
            </button>
          </div>
          <CartoucheSettingsModal open={showCartoucheSettings} onClose={() => setShowCartoucheSettings(false)} infosProjet={infosProjet} setInfosProjet={setInfosProjet} />

          <div className="note-de-calcul font-serif">
            <Cartouche infosProjet={infosProjet} estValide={resultats.est_valide} />
            <div className="space-y-12">
              <h2 className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">1</div>
                HYPOTHÈSES DE CALCUL & MATÉRIAUX
              </h2>

              <div className="grid grid-cols-2 gap-x-10">
                <div>
                  <h4>1.1 Données Géométriques</h4>
                  <table className="mt-0"><tbody>
                    <tr><td>Type de structure</td><td>{resultats.hypothese_structurelle}</td></tr>
                    <tr><td>Portée entre nus (L)</td><td>{geometrie.portee.toFixed(2)} m</td></tr>
                    <tr><td>Entraxe transversal (b)</td><td>{geometrie.entraxe.toFixed(2)} m</td></tr>
                    <tr><td>Hauteur totale (h)</td><td>{(geometrie.epaisseur_dalle + geometrie.epaisseur_entrevous).toFixed(1)} cm</td></tr>
                    <tr><td>Épaisseur dalle de compression (hf)</td><td>{geometrie.epaisseur_dalle.toFixed(1)} cm</td></tr>
                    <tr><td>Largeur de l'âme (bw)</td><td>{geometrie.largeur_ame.toFixed(1)} cm</td></tr>
                  </tbody></table>
                  <div className="mt-4 mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                    <p className="text-xs font-black uppercase text-gray-400 mb-2 text-center">Coupe transversale type de la poutrelle</p>
                    <CoupeTransversale geometrie={geometrie} choixManuel={choixManuel} enrobage_nominal={enrobage_nominal} isPrint />
                  </div>
                </div>
                <div>
                  <h4>1.2 Propriétés des Matériaux</h4>
                  <table className="mt-0"><tbody>
                    <tr><td>Classe de résistance béton</td><td>{classeBeton(materiaux.fck)}</td></tr>
                    <tr><td>Résistance de calcul (fcd)</td><td>{resultats.ferraillage.fcd} MPa</td></tr>
                    <tr><td>Limite élastique acier (fyk)</td><td>{materiaux.fyk} MPa</td></tr>
                    <tr><td>Résistance de calcul acier (fyd)</td><td>{resultats.ferraillage.fyd} MPa</td></tr>
                    <tr><td>Module d'élasticité (Es)</td><td>200 000 MPa</td></tr>
                  </tbody></table>
                </div>
              </div>

              <h4>1.3 Durabilité et Enrobage</h4>
              <table className="mt-0 w-full"><tbody>
                <tr>
                  <td>Classe d'exposition : <strong>{durabilite.exposition}</strong></td>
                  <td>Classe structurale : <strong>{durabilite.classe_structurale}</strong></td>
                  <td>Enrobage nominal (cnom) : <strong>{enrobage_nominal} mm</strong></td>
                  <td>Hauteur utile (d) : <strong>{resultats.ferraillage.d_eff} cm</strong></td>
                </tr>
              </tbody></table>

              <h3>2. ACTIONS ET SOLLICITATIONS</h3>
              <div className="space-y-4">
                <h4>2.1 Inventaire des Charges (kN/m²)</h4>
                <table className="mt-0">
                  <thead><tr><th>Désignation</th><th>G (Permanent)</th><th>Q (Variable)</th></tr></thead>
                  <tbody>
                    <tr><td>Poids propre plancher (G0), dont entrevous {resultats.details_charges.poids_entrevous_surf} kN/m²</td><td className="text-center">{resultats.details_charges.G0_surf}</td><td className="text-center">-</td></tr>
                    <tr><td>Charges permanentes additionnelles (G')</td><td className="text-center">{resultats.details_charges.G_prime_surf}</td><td className="text-center">-</td></tr>
                    <tr><td>Charges d'exploitation (Usage {chargesDetails.type_local})</td><td className="text-center">-</td><td className="text-center">{resultats.details_charges.Q_surf}</td></tr>
                    <tr className="bg-gray-100 font-bold"><td>TOTAUX SURFACIQUES</td><td className="text-center">{(+resultats.details_charges.G0_surf + +resultats.details_charges.G_prime_surf).toFixed(2)}</td><td className="text-center">{resultats.details_charges.Q_surf}</td></tr>
                  </tbody>
                </table>
                <h4>2.2 Sollicitations sur Poutrelle (kN/ml)</h4>
                <div className="grid grid-cols-2 gap-x-10">
                  <table className="mt-0"><tbody>
                    <tr><td>Charge permanente (g)</td><td>{resultats.details_charges.g_lin} kN/ml</td></tr>
                    <tr><td>Charge d'exploitation (q)</td><td>{resultats.details_charges.q_lin} kN/ml</td></tr>
                  </tbody></table>
                  <table className="mt-0"><tbody>
                    <tr><td>Combinaison ELU (pEd)</td><td>{resultats.details_charges.p_elu_lin} kN/ml</td></tr>
                    <tr><td>Combinaison ELS (pEls)</td><td>{resultats.details_charges.p_els_lin} kN/ml</td></tr>
                  </tbody></table>
                </div>
                <h4>2.3 Moments et Tranchants de dimensionnement</h4>
                <table className="mt-0">
                  <thead><tr><th>Section</th><th>État</th><th>Moment Max (kN.m)</th><th>Tranchant (kN)</th></tr></thead>
                  <tbody>
                    <tr><td><strong>Milieu de travée</strong></td><td>ELU</td><td className="text-center">{resultats.sollicitations.M_ed_travee}</td><td className="text-center">-</td></tr>
                    <tr><td></td><td>ELS</td><td className="text-center">{resultats.sollicitations.M_els_travee}</td><td className="text-center">-</td></tr>
                    <tr><td><strong>Appuis</strong></td><td>ELU</td><td className="text-center">{resultats.sollicitations.M_ed_appui}</td><td className="text-center">{resultats.sollicitations.V_ed}</td></tr>
                  </tbody>
                </table>
                <div className="grid grid-cols-2 gap-6 mt-6 border-y border-gray-100 py-6">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-400 text-center">Diagramme des moments (kN.m)</p>
                    <svg viewBox="0 0 400 180" width="100%" className="overflow-visible bg-gray-50/30 rounded border border-gray-100">
                      <line x1="40" y1="90" x2="360" y2="90" stroke="#94a3b8" strokeWidth="1" />
                      <polyline points={courbesM} fill="none" stroke="#dc2626" strokeWidth="2" />
                      <text x="200" y="20" textAnchor="middle" fontSize="11" fontWeight="black" fill="#334155">MEd,max = {resultats.sollicitations.M_ed_travee} kN.m</text>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-400 text-center">Diagramme des tranchants (kN)</p>
                    <svg viewBox="0 0 400 180" width="100%" className="overflow-visible bg-gray-50/30 rounded border border-gray-100">
                      <line x1="40" y1="90" x2="360" y2="90" stroke="#94a3b8" strokeWidth="1" />
                      <polyline points={courbesV} fill="none" stroke="#2563eb" strokeWidth="2" />
                      <text x="45" y="25" fontSize="10" fontWeight="black" fill="#334155">{resultats.courbes.V_start_val} kN</text>
                      <text x="355" y="165" textAnchor="end" fontSize="10" fontWeight="black" fill="#334155">{resultats.courbes.V_end_val} kN</text>
                    </svg>
                  </div>
                </div>
              </div>

              <h3>3. ÉTATS LIMITES ULTIMES (ELU)</h3>
              <div className="space-y-4">
                <h4>3.1 Armatures Longitudinales Inférieures (Travée)</h4>
                <p>Le calcul est conduit en section en Té. Moment réduit µ = {((+resultats.sollicitations.M_ed_travee / 1000) / (+resultats.ferraillage.fcd * geometrie.entraxe * Math.pow(+resultats.ferraillage.d_eff / 100, 2))).toFixed(3)}.</p>
                <table className="mt-0"><tbody>
                  <tr><td>Section d'acier théorique (As,th)</td><td><strong>{formatAsCm2(resultats.ferraillage.As_travee)}</strong></td></tr>
                  <tr><td>Section d'acier minimale (As,min)</td><td>{resultats.ferraillage.As_travee_min} cm²</td></tr>
                  <tr><td>Section d'acier adoptée (As,prov)</td><td><strong>{resultats.ferraillage.choix_travee.as_fourni.toFixed(2)} cm²</strong> ({resultats.ferraillage.choix_travee.nom})</td></tr>
                  <tr><td>Taux d'utilisation</td><td>{formatRatioPct(resultats.ferraillage.As_travee / resultats.ferraillage.choix_travee.as_fourni)}</td></tr>
                </tbody></table>
                <h4>3.2 Armatures Transversales (Cisaillement)</h4>
                <p>Effort tranchant maximal VEd = {resultats.sollicitations.V_ed} kN.</p>
                {resultats.ferraillage.etriers.erreur && (<p className="text-red-700 font-bold bg-red-50 border border-red-200 rounded-md p-3">⚠ {resultats.ferraillage.etriers.statut}</p>)}
                <table className="mt-0"><tbody>
                  <tr><td>Capacité béton seul (VRd,c)</td><td>{resultats.verifications.cisaillement?.V_Rdc} kN</td></tr>
                  <tr><td>Capacité des étriers (VRd,s)</td><td className="font-bold text-blue-700">{resultats.ferraillage.etriers.V_Rds} kN</td></tr>
                  <tr><td>Nécessité d'armatures d'effort tranchant</td><td><strong>{resultats.verifications.cisaillement?.besoin_etriers ? 'OUI' : 'NON'}</strong></td></tr>
                  <tr><td>Section répartie requise (Asw/s)</td><td>{resultats.ferraillage.etriers.Asw_s_req} cm²/ml</td></tr>
                  <tr><td>Espacement calculé (s)</td><td><strong>{resultats.ferraillage.etriers.s_cm} cm</strong></td></tr>
                </tbody></table>
              </div>

              <h3>4. ÉTATS LIMITES DE SERVICE (ELS)</h3>
              <div className="space-y-4">
                <h4>4.1 Vérification des Contraintes (Caractéristique)</h4>
                <table className="mt-0">
                  <thead><tr><th>Élément</th><th>Contrainte σ (MPa)</th><th>Limite σlim (MPa)</th><th>Vérification</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>Fibre béton la plus comprimée (σc)</td>
                      <td className="text-center">{resultats.verifications.els?.sigma_c}</td>
                      <td className="text-center">{resultats.verifications.els?.limite_c}</td>
                      <td className={`text-center font-bold ${+(resultats.verifications.els?.sigma_c ?? 0) <= +(resultats.verifications.els?.limite_c ?? 0) ? 'text-emerald-700' : 'text-red-700'}`}>
                        {+(resultats.verifications.els?.sigma_c ?? 0) <= +(resultats.verifications.els?.limite_c ?? 0) ? 'VALIDÉ' : 'HORS LIMITE'}
                      </td>
                    </tr>
                    <tr>
                      <td>Armatures tendues (σs)</td>
                      <td className="text-center">{resultats.verifications.els?.sigma_s}</td>
                      <td className="text-center">{resultats.verifications.els?.limite_s}</td>
                      <td className={`text-center font-bold ${+(resultats.verifications.els?.sigma_s ?? 0) <= +(resultats.verifications.els?.limite_s ?? 0) ? 'text-emerald-700' : 'text-red-700'}`}>
                        {+(resultats.verifications.els?.sigma_s ?? 0) <= +(resultats.verifications.els?.limite_s ?? 0) ? 'VALIDÉ' : 'HORS LIMITE'}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <h4>4.2 Vérification de la Flèche Nuisible</h4>
                <p>La vérification est effectuée par comparaison du ratio d'élancement (L/d).</p>
                <table className="mt-0"><tbody>
                  <tr><td>Ratio élancement réel (L/d)</td><td>{resultats.verifications.fleche?.L_d_reel}</td></tr>
                  <tr><td>Ratio élancement limite (L/d)</td><td>{resultats.verifications.fleche?.L_d_limite}</td></tr>
                  <tr><td>Conclusion réglementaire</td><td><strong>{resultats.verifications.fleche?.conforme ? 'CRITÈRE DE FLÈCHE RESPECTÉ' : 'FLÈCHE EXCESSIVE (Augmenter h ou As)'}</strong></td></tr>
                </tbody></table>
              </div>

              <h3>5. SYNTHÈSE DES VÉRIFICATIONS RÉGLEMENTAIRES (EUROCODE 2)</h3>
              <table className="mt-0">
                <thead><tr><th>Vérification</th><th>Critère</th><th>Taux de travail</th><th>Statut</th></tr></thead>
                <tbody>
                  <tr><td>Ferraillage longitudinal (travée)</td><td>As,prov ≥ As,th</td><td className="text-center">{formatRatioPct(resultats.verifications.ferraillage.ratio)}</td><td className={`text-center font-bold ${resultats.verifications.ferraillage.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.verifications.ferraillage.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Flexion (résistance ultime)</td><td>MEd ≤ MRd</td><td className="text-center">{formatRatioPct(resultats.verifications.flexion.ratio)}</td><td className={`text-center font-bold ${resultats.verifications.flexion.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.verifications.flexion.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Effort tranchant (étriers + bielle)</td><td>VEd ≤ VRd</td><td className="text-center">{formatRatioPct(resultats.verifications.effort_tranchant.ratio)}</td><td className={`text-center font-bold ${!resultats.ferraillage.etriers.erreur && resultats.verifications.effort_tranchant.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.ferraillage.etriers.erreur ? 'ÉCRASEMENT BIELLE' : resultats.verifications.effort_tranchant.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Flèche (élancement L/d)</td><td>L/d ≤ (L/d)lim</td><td className="text-center">{resultats.verifications.fleche?.L_d_reel} / {resultats.verifications.fleche?.L_d_limite}</td><td className={`text-center font-bold ${resultats.verifications.fleche?.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.verifications.fleche?.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Contraintes ELS (béton + acier)</td><td>σc ≤ 0.6·fck ; σs ≤ 0.8·fyk</td><td className="text-center">{resultats.verifications.els?.sigma_c}/{resultats.verifications.els?.limite_c} — {resultats.verifications.els?.sigma_s}/{resultats.verifications.els?.limite_s} MPa</td><td className={`text-center font-bold ${resultats.verifications.els?.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.verifications.els?.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Pourcentage d'armature maximal</td><td>As ≤ As,max = 0.04·Ac (§9.2.1.1(3))</td><td className="text-center">{resultats.ferraillage.choix_travee.as_fourni.toFixed(2)} / {resultats.ferraillage.choix_appui.as_fourni.toFixed(2)} ≤ {resultats.verifications.pourcentage_armature.As_max_cm2} cm²</td><td className={`text-center font-bold ${resultats.verifications.pourcentage_armature.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.verifications.pourcentage_armature.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Espacement maximal des étriers</td><td>s ≤ min(0.75d ; 30 cm) (§9.2.2(6))</td><td className="text-center">{resultats.ferraillage.etriers.s_cm} ≤ {resultats.verifications.espacement_etriers.s_max_cm} cm</td><td className={`text-center font-bold ${resultats.verifications.espacement_etriers.conforme ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.verifications.espacement_etriers.conforme ? 'CONFORME' : 'NON CONFORME'}</td></tr>
                  <tr><td>Longueur d'ancrage (travée)</td><td>lbd calculé (§8.4)</td><td className="text-center">{resultats.verifications.ancrage.lbd_mm} mm</td><td className="text-center font-bold text-emerald-700">APPLIQUÉ</td></tr>
                  <tr className={resultats.est_valide ? 'bg-emerald-50 font-bold' : 'bg-red-50 font-bold'}><td colSpan={3}>CONCLUSION GÉNÉRALE</td><td className={`text-center ${resultats.est_valide ? 'text-emerald-700' : 'text-red-700'}`}>{resultats.est_valide ? 'STRUCTURE CONFORME' : 'STRUCTURE NON CONFORME'}</td></tr>
                </tbody>
              </table>

              <h3>6. NOMENCLATURE ET RÉCAPITULATIF DES ACIERS</h3>
              <table className="mt-0">
                <thead><tr><th>Rep.</th><th>Type / Façonnage</th><th>Forme</th><th>Diam. (mm)</th><th>Nb.</th><th>Long. (m)</th><th>Masse (kg/m)</th><th>Poids Total (kg)</th></tr></thead>
                <tbody>
                  <tr>
                    <td className="text-center font-bold">01</td><td>Aciers de travée</td><td className="text-xs">{formeTravee(resultats.verifications.ancrage.lbd_mm)}</td>
                    <td className="text-center">HA{resultats.ferraillage.choix_travee.diametre}</td><td className="text-center">{resultats.ferraillage.choix_travee.nb}</td>
                    <td className="text-center">{longueur_barre_travee.toFixed(2)}</td><td className="text-center">{poidsLineaire(resultats.ferraillage.choix_travee.diametre).toFixed(3)}</td>
                    <td className="text-center font-bold">{(resultats.ferraillage.choix_travee.nb * longueur_barre_travee * poidsLineaire(resultats.ferraillage.choix_travee.diametre)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-center font-bold">02</td><td>{resultats.ferraillage.appui_calcule ? 'Aciers de chapeaux' : 'Aciers de construction (chapeau)'}</td>
                    <td className="text-xs">{formeChapeau(resultats.ferraillage.appui_calcule)}</td><td className="text-center">HA{resultats.ferraillage.choix_appui.diametre}</td>
                    <td className="text-center">{resultats.ferraillage.choix_appui.nb}</td><td className="text-center">{longueur_chapeau.toFixed(2)}</td>
                    <td className="text-center">{poidsLineaire(resultats.ferraillage.choix_appui.diametre).toFixed(3)}</td>
                    <td className="text-center font-bold">{(resultats.ferraillage.choix_appui.nb * longueur_chapeau * poidsLineaire(resultats.ferraillage.choix_appui.diametre)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="text-center font-bold">03</td><td>Étriers / Cadres ({choixManuel.nb_branches_etrier} brins)</td>
                    <td className="text-xs">{formeEtrierInfo.label} (base={formeEtrierInfo.A_cm.toFixed(1)}cm, hauteur={formeEtrierInfo.B_cm.toFixed(1)}cm)</td>
                    <td className="text-center">HA{choixManuel.diametre_etrier}</td><td className="text-center">{nombre_etriers}</td>
                    <td className="text-center">{longueur_etrier_unitaire.toFixed(2)}</td><td className="text-center">{poidsLineaire(choixManuel.diametre_etrier).toFixed(3)}</td>
                    <td className="text-center font-bold">{(nombre_etriers * longueur_etrier_unitaire * poidsLineaire(choixManuel.diametre_etrier)).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="schema-box p-4">
                  <h4 className="m-0 text-blue-900 border-none">Récapitulatif par Diamètre</h4>
                  <table className="mt-2 text-xs">
                    <thead><tr><th>Diamètre</th><th>Poids Total (kg)</th></tr></thead>
                    <tbody>
                      {Array.from(new Set([resultats.ferraillage.choix_travee.diametre, resultats.ferraillage.choix_appui.diametre, choixManuel.diametre_etrier].filter((v): v is number => Boolean(v)))).map((d) => {
                        const p = (resultats.ferraillage.choix_travee.diametre === d ? resultats.ferraillage.choix_travee.nb * longueur_barre_travee * poidsLineaire(d) : 0) + (resultats.ferraillage.choix_appui.diametre === d ? resultats.ferraillage.choix_appui.nb * longueur_chapeau * poidsLineaire(d) : 0) + (choixManuel.diametre_etrier === d ? nombre_etriers * longueur_etrier_unitaire * poidsLineaire(d) : 0);
                        return (<tr key={d}><td><strong>HA {d}</strong></td><td>{p.toFixed(2)} kg</td></tr>);
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="schema-box p-4 flex flex-col justify-center">
                  <p className="m-0 text-sm">Poids Total par Portée : <strong>{total_acier_kg.toFixed(2)} kg</strong></p>
                  <p className="m-0 text-lg font-black text-blue-900">Ratio : {(total_acier_kg / (geometrie.portee * geometrie.entraxe)).toFixed(2)} kg/m²</p>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-300">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-xs text-gray-500 leading-tight">
                    <p className="font-bold underline mb-0.5">Observation technique :</p>
                    <p>Ce document constitue une aide au calcul. La mise en œuvre doit respecter les plans de pose du fournisseur de poutrelles et les DTU en vigueur.</p>
                  </div>
                  <div className="text-right italic text-xs text-gray-600">
                    Visa de l'Ingénieur Structure<br />{infosProjet.auteur}<br />{infosProjet.date}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}