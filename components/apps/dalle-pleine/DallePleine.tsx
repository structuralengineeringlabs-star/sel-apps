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
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Structurelle</label>
                      <select value={state.structClass} onChange={(e) => updateState({ structClass: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {STRUCT_CLASS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Δcdev (mm)</label>
                      <select value={state.deltaCdev} onChange={(e) => updateState({ deltaCdev: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {DELTA_CDEV_OPTIONS.map(o => <option key={o} value={o}>{o} mm</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrobage nominal (cnom)</label>
                      <div className="w-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3 font-black text-amber-700 dark:text-amber-400">
                        {results.cnom} mm
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    Visualisation
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Aperçu interactif</span>
                  </h3>
                  <div><SlabVisualization state={state} results={results} /></div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Charges appliquées</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Permanente (G)</span>
                          <span className="font-bold text-slate-900 dark:text-slate-50">{formatNum(results.g_total, 2)} <span className="text-[10px] text-slate-400 dark:text-slate-500">kN/m²</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Exploitation (Q)</span>
                          <span className="font-bold text-slate-900 dark:text-slate-50">{formatNum(results.qk, 2)} <span className="text-[10px] text-slate-400 dark:text-slate-500">kN/m²</span></span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-sm font-bold text-blue-600 uppercase">Ultime (pu)</span>
                          <span className="font-black text-blue-600 text-lg">{formatNum(results.pu, 2)} <span className="text-[10px]">kN/m²</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Durabilité</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">cnom</span>
                          <span className="font-bold text-amber-600">{results.cnom} <span className="text-[10px]">mm</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Hauteur utile (d)</span>
                          <span className="font-bold text-slate-900 dark:text-slate-50">{formatNum(results.d, 1)} <span className="text-[10px]">mm</span></span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Ratio L/d</span>
                          <span className={`font-bold ${results.deflectionOk ? 'text-emerald-500' : 'text-rose-500'}`}>{formatNum(results.Ld_real, 1)} <span className="text-[10px] text-slate-400 dark:text-slate-500">/ {formatNum(results.limitLd, 1)}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700">
                    <Layers className="text-emerald-500" size={20} />
                    Charges & Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catégorie d'exploitation</label>
                      <select value={state.qkCategoryIndex} onChange={(e) => updateState({ qkCategoryIndex: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {EXPLOITATION_CATEGORIES.map((c, i) => <option key={i} value={i}>{c.label} (Qk={c.qk} kN/m²)</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Charge Permanente Additionnelle G1 (kN/m²)</label>
                      <select value={state.g1} onChange={(e) => updateState({ g1: parseFloat(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {G1_OPTIONS.map(o => <option key={o} value={o}>{o} kN/m²</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {state.appuiType === AppuiType.FourSides && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700">
                      <AlertCircle className="text-rose-500" size={20} />
                      Vérification au Poinçonnement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Activer le calcul</label>
                        <select value={state.checkPunching ? "true" : "false"} onChange={(e) => updateState({ checkPunching: e.target.value === "true" })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                          <option value="true">Oui</option>
                          <option value="false">Non</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Position Poteau</label>
                        <select value={state.columnPosition} onChange={(e) => updateState({ columnPosition: e.target.value as ColumnPosition })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                          <option value={ColumnPosition.Central}>Central (β = 1.15)</option>
                          <option value={ColumnPosition.Edge}>Rive (β = 1.40)</option>
                          <option value={ColumnPosition.Corner}>Angle (β = 1.50)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Taille Poteau (mm)</label>
                        <input type="number" step="50" value={state.columnSize} onChange={(e) => updateState({ columnSize: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center"><Layers size={18}/></div>
                  Paramètres Calculés
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'fcd (MPa)', val: results.fcd, formula: 'fck / γc' },
                    { label: 'fctm (MPa)', val: results.fctm, formula: '0.3·fck^(2/3)' },
                    { label: 'cnom (mm)', val: results.cnom, formula: 'cmin + Δcdev' },
                    { label: 'd (mm)', val: results.d, formula: 'h - cnom - ϕ/2' },
                    { label: 'Ecm (MPa)', val: results.Ecm, formula: '22000·(fck/10)^0.3' },
                  ].map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block">{it.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">{it.formula}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50">{formatNum(it.val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center"><Layout size={18}/></div>
                  Sollicitations ELU
                </h3>
                <div className="space-y-4">
                   {[
                    { label: 'Mom. Tr. X (kNm)', val: results.MEd_x, formula: state.appuiType === AppuiType.FourSides ? 'αx·pu·Lx²' : 'pu·Lx²/8' },
                    { label: 'Mom. Tr. Y (kNm)', val: (state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? results.MEd_y : 'n/a (1 sens)', formula: (state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? 'αy·pu·Lx²' : 'Non porteur' },
                    { label: 'Mom. Appui (kNm)', val: results.MEd_app_x, formula: 'Encastrement' },
                    { label: 'Eff. Tranchant (kN)', val: results.VEd, formula: 'pu·Lx/2' },
                  ].map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block">{it.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">{it.formula}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50">{typeof it.val === 'number' ? formatNum(it.val) : it.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center"><Calculator size={18}/></div>
                  Section d'Acier
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Moment réduit μ', val: results.mu, formula: 'MEd / (b·d²·fcd)' },
                    { label: 'Bras de levier z', val: results.z, formula: 'd(1-0.5α)' },
                    { label: 'As min (cm²/m)', val: results.As_min_mm2/100, formula: 'max(ρmin·bd; 0.0013bd)' },
                    { label: 'As req (cm²/m)', val: results.As_req_x/100, formula: 'max(As,th; As,min)' },
                  ].map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block">{it.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">{it.formula}</span>
                      </div>
                      <span className={`font-bold ${it.label === 'Moment réduit μ' && it.val > 0.372 ? 'text-rose-500' : 'text-slate-900 dark:text-slate-50'}`}>{formatNum(it.val, it.label.includes('μ') ? 4 : 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'checks' && (
            <motion.div key="checks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              {[
                {
                  label: 'États Limites Ultimes (ELU)', icon: Zap,
                  items: [
                    { title: 'Moment réduit μ', val: `${formatNum(results.mu, 4)} / 0,372`, desc: 'EC2 §3.1.7', ok: results.mu <= 0.372 },
                    { title: 'Effort Tranchant', val: `${formatNum(results.VEd, 1)} / ${formatNum(results.VRd_c, 1)} kN`, desc: 'EC2 §6.2.2, sans étriers', ok: results.shearOk },
                  ]
                },
                {
                  label: 'Poinçonnement (EC2 §6.4)', icon: Maximize2,
                  items: results.punchActive ? [
                    { title: 'Poinçonnement', val: `${formatNum(results.VEd_punch, 1)} / ${formatNum(results.VRd_c_punch, 1)} kN`, desc: 'Périmètre critique u1 (2d)', ok: results.punchingOk },
                  ] : []
                },
                {
                  label: 'États Limites de Service (ELS)', icon: Activity,
                  items: [
                    { title: 'Flèche (L/d)', val: `${formatNum(results.Ld_real, 1)} / ${formatNum(results.limitLd, 1)}`, desc: 'EC2 §7.4.2', ok: results.deflectionOk },
                    { title: 'Contrainte Acier', val: `${formatNum(results.sigma_s, 0)} / ${formatNum(0.8*state.fyk, 0)} MPa`, desc: 'EC2 §7.2(5)', ok: results.steelOk },
                    { title: 'Fissuration (wk)', val: `${formatNum(results.wk, 3)} / ${formatNum(results.w_max, 1)} mm`, desc: 'EC2 §7.3.4', ok: results.crackOk },
                  ]
                },
                {
                  label: 'Dispositions Constructives (EC2 §9)', icon: Hash,
                  items: [
                    { title: 'Espacement max (Lx)', val: `${Math.round(results.esp_x_final)} / ${Math.round(results.maxSpacing_x)} mm`, desc: 'EC2 §9.3.1.1', ok: results.spacingXOk },
                    { title: 'Espacement max (Ly)', val: `${Math.round(results.esp_y_final)} / ${Math.round(results.maxSpacing_y)} mm`, desc: 'EC2 §9.3.1.1', ok: results.spacingYOk },
                    ...(results.As_req_top > 0 ? [{ title: 'Espacement max (Chapeaux)', val: `${Math.round(results.esp_top_final)} / ${Math.round(results.maxSpacing_top)} mm`, desc: 'EC2 §9.3.1.1', ok: results.spacingTopOk }] : []),
                    { title: 'Ferraillage maximal', val: `${formatNum(Math.max(results.As_used_mm2, results.As_req_y)/100, 2)} / ${formatNum(results.As_max_mm2/100, 2)} cm²/m`, desc: 'EC2 §9.2.1.1(3)', ok: results.asMaxOk },
                    { title: 'Section fournie (Lx)', val: `${formatNum(results.As_reel_x/100, 2)} / ${formatNum(results.As_req_x/100, 2)} cm²/m`, desc: "Espacement retenu vs requis", ok: results.sectionSufficientX },
                    { title: 'Section fournie (Ly)', val: `${formatNum(results.As_reel_y/100, 2)} / ${formatNum(results.As_req_y/100, 2)} cm²/m`, desc: "Espacement retenu vs requis", ok: results.sectionSufficientY },
                    ...(results.As_req_top > 0 ? [{ title: 'Section fournie (Chapeaux)', val: `${formatNum(results.As_reel_top/100, 2)} / ${formatNum(results.As_req_top/100, 2)} cm²/m`, desc: "Espacement retenu vs requis", ok: results.sectionSufficientTop }] : []),
                  ]
                },
              ].filter(group => group.items.length > 0).map((group, gi) => (
                <div key={gi}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                    <group.icon size={14} /> {group.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {group.items.map((c, i) => (
                      <div key={i} className={`p-4 rounded-2xl border-l-4 shadow-sm transition-all hover:scale-[1.02] ${
                        c.ok === true ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-950 dark:text-emerald-100' : 
                        'bg-rose-50/50 dark:bg-rose-950/30 border-rose-500 text-rose-950 dark:text-rose-100'
                      }`}>
                        <div className="flex justify-between items-center mb-2 gap-2">
                          <h4 className="font-bold text-xs leading-tight">{c.title}</h4>
                          {c.ok ? <CheckCircle2 className="text-emerald-500 shrink-0" size={16} strokeWidth={2.5}/> : <AlertCircle className="text-rose-500 shrink-0" size={16} strokeWidth={2.5}/>}
                        </div>
                        <span className="text-base font-black block leading-tight">{c.val}</span>
                        <p className="text-[9px] opacity-60 font-medium mt-1">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'reinforcement' && (
            <motion.div key="reinforcement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center"><Layers size={18}/></div>
                    Nappe Inférieure - Sens Lx
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diamètre choisi</label>
                       <select value={state.diam_inf_x} onChange={(e) => updateState({ diam_inf_x: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {DIAM_OPTIONS.map(d => <option key={d} value={d}>ϕ {d} mm</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Espacement (mm)</span>
                          {state.esp_x_manual != null && (
                            <button type="button" onClick={() => { updateState({ esp_x_manual: undefined }); setEspXDraft(null); }} className="text-[9px] font-bold text-blue-500 hover:underline">Auto</button>
                          )}
                        </div>
                        <input type="number" step={5} min={0} value={espXDraft !== null ? espXDraft : String(Math.round(results.esp_x_final))}
                          onChange={(e) => { const v = e.target.value; setEspXDraft(v); const parsed = parseFloat(v); if (v !== '' && !isNaN(parsed) && parsed > 0) { updateState({ esp_x_manual: parsed }); } }}
                          onBlur={() => { const parsed = parseFloat(espXDraft ?? ''); if (espXDraft === null || espXDraft === '' || isNaN(parsed) || parsed <= 0) { updateState({ esp_x_manual: undefined }); } setEspXDraft(null); }}
                          className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-slate-50 outline-none" />
                        {state.esp_x_manual != null && (<span className="text-[10px] text-slate-400 dark:text-slate-500">Calculé : {Math.round(results.esp_x_auto)} mm</span>)}
                      </div>
                      <div className={`p-4 rounded-2xl ${results.sectionSufficientX ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200'}`}>
                        <span className="text-[10px] font-bold uppercase block mb-1 text-slate-400 dark:text-slate-500">As Réel {!results.sectionSufficientX && <span className="text-rose-500 font-black">Insuffisant</span>}</span>
                        <span className={`text-xl font-black ${results.sectionSufficientX ? 'text-slate-900 dark:text-slate-50' : 'text-rose-600'}`}>{formatNum(results.As_reel_x/100, 2)} <span className="text-xs">cm²/m</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {results.esp_y_final > 0 && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center"><Layers size={18}/></div>
                      {(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? 'Nappe Inférieure - Sens Ly' : 'Armatures de Répartition - Ly'}
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diamètre choisi</label>
                         {(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? (
                           <select value={state.diam_inf_y} onChange={(e) => updateState({ diam_inf_y: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                            {DIAM_OPTIONS.map(d => <option key={d} value={d}>ϕ {d} mm</option>)}
                          </select>
                         ) : (
                           <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">ϕ 8 mm (forfaitaire, répartition)</div>
                         )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Espacement (mm)</span>
                            {state.esp_y_manual != null && (
                              <button type="button" onClick={() => { updateState({ esp_y_manual: undefined }); setEspYDraft(null); }} className="text-[9px] font-bold text-blue-500 hover:underline">Auto</button>
                            )}
                          </div>
                          <input type="number" step={5} min={0} value={espYDraft !== null ? espYDraft : String(Math.round(results.esp_y_final))}
                            onChange={(e) => { const v = e.target.value; setEspYDraft(v); const parsed = parseFloat(v); if (v !== '' && !isNaN(parsed) && parsed > 0) { updateState({ esp_y_manual: parsed }); } }}
                            onBlur={() => { const parsed = parseFloat(espYDraft ?? ''); if (espYDraft === null || espYDraft === '' || isNaN(parsed) || parsed <= 0) { updateState({ esp_y_manual: undefined }); } setEspYDraft(null); }}
                            className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-slate-50 outline-none" />
                          {state.esp_y_manual != null && (<span className="text-[10px] text-slate-400 dark:text-slate-500">Calculé : {Math.round(results.esp_y_auto)} mm</span>)}
                        </div>
                        <div className={`p-4 rounded-2xl ${results.sectionSufficientY ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200'}`}>
                          <span className="text-[10px] font-bold uppercase block mb-1 text-slate-400 dark:text-slate-500">As Réel {!results.sectionSufficientY && <span className="text-rose-500 font-black">Insuffisant</span>}</span>
                          <span className={`text-xl font-black ${results.sectionSufficientY ? 'text-slate-900 dark:text-slate-50' : 'text-rose-600'}`}>{formatNum(results.As_reel_y/100, 2)} <span className="text-xs">cm²/m</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {results.As_req_top > 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-500 flex items-center justify-center"><Layers size={18}/></div>
                    Nappe Supérieure - Chapeaux (Appuis)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 -mt-6 mb-6">Dimensionnée à partir du moment sur appui M_appui = {formatNum(results.MEd_app_x, 2)} kNm/m (EC2, dalle continue/encastrée).</p>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diamètre choisi</label>
                       <select value={state.diam_top ?? state.diam_inf_x} onChange={(e) => updateState({ diam_top: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-100 transition-all outline-none">
                        {DIAM_OPTIONS.map(d => <option key={d} value={d}>ϕ {d} mm</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Espacement (mm)</span>
                          {state.esp_top_manual != null && (
                            <button type="button" onClick={() => { updateState({ esp_top_manual: undefined }); setEspTopDraft(null); }} className="text-[9px] font-bold text-blue-500 hover:underline">Auto</button>
                          )}
                        </div>
                        <input type="number" step={5} min={0} value={espTopDraft !== null ? espTopDraft : String(Math.round(results.esp_top_final))}
                          onChange={(e) => { const v = e.target.value; setEspTopDraft(v); const parsed = parseFloat(v); if (v !== '' && !isNaN(parsed) && parsed > 0) { updateState({ esp_top_manual: parsed }); } }}
                          onBlur={() => { const parsed = parseFloat(espTopDraft ?? ''); if (espTopDraft === null || espTopDraft === '' || isNaN(parsed) || parsed <= 0) { updateState({ esp_top_manual: undefined }); } setEspTopDraft(null); }}
                          className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-slate-50 outline-none" />
                        {state.esp_top_manual != null && (<span className="text-[10px] text-slate-400 dark:text-slate-500">Calculé : {Math.round(results.esp_top_auto)} mm</span>)}
                      </div>
                      <div className={`p-4 rounded-2xl ${results.sectionSufficientTop ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200'}`}>
                        <span className="text-[10px] font-bold uppercase block mb-1 text-slate-400 dark:text-slate-500">As Réel {!results.sectionSufficientTop && <span className="text-rose-500 font-black">Insuffisant</span>}</span>
                        <span className={`text-xl font-black ${results.sectionSufficientTop ? 'text-slate-900 dark:text-slate-50' : 'text-rose-600'}`}>{formatNum(results.As_reel_top/100, 2)} <span className="text-xs">cm²/m</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0"><Info size={18}/></div>
                  <div>
                    <h4 className="font-bold text-slate-600 dark:text-slate-300 mb-1">Pas de nappe supérieure (chapeaux) nécessaire</h4>
                    <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                      Avec la condition de bord actuelle (« {state.borderCond === BorderCondition.SimplySupported ? 'Simplement appuyée' : state.borderCond} »), le moment sur appui est nul : aucune armature supérieure n'est requise.
                      Pour dimensionner des chapeaux, choisissez « Continu » ou « Encastré » dans <strong>Bords</strong> (onglet Données).
                    </p>
                  </div>
                </div>
              )}

               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 pb-4 border-bottom border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center"><Maximize2 size={18}/></div>
                  Ancrage & Recouvrement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'lb,rqd (mm)', val: results.lb_rqd, desc: 'Sortie directe EC2' },
                    { label: 'Recouvrement l0 (mm)', val: results.l0, desc: 'α6 = 1,2' },
                    { label: 'Ancrage lbd (mm)', val: results.lbd, desc: 'α1 = 1,0' },
                  ].map((it, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 transition-all hover:bg-white hover:border-blue-100 shadow-sm group">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">{it.label}</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-50 group-hover:text-blue-600 transition-colors">{Math.round(it.val)}</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">{it.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0"><Hash size={24}/></div>
                  Nomenclature des Aciers (BBS)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-700">
                        <th className="px-6 py-4 text-left">Rep</th>
                        <th className="px-6 py-4 text-left">Désignation</th>
                        <th className="px-6 py-4 text-center">ϕ (mm)</th>
                        <th className="px-6 py-4 text-center">Nb</th>
                        <th className="px-6 py-4 text-center">Long (m)</th>
                        <th className="px-6 py-4 text-center">Esp (mm)</th>
                        <th className="px-6 py-4 text-center">P.U. (kg/m)</th>
                        <th className="px-6 py-4 text-right">Poids (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">1</td>
                        <td className="px-6 py-4">Aciers Porteurs (Inf. Lx)</td>
                        <td className="px-6 py-4 text-center">{state.diam_inf_x}</td>
                        <td className="px-6 py-4 text-center">{results.qty_x}</td>
                        <td className="px-6 py-4 text-center">{formatNum(results.length_x, 2)}</td>
                        <td className="px-6 py-4 text-center">{Math.round(results.esp_x_final)}</td>
                        <td className="px-6 py-4 text-center">{formatNum(results.linear_weight_x, 3)}</td>
                        <td className="px-6 py-4 text-right">{formatNum(results.weight_x, 2)}</td>
                      </tr>
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">2</td>
                        <td className="px-6 py-4">{(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? "Aciers Porteurs (Inf. Ly)" : "Aciers de Répartition (Ly)"}</td>
                        <td className="px-6 py-4 text-center">{(state.appuiType === AppuiType.FourSides && !results.effectiveOneWay) ? state.diam_inf_y : 8}</td>
                        <td className="px-6 py-4 text-center">{results.qty_y}</td>
                        <td className="px-6 py-4 text-center">{formatNum(results.length_y, 2)}</td>
                        <td className="px-6 py-4 text-center">{Math.round(results.esp_y_final)}</td>
                        <td className="px-6 py-4 text-center">{formatNum(results.linear_weight_y, 3)}</td>
                        <td className="px-6 py-4 text-right">{formatNum(results.weight_y, 2)}</td>
                      </tr>
                      {results.weight_top > 0 && (
                        <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">3</td>
                          <td className="px-6 py-4">Armatures de Chapeaux (Appuis)</td>
                          <td className="px-6 py-4 text-center">{state.diam_top ?? state.diam_inf_x}</td>
                          <td className="px-6 py-4 text-center">{results.qty_top}</td>
                          <td className="px-6 py-4 text-center">{results.len_top}</td>
                          <td className="px-6 py-4 text-center">{Math.round(results.esp_top_final)}</td>
                          <td className="px-6 py-4 text-center">{formatNum(results.linear_weight_top, 3)}</td>
                          <td className="px-6 py-4 text-right text-indigo-600">{formatNum(results.weight_top, 2)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-900 text-white font-black">
                        <td colSpan={7} className="px-6 py-4 text-right uppercase tracking-[0.2em] text-[10px]">Poids Total de l'Acier</td>
                        <td className="px-6 py-4 text-right text-blue-400">{formatNum(results.weight_total, 2)} kg</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
                    Longueurs unitaires incluant l'ancrage réglementaire à chaque extrémité (lbd, EC2 §8.4.4). Poids linéique P.U. = ϕ²/162 (kg/m).
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'help' && (
            <motion.div key="help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-12 shadow-sm prose prose-slate max-w-none no-scrollbar overflow-y-auto max-h-[80vh]">
              <div className="max-w-4xl mx-auto">
                <header className="border-b-2 border-blue-100 pb-10 mb-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl mb-6 shadow-sm border border-blue-100"><HelpCircle size={40} /></div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 mb-4 tracking-tight">Manuel d'Utilisation Expert</h1>
                  <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">Guide complet de dimensionnement aux Eurocodes — S.E.L.</p>
                </header>
                <section className="mb-16">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    L'<strong>Eurocode 2 Slab Calculator</strong> dimensionne des dalles pleines en béton armé conformément à la <strong>NF EN 1992-1-1</strong> : dalles portant sur 2 ou 4 côtés, continuité des appuis, toutes les vérifications réglementaires usuelles, ferraillage complet (nappes inférieures et supérieures) avec nomenclature, et export en note de calcul PDF personnalisable.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-blue-600 mb-3">Prise en main rapide</h4>
                    <ol className="text-sm space-y-2 text-slate-500 dark:text-slate-400 list-decimal list-inside">
                      <li>Nommez votre projet en haut de l'écran.</li>
                      <li>Renseignez géométrie, charges et appuis dans l'onglet <strong className="text-slate-700 dark:text-slate-200">Données</strong>.</li>
                      <li>Vérifiez que tous les indicateurs sont au vert dans <strong className="text-slate-700 dark:text-slate-200">Résultats</strong> et <strong className="text-slate-700 dark:text-slate-200">Vérifications</strong>.</li>
                      <li>Ajustez les diamètres/espacements dans <strong className="text-slate-700 dark:text-slate-200">Ferraillage</strong>.</li>
                      <li>Personnalisez le cartouche (bouton « Paramètres ») puis exportez la <strong className="text-slate-700 dark:text-slate-200">Note de Calcul</strong> en PDF.</li>
                    </ol>
                  </div>
                </section>
                <section className="mb-16">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white text-lg">01</span>
                    Onglet : Données de Conception
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">Cet onglet est le point d'entrée de votre projet. Une saisie rigoureuse garantit la validité du modèle de calcul.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><Layout size={18}/> Géométrie & Appuis</h4>
                      <ul className="text-sm space-y-2 text-slate-500 dark:text-slate-400">
                        <li><span className="font-bold text-slate-700 dark:text-slate-200">Portées (Lx, Ly) :</span> Entrez les distances entre nus d'appuis.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-200">Type d'Appui :</span> '4 côtés' active le calcul en dalle bi-directionnelle. '2 côtés' traite la dalle en poutre.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-200">Conditions de Bord :</span> Définit la continuité (articulé, encastré).</li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><Settings size={18}/> Matériaux & Charges</h4>
                      <ul className="text-sm space-y-2 text-slate-500 dark:text-slate-400">
                        <li><span className="font-bold text-slate-700 dark:text-slate-200">Béton (fck) :</span> Résistances standard (C25/30, C30/37).</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-200">Enrobage (cnom) :</span> Calculé selon l'exposition (XC, XD) et le Δcdev choisi.</li>
                        <li><span className="font-bold text-slate-700 dark:text-slate-200">Charges & Actions :</span> catégorie d'exploitation (fixe Qk) et charge permanente additionnelle G1.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2 text-sm">Bascule automatique en 1 seul sens (EC2 §5.3.1(5))</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Pour une dalle « 4 côtés », dès que Ly/Lx dépasse 2, le calcul bascule automatiquement en dalle-poutre unidirectionnelle (portée Lx uniquement).</p>
                  </div>
                </section>
                <section className="mb-16">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white text-lg">02</span>
                    Onglet : Résultats d'Analyse
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">Visualisez les paramètres dérivés et les sollicitations de calcul à l'État Limite Ultime (ELU).</p>
                  <div className="space-y-4">
                    <div className="p-5 border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-950/40 rounded-r-xl">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">Moments Fléchissants (MEd)</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Affiche les moments en travée (Mx, My) et aux appuis après application des coefficients Eurocode.</p>
                    </div>
                    <div className="p-5 border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-950/40 rounded-r-xl">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">Paramètres de Section (d, z, mu)</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Hauteur utile (d), bras de levier (z) et moment réduit (mu). Un mu &gt; 0.372 indique la nécessité d'aciers comprimés.</p>
                    </div>
                  </div>
                </section>
                <section className="mb-16">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white text-lg">03</span>
                    Onglet : Vérifications Réglementaires
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">Chaque contrôle affiche la valeur calculée face à sa limite normative, avec un code couleur vert (conforme) ou rouge (non conforme).</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: Calculator, title: 'Moment réduit μ', desc: "μ ≤ 0,372 (EC2 §3.1.7)." },
                      { icon: Zap, title: 'Effort tranchant', desc: "VEd vs VRd,c (EC2 §6.2.2)." },
                      { icon: Layout, title: 'Flèche (L/d)', desc: "Ratio portée/hauteur vs limite EC2 §7.4.2." },
                      { icon: AlertCircle, title: 'Contrainte acier (ELS)', desc: "σs ≤ 0,8·fyk (EC2 §7.2(5))." },
                      { icon: Activity, title: 'Fissuration (wk)', desc: "Ouverture calculée < w_lim (EC2 §7.3.4)." },
                      { icon: Maximize2, title: 'Poinçonnement', desc: "Si activé : VEd vs VRd,c (EC2 §6.4)." },
                    ].map((c, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-full flex items-center justify-center mb-4"><c.icon size={24}/></div>
                        <h4 className="font-bold text-sm mb-2">{c.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="mb-16">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white text-lg">04</span>
                    Ferraillage & Nomenclature (BBS)
                  </h2>
                  <div className="bg-slate-900 rounded-3xl p-8 text-white">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-400 mb-4 tracking-wider uppercase text-xs">Section Ferraillage</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Définit les diamètres et les espacements réels des nappes inférieures (Lx, Ly), <strong>librement modifiables</strong> (un bouton « Auto » permet de revenir au calcul automatique). L'algorithme calcule également la <strong>longueur d'ancrage (lbd)</strong> nécessaire.</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-400 mb-4 tracking-wider uppercase text-xs">Section Nomenclature</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Génère un tableau récapitulatif (BBS) avec le nombre de barres, les longueurs unitaires et le <strong>poids total</strong> par type d'acier.</p>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mb-16">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white text-lg">05</span>
                    Export de la Note de Calcul
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">Le couronnement de votre étude. L'onglet « Note de Calcul » synthétise l'ensemble des hypothèses et des résultats dans un document professionnel structuré.</p>
                  <div className="bg-blue-600 p-1 rounded-2xl mb-6">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-blue-200">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><FileText className="text-blue-600" size={18}/> Astuce :</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Le bouton "Imprimer le Rapport" ouvre une fenêtre dédiée contenant uniquement la note de calcul, prête à être imprimée ou enregistrée en PDF.</p>
                     </div>
                  </div>
                </section>
                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white text-lg">06</span>
                    Limites de la Méthode & Bonnes Pratiques
                  </h2>
                  <ul className="text-sm space-y-3 text-slate-500 dark:text-slate-400">
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Méthode des coefficients (Pigeaud/Bares) :</span> pratique courante complémentaire à l'EC2, non normative.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Valeurs par défaut :</span> γc=1,5, γs=1,15 et les valeurs recommandées des Tableaux 3.1/7.1N/7.4N/9.1N.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Poinçonnement :</span> le modèle simplifie l'aire intérieure au périmètre critique pour les poteaux de rive/d'angle.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Mode « 2 côtés » :</span> suppose l'absence totale d'appui sur les 2 autres bords.</li>
                  </ul>
                </section>
                <footer className="pt-12 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                  <SEL_Logo className="scale-75 origin-left" />
                  <div className="text-center md:text-right">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Support & Expertise</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">structuralengineeringlabs@gmail.com</p>
                  </div>
                </footer>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-12 shadow-sm min-h-[600px] prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: generateNoteDeCalcul(state, results, projectName, cartouche) }} />
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 py-10 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <p className="text-slate-900 dark:text-slate-50 font-bold text-sm">© {new Date().getFullYear()} Structural & Engineering Labs</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Conformité NF EN 1992-1-1 • Application professionnelle</p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Contact : structuralengineeringlabs@gmail.com</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tél : +237 6 51 13 56 05</p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full shadow-xl p-1.5">
        <button onClick={goToPrevTab} disabled={activeTabIndex === 0} title={activeTabIndex > 0 ? `Précédent : ${TAB_ORDER[activeTabIndex - 1].label}` : undefined} className="flex items-center gap-1.5 pl-3 pr-4 py-2.5 rounded-full font-semibold text-sm transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none">
          <ChevronLeft size={16} /> Précédent
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        <button onClick={goToNextTab} disabled={activeTabIndex === TAB_ORDER.length - 1} title={activeTabIndex < TAB_ORDER.length - 1 ? `Suivant : ${TAB_ORDER[activeTabIndex + 1].label}` : undefined} className="flex items-center gap-1.5 pl-4 pr-3 py-2.5 rounded-full font-semibold text-sm transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none">
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}