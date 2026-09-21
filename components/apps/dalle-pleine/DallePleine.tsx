"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Settings, CheckCircle2, AlertCircle, FileText, Layers, Save, Trash2, Printer, Moon, Sun,
  Layout, Maximize2, HelpCircle, Hash, Info, Zap, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  AppuiType, BorderCondition, CalculationState, ColumnPosition, CartoucheSettings, DEFAULT_CARTOUCHE
} from './types';
import { 
  FCK_OPTIONS, FCK_MAP, FYK_OPTIONS, EXPOSURE_OPTIONS, STRUCT_CLASS_OPTIONS, DELTA_CDEV_OPTIONS,
  DIAM_OPTIONS, G1_OPTIONS, EXPLOITATION_CATEGORIES, ONE_WAY_RATIO_LIMIT
} from './constants';
import { computeAll } from './lib/calculations';
import { formatNum, generateNoteDeCalcul, renderGeometryDiagram, renderLoadDiagram, renderPunchingDiagram } from './lib/report';
import { SlabVisualization } from './components/SlabVisualization';
import { SEL_Logo } from './components/Logo';

export default function DallePleine() {
  const [state, setState] = useState<CalculationState>({
    appuiType: AppuiType.FourSides,
    borderCond: BorderCondition.SimplySupported,
    fck: 25,
    fyk: 500,
    exposure: "XC2",
    structClass: "S4",
    deltaCdev: 10,
    h: 200,
    Lx: 5.0,
    Ly: 6.0,
    phi: 12,
    g1: 1.5,
    qkCategoryIndex: 0,
    diam_inf_x: 12,
    diam_inf_y: 10,
    diam_top: 12,
    checkPunching: true,
    columnSize: 300,
    columnPosition: ColumnPosition.Central
  });

  const [activeTab, setActiveTab] = useState('input');
  const TAB_ORDER = [
    { id: 'input', label: 'Données' },
    { id: 'results', label: 'Résultats' },
    { id: 'checks', label: 'Vérifications' },
    { id: 'reinforcement', label: 'Ferraillage' },
    { id: 'report', label: 'Note de Calcul' },
    { id: 'help', label: 'Aide' },
  ];
  const activeTabIndex = TAB_ORDER.findIndex(t => t.id === activeTab);
  const goToPrevTab = () => { if (activeTabIndex > 0) { setActiveTab(TAB_ORDER[activeTabIndex - 1].id); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const goToNextTab = () => { if (activeTabIndex < TAB_ORDER.length - 1) { setActiveTab(TAB_ORDER[activeTabIndex + 1].id); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const [projectName, setProjectName] = useState('Projet Dalle EC2');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [espXDraft, setEspXDraft] = useState<string | null>(null);
  const [espYDraft, setEspYDraft] = useState<string | null>(null);
  const [espTopDraft, setEspTopDraft] = useState<string | null>(null);
  const [cartouche, setCartouche] = useState<CartoucheSettings>(() => {
    try {
      const saved = localStorage.getItem('sel_cartouche_settings');
      return saved ? { ...DEFAULT_CARTOUCHE, ...JSON.parse(saved) } : DEFAULT_CARTOUCHE;
    } catch {
      return DEFAULT_CARTOUCHE;
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [cartoucheDraft, setCartoucheDraft] = useState<CartoucheSettings>(cartouche);

  const saveCartouche = () => {
    setCartouche(cartoucheDraft);
    try { localStorage.setItem('sel_cartouche_settings', JSON.stringify(cartoucheDraft)); } catch {}
    setShowSettings(false);
  };
  const openSettings = () => { setCartoucheDraft(cartouche); setShowSettings(true); };
  const resetCartouche = () => { setCartoucheDraft(DEFAULT_CARTOUCHE); };

  const results = useMemo(() => computeAll(state), [state]);

  const twoWayRatio = state.Ly > 0 ? Math.max(state.Lx, state.Ly) / Math.min(state.Lx, state.Ly) : Infinity;
  const twoWaySavingPossible = state.appuiType === AppuiType.TwoSides && twoWayRatio <= ONE_WAY_RATIO_LIMIT;

  const loadProjects = (): Record<string, CalculationState> => {
    try { return JSON.parse(localStorage.getItem('ec2_projects') || '{}'); } catch { return {}; }
  };
  const saveProjectsToStorage = (projects: Record<string, CalculationState>) => {
    try { localStorage.setItem('ec2_projects', JSON.stringify(projects)); } catch {}
  };

  useEffect(() => {
    setSavedProjects(Object.keys(loadProjects()));
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const updateState = (updates: Partial<CalculationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const projects = loadProjects();
    projects[projectName] = state;
    saveProjectsToStorage(projects);
    setSavedProjects(Object.keys(projects));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLoad = (name: string) => {
    const projects = loadProjects();
    if (projects[name]) { setState(projects[name]); setProjectName(name); }
  };

  const handleDelete = () => {
    const projects = loadProjects();
    delete projects[projectName];
    saveProjectsToStorage(projects);
    setSavedProjects(Object.keys(projects));
    alert(`Projet "${projectName}" supprimé.`);
  };

  const handleExportPDF = () => {
    const content = generateNoteDeCalcul(state, results, projectName, cartouche);
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) { alert('Veuillez autoriser les pop-ups pour exporter en PDF'); return; }
    const stylesHTML = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((s) => s.outerHTML).join('');
    printWindow.document.write(`
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${projectName} — Note de calcul</title>${stylesHTML}
      <style>* { box-sizing: border-box; } html, body { background: white; padding: 0; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; } @page { size: A4; margin: 12mm 10mm; }</style>
      </head><body>${content}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
  };

  const globalOk = results.shearOk && results.deflectionOk && results.steelOk && results.crackOk && (!results.punchActive || results.punchingOk) && results.mu <= 0.372 && results.spacingXOk && results.spacingYOk && results.asMaxOk && results.sectionSufficientX && results.sectionSufficientY && results.sectionSufficientTop && results.spacingTopOk;

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap w-full lg:justify-start justify-center ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : isDarkMode
            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="lg:inline">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-4 md:p-8 font-sans`}>
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <SEL_Logo />
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-slate-600" />}
          </button>
          <button onClick={openSettings} title="Personnaliser le cartouche" className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Settings size={18} /> Paramètres
          </button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm ${saveSuccess ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
            {saveSuccess ? (<><CheckCircle2 size={18} /> Enregistré</>) : (<><Save size={18} /> Sauvegarder</>)}
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Printer size={18} /> Imprimer le Rapport
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-3"><Settings size={22} className="text-blue-500" /> Cartouche de la Note de Calcul</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Personnalisez l'en-tête et le pied de page de la note de calcul exportée en PDF. Ces réglages sont mémorisés sur cet appareil.</p>
            <div className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nom du bureau d'études</label>
                <input type="text" value={cartoucheDraft.companyName} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, companyName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sous-titre / Slogan</label>
                  <input type="text" value={cartoucheDraft.companyTagline} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, companyTagline: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sigle (logo)</label>
                  <input type="text" maxLength={8} value={cartoucheDraft.logoInitials} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, logoInitials: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Titre du document</label>
                <input type="text" value={cartoucheDraft.documentTitle} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, documentTitle: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
              </div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ingénieur / Rédacteur (visa)</label>
                <input type="text" placeholder="Ex. : Jean Dupont, Ingénieur Structure" value={cartoucheDraft.engineerName} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, engineerName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">E-mail de contact</label>
                  <input type="text" value={cartoucheDraft.email} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Téléphone</label>
                  <input type="text" value={cartoucheDraft.phone} onChange={(e) => setCartoucheDraft({ ...cartoucheDraft, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button onClick={resetCartouche} className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:underline">Réinitialiser par défaut</button>
              <div className="flex gap-3">
                <button onClick={() => setShowSettings(false)} className="px-5 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">Annuler</button>
                <button onClick={saveCartouche} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Save size={18} /> Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        <section className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Nom du Projet</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/60 border-none rounded-lg px-4 py-2 font-bold text-lg focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              {savedProjects.length > 0 && (
                <div className="relative group">
                  <select onChange={(e) => handleLoad(e.target.value)} className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none outline-none" value="">
                    <option value="" disabled>📁 Projets ({savedProjects.length})</option>
                    {savedProjects.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
              )}
              <button onClick={handleDelete} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors" title="Supprimer le projet actuel"><Trash2 size={18} /></button>
            </div>
            <div className="w-full md:w-px h-px md:h-10 bg-slate-100 dark:bg-slate-800"></div>
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="flex-1 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Épaisseur h</span>
                <span className="text-xl font-black text-blue-600">{state.h} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">mm</span></span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Charge ELU</span>
                <span className="text-xl font-black text-blue-600">{formatNum(results.pu, 2)} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">kN/m²</span></span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Section Acier</span>
                <span className="text-xl font-black text-blue-600">{formatNum(results.As_req_x/100, 2)} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">cm²/m</span></span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Statut</span>
                <span className={`text-xl font-black ${globalOk ? 'text-emerald-500' : 'text-rose-500'}`}>{globalOk ? 'VALIDE' : 'ÉCHEC'}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8 z-10">
            <nav className={`flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar ${isDarkMode ? 'lg:bg-slate-900 lg:border-slate-800' : 'lg:bg-white lg:border-slate-200'} lg:border lg:rounded-2xl lg:p-3 lg:shadow-sm`}>
              <TabButton id="input" label="Données" icon={Settings} />
              <TabButton id="results" label="Résultats" icon={Layers} />
              <TabButton id="checks" label="Vérifications" icon={CheckCircle2} />
              <TabButton id="reinforcement" label="Ferraillage" icon={Layers} />
              <TabButton id="report" label="Note de Calcul" icon={FileText} />
              <TabButton id="help" label="Aide" icon={HelpCircle} />
            </nav>
          </aside>

          <div className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700">
                    <Layout className="text-blue-500" size={20} />
                    Géométrie & Appuis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type d'appui</label>
                      <select value={state.appuiType} onChange={(e) => updateState({ appuiType: e.target.value as AppuiType })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        <option value={AppuiType.TwoSides}>Sur 2 côtés (Lx)</option>
                        <option value={AppuiType.FourSides}>Sur 4 côtés (Lx × Ly)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bords</label>
                      <select value={state.borderCond} onChange={(e) => updateState({ borderCond: e.target.value as BorderCondition })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        <option value={BorderCondition.SimplySupported}>Simplement appuyé</option>
                        <option value={BorderCondition.Continuous}>Bords continus</option>
                        <option value={BorderCondition.Fixed}>Bords encastrés</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Portée Lx (m)</label>
                      <input type="number" step="0.1" value={state.Lx} onChange={(e) => updateState({ Lx: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {state.appuiType === AppuiType.TwoSides ? 'Longueur du panneau Ly (m)' : 'Portée Ly (m)'}
                      </label>
                      <input type="number" step="0.1" value={state.Ly} onChange={(e) => updateState({ Ly: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Épaisseur h (mm)</label>
                      <input type="number" step="10" value={state.h} onChange={(e) => updateState({ h: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                    </div>
                  </div>
                  {results.effectiveOneWay && (
                    <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 flex items-start gap-3">
                      <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                      <div className="text-sm text-amber-800">
                        <span className="font-bold">Calcul basculé en 1 seul sens (portée Lx).</span>{' '}
                        Ly/Lx = {formatNum(results.ratioLxLy, 2)} &gt; 2 : conformément à l'EC2 §5.3.1(5), cette dalle est calculée comme une dalle-poutre portant uniquement selon Lx, malgré l'appui sur 4 côtés.
                      </div>
                    </div>
                  )}
                  {twoWaySavingPossible && (
                    <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 flex items-start gap-3">
                      <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                      <div className="text-sm text-blue-800">
                        <span className="font-bold">Économie possible en dalle bidirectionnelle.</span>{' '}
                        Ly/Lx = {formatNum(twoWayRatio, 2)} ≤ 2. Si cette dalle repose réellement sur ses 4 côtés, un calcul en "4 côtés" réduirait généralement le ferraillage principal.
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700">
                    <Maximize2 className="text-amber-500" size={20} />
                    Matériaux
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ============================================================
                        CORRECTION : menu Béton (fck) bloqué sur C20/25
                        Avant : value={state.fck} → cherchait une option avec
                        value="25" (nombre) alors que les options ont
                        value="C20/25" (chaîne) → mismatch → bloqué
                        Après : on convertit state.fck (nombre) en son label
                        ("C25/30") via FCK_MAP avant de le passer en value
                    ============================================================ */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Béton (fck)</label>
                      <select 
                        value={Object.entries(FCK_MAP).find(([_, v]) => v === state.fck)?.[0] ?? FCK_OPTIONS[0]}
                        onChange={(e) => updateState({ fck: FCK_MAP[e.target.value] })}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      >
                        {FCK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acier (fyk)</label>
                      <select value={state.fyk} onChange={(e) => updateState({ fyk: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {FYK_OPTIONS.map(o => <option key={o} value={o}>{o} MPa</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diamètre ϕ de calcul (mm)</label>
                      <select value={state.phi} onChange={(e) => updateState({ phi: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {DIAM_OPTIONS.map(d => <option key={d} value={d}>ϕ {d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700">
                    <AlertCircle className="text-teal-500" size={20} />
                    Durabilité & Exposition
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Classe Exposition</label>
                      <select value={state.exposure} onChange={(e) => updateState({ exposure: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {EXPOSURE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">