import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  HelpCircle,
  Layers,
  Ruler,
  ShieldCheck,
  Weight,
  X,
  Zap,
} from 'lucide-react';
import { CoupeTransversale } from './CoupeTransversale';
import type { Geometrie, ChoixManuel } from '../types';

interface ManuelModalProps {
  open: boolean;
  onClose: () => void;
}

// Exemples purement illustratifs (indépendants du projet en cours).
const EXEMPLE_GEOMETRIE: Geometrie = { type_appui: 'continu', portee: 4.5, entraxe: 0.6, largeur_ame: 12, epaisseur_entrevous: 16, epaisseur_dalle: 4 };
const EXEMPLE_CHOIX: ChoixManuel = { nb_travee: 3, diametre_travee: 10, nb_appui: 1, diametre_appui: 8, nb_branches_etrier: 2, diametre_etrier: 6 };

/** Bloc de formule, style "console", utilisé pour toutes les formules de calcul. */
function Formule({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] sm:text-xs rounded-lg px-4 py-3 overflow-x-auto my-2 leading-relaxed">
      {children}
      {note && <div className="text-slate-400 text-[10px] mt-1.5 font-sans italic not-italic">{note}</div>}
    </div>
  );
}

/** Encadré d'illustration ("capture d'écran"), reproduisant les styles réels de l'application. */
function Apercu({ children, legende }: { children: React.ReactNode; legende: string }) {
  return (
    <div className="my-3">
      <div className="bg-[#f3f3f3] border border-slate-200 rounded-2xl p-4">{children}</div>
      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-1.5">{legende}</p>
    </div>
  );
}

const SECTIONS: { titre: string; icon: typeof Ruler; contenu: React.ReactNode }[] = [
  {
    titre: 'Philosophie & prise en main',
    icon: ShieldCheck,
    contenu: (
      <p>
        <strong>Calculette EC2 Plancher Corps Creux</strong> traduit les algorithmes de l'<strong>Eurocode 2</strong>
        (EN&nbsp;1992-1-1, complété par l'EN&nbsp;1991-1-1 pour les charges) en un outil d'aide à la décision, aussi
        compact qu'une calculette : tout ce que vous saisissez recalcule instantanément les résultats affichés
        juste en dessous, sur un seul écran, réparti en deux onglets — <strong>Synthèse</strong> (données d'entrée et
        résultats) et <strong>Note de calcul</strong> (document formel exportable). Rien n'est jamais figé : vous
        pouvez ajuster le ferraillage proposé à tout moment pour l'adapter à vos contraintes de chantier, et voir
        immédiatement l'effet sur la conformité. Les réglages exceptionnels, presque toujours laissés en
        automatique, sont regroupés dans un tiroir <strong>« Options avancées »</strong> replié par défaut — rien
        n'est caché, juste rangé.
      </p>
    ),
  },
  {
    titre: 'Géométrie',
    icon: Ruler,
    contenu: (
      <div className="space-y-4">
        <Apercu legende="Groupe Géométrie (onglet Synthèse)">
          <div className="space-y-3">
            <div className="win-inset p-2 text-xs font-bold text-slate-700 text-center">Poutrelle continue (Hyper)</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="win-input text-xs text-slate-500">Portée : 4.50 m</div>
              <div className="win-input text-xs text-slate-500">Entraxe : 0.60 m</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="win-input text-xs text-slate-500">Âme : 12 cm</div>
              <div className="win-input text-xs text-slate-500">Corps : 16 cm</div>
              <div className="win-input text-xs text-slate-500">Dalle : 4 cm</div>
            </div>
          </div>
        </Apercu>
        <p className="text-sm">
          Le mode <strong>« Poutrelle continue »</strong> active le calcul d'un moment sur appui (chapeau) et majore
          l'effort tranchant de 10&nbsp;% (redistribution forfaitaire).
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-center">
          <CoupeTransversale geometrie={EXEMPLE_GEOMETRIE} choixManuel={EXEMPLE_CHOIX} enrobage_nominal={20} />
        </div>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Portée (L)</strong> — distance entre nus/axes d'appuis selon le modèle retenu.</li>
          <li><strong>Entraxe (b)</strong> — largeur d'influence de la nervure (0.60 m usuel).</li>
          <li><strong>Âme (bw)</strong> et <strong>Corps (hw)</strong> — largeur et hauteur de la poutrelle bétonnée / du bloc d'entrevous.</li>
          <li><strong>Dalle (hf)</strong> — épaisseur de la dalle de compression coulée en place.</li>
        </ul>
      </div>
    ),
  },
  {
    titre: 'Matériaux, Durabilité & Charges',
    icon: Layers,
    contenu: (
      <div className="space-y-4">
        <Apercu legende="Groupe Matériaux & Durabilité (onglet Synthèse)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="win-input text-xs text-slate-500">Béton : C25/30</div>
              <div className="win-input text-xs text-slate-500">Acier : 500 MPa</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="win-input text-xs text-slate-500">Exposition : XC1</div>
              <div className="win-input text-xs text-slate-500">Classe struct. : S4</div>
            </div>
            <div className="win-inset p-3 bg-blue-50/50 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Enrobage nominal</span>
              <span className="text-lg font-bold text-[#0078d4]">20 mm</span>
            </div>
          </div>
        </Apercu>
        <p className="text-sm">
          Classes de béton disponibles : C20/25 à C35/45 ; f<sub>yk</sub> généralement fixé à 500 MPa (aciers HA).
          L'<strong>exposition</strong> (XC1 à XC4, XD1, XS1) et la <strong>classe structurale</strong> (S4 standard,
          S5 +10&nbsp;%, S6 +20&nbsp;%) pilotent l'enrobage minimal. Un enrobage imposé manuellement, ainsi que le
          nombre/diamètre du chapeau et le nombre de brins d'étrier, se règlent dans le tiroir
          <strong> « Options avancées »</strong>, sous les quatre groupes principaux.
        </p>
        <Formule note="cmin = max(12 mm, cmin,dur, 10 mm) ; cmin,dur dépend de l'exposition et de fck (approximation), majoré de 10/20 % pour S5/S6.">
          c_nom = c_min + Δc_dev
        </Formule>
        <Formule note="h = épaisseur totale (dalle + corps) ; recalculée à chaque changement de ferraillage ou d'enrobage.">
          d = h − c_nom − Ø_étrier − Ø_longitudinal / 2
        </Formule>

        <Apercu legende="Groupe Charges (onglet Synthèse)">
          <div className="space-y-2">
            <div className="win-inset p-2 text-xs font-bold text-slate-700 text-center">Cat. A : Habitation (1.5 kN/m²)</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="win-input text-[10px] text-slate-500 py-1">Chape 1.2</div>
              <div className="win-input text-[10px] text-slate-500 py-1">Revêt. 0.5</div>
              <div className="win-input text-[10px] text-slate-500 py-1">Plafond 0.2</div>
              <div className="win-input text-[10px] text-slate-500 py-1">Cloisons 1.0</div>
            </div>
          </div>
        </Apercu>
        <p className="text-sm">
          <strong>G₀</strong> — poids propre (dalle + nervure en béton, et poids forfaitaire des entrevous mis à
          l'échelle de leur hauteur, référence 0.6 kN/m² à 16 cm, ou saisi manuellement). <strong>G'</strong> — charges
          permanentes rapportées (chape, revêtement, plafond, cloisons). <strong>Q</strong> — charge d'exploitation
          selon la catégorie d'usage EN 1991-1-1 (A à D1).
        </p>
        <Formule>{'g = (G0 + G\') × b        q = Q × b'}</Formule>
        <Formule note="Combinaisons fondamentales EN 1990, coefficients partiels usuels bâtiment.">
          p_ELU = 1.35·g + 1.5·q        p_ELS = g + q
        </Formule>
      </div>
    ),
  },
  {
    titre: 'Armatures & Sollicitations',
    icon: Zap,
    contenu: (
      <div className="space-y-4">
        <Apercu legende="Groupe Armatures (onglet Synthèse)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="win-input text-xs text-slate-500">Nb barres : 2</div>
              <div className="win-input text-xs text-slate-500">Diamètre : HA 10</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="win-input text-xs text-slate-500">Branches : 2</div>
              <div className="win-input text-xs text-slate-500">Étrier : HA 6</div>
            </div>
            <div className="win-inset p-2 text-xs text-slate-600 text-center">cotθ = 2.5 (défaut)</div>
          </div>
        </Apercu>
        <p className="text-sm">
          Nombre et diamètre des barres de travée, diamètre des étriers, et inclinaison des bielles{' '}
          <strong>cotθ</strong> (réglable de 1.0 à 2.5, défaut 2.5 — une valeur plus faible réduit l'espacement requis
          mais rapproche de l'écrasement de la bielle). Le nombre de brins d'étrier se règle dans les
          « Options avancées ».
        </p>

        <p className="text-sm">
          <strong>Sollicitations</strong> — en isostatique, formules classiques de poutre sur deux appuis (M0, V0).
          En continu, coefficients forfaitaires usuels appliqués à ces mêmes valeurs de référence :
        </p>
        <Formule>{'M0 = p_ELU · L² / 8        V0 = p_ELU · L / 2'}</Formule>
        <Formule note="Coefficients forfaitaires usuels de redistribution en poutre continue à travées quasi égales.">
          M_travée = 0.8·M0        M_appui = 0.5·M0        V_Ed = 1.1·V0
        </Formule>
      </div>
    ),
  },
  {
    titre: 'Flexion (ELU) & chapeau de construction',
    icon: CheckCircle2,
    contenu: (
      <div className="space-y-4">
        <p className="text-sm">
          Calcul en section en <strong>Té</strong> : la table de compression (dalle) est mobilisée si l'axe neutre y
          reste ; sinon le calcul bascule sur la nervure seule (largeur bw).
        </p>
        <Formule note="fcd = fck/1.5, fyd = fyk/1.15. Si µ > 0.371, la section est jugée insuffisante.">
          μ = M_Ed / (b·d²·fcd)        α = 1.25·(1 − √(1 − 2μ))
        </Formule>
        <Formule>{'As = M_Ed / (d·(1 − 0.4α)·fyd)'}</Formule>
        <Formule note="fctm = 0.3·fck^(2/3). La section retenue est le plus grand de As calculé et As,min.">
          As,min = max(0.26·(fctm/fyk)·bw·d ; 0.0013·bw·d)
        </Formule>

        <p className="text-sm">
          <strong>Chapeau isostatique</strong> — un chapeau de construction forfaitaire reste proposé pour limiter la
          fissuration au nu d'appui :
        </p>
        <Formule note="Règle forfaitaire usuelle, ajustable si votre bureau d'études en applique une autre.">
          As,chapeau = max(As,min ; 0.15 × As,travée)
        </Formule>
      </div>
    ),
  },
  {
    titre: 'Cisaillement & étrier triangulaire',
    icon: ArrowDown,
    contenu: (
      <div className="space-y-4">
        <p className="text-sm">Résistance du béton seul, fonction du taux d'armature longitudinale réellement ancré à la section :</p>
        <Formule note="CRd,c = 0.18/1.5 ; k = 1+√(200/d) ≤ 2.0 (d en mm) ; ρl = As/(bw·d) ≤ 0.02 ; vmin = 0.035·k^1.5·√fck.">
          {'VRd,c = max[ CRd,c·k·(100·ρl·fck)^(1/3)·bw·d ; vmin·bw·d ]'}
        </Formule>
        <p className="text-sm">Si VEd dépasse VRd,c, des étriers sont requis (modèle du treillis de Mörsch, bielle à cotθ) :</p>
        <Formule note="z ≈ 0.9d. cotθ réglable de 1.0 à 2.5.">
          {'Asw/s = VEd / (z·fyd·cotθ)'}
        </Formule>
        <Formule note="ρw,min = 0.08·√fck / fyk.">
          {'(Asw/s)min = ρw,min · bw'}
        </Formule>
        <Formule note="ν1 = 0.6·(1 − fck/250). Si VEd dépasse VRd,max, la bielle de béton est écrasée.">
          {'VRd,max = bw·z·ν1·fcd / (cotθ + tanθ)'}
        </Formule>
        <Formule>{'s_max = min(0.75·d ; 300 mm)'}</Formule>

        <p className="text-sm">
          <strong>Façonnage</strong> — étrier <strong>triangulaire fermé</strong> : une base le long des barres de
          travée extrêmes et deux côtés montant jusqu'à un sommet commun au niveau du lit de chapeau, fermé par un
          crochet à 135° et une queue de 10 diamètres (EN&nbsp;ISO&nbsp;4066&nbsp;/&nbsp;NF&nbsp;A&nbsp;35-027).
        </p>
        <Formule note="A = base (bw − 2c), B = hauteur (h − 2c). Le crochet dépend du diamètre d'étrier réellement choisi.">
          {'Longueur développée = A + 2·√((A/2)² + B²) + 2 × (10·Ø_étrier)'}
        </Formule>
      </div>
    ),
  },
  {
    titre: 'États limites de service (ELS) & vérifications d’usage',
    icon: Weight,
    contenu: (
      <div className="space-y-4">
        <p className="text-sm">Limitation des contraintes, calculées en section fissurée homogénéisée (ae = 15) :</p>
        <Formule note="a = 0.5·b_eff ; y1 = profondeur de l'axe neutre, racine positive de a·y1² + ae·As·y1 − ae·As·d = 0.">
          {'Icr = b_eff·y1³/3 + ae·As·(d − y1)²'}
        </Formule>
        <Formule note="Limites EN 1992-1-1 §7.2 : σc ≤ 0.6·fck ; σs ≤ 0.8·fyk.">
          {'σc = M_ELS·y1 / Icr        σs = ae·M_ELS·(d − y1) / Icr'}
        </Formule>

        <p className="text-sm">Flèche vérifiée par comparaison du ratio d'élancement réel à une limite réglementaire :</p>
        <Formule note="ρ0 = 0.001·√fck ; ρ = As,requis/(bw·d) ; K = 1.0 (isostatique) ou 1.3 (continu).">
          {'ρ ≤ ρ0 :  (L/d)lim = K·[11 + 1.5·√fck·(ρ0/ρ) + 3.2·√fck·(ρ0/ρ − 1)^1.5]'}
        </Formule>
        <Formule note="Cas des sections plus armées que la référence ρ0.">
          {'ρ > ρ0 :  (L/d)lim = K·[11 + 1.5·√fck·(ρ0/ρ)]'}
        </Formule>
        <Formule note="Correction EN 1992-1-1 §7.4.2(2) pour les portées dépassant 7 m ; et majoration si As,fourni > As,requis.">
          Si L &gt; 7 m : (L/d)lim ×= 7/L
        </Formule>

        <p className="text-sm">Deux vérifications d'usage complètent le dispositif :</p>
        <Formule note="Ac = section brute en T (dalle + âme). EN 1992-1-1 §9.2.1.1(3).">As ≤ As,max = 0.04 · Ac</Formule>
        <Formule note="fbd = 2.25·fctd, fctd = 0.7·fctm/1.5 ; lb,min = max(0.3·lb,rqd ; 10Ø ; 100 mm). EN 1992-1-1 §8.4.">
          {'lb,rqd = (Ø/4) · (fyd/fbd)'}
        </Formule>
      </div>
    ),
  },
  {
    titre: 'Les deux onglets de résultats',
    icon: HelpCircle,
    contenu: (
      <div className="space-y-4">
        <p className="text-sm">
          <strong>Synthèse</strong> — les quatre groupes d'entrées (Géométrie, Matériaux & Durabilité, Charges,
          Armatures), les options avancées repliées, puis le bandeau de statut, les résultats clés, le ferraillage
          retenu (modifiable directement à côté de chaque résultat), les 8 vérifications réglementaires et la
          nomenclature — tout sur un seul écran, sans onglet caché. Le bouton <strong>« Voir le rapport
          complet »</strong> en bas de page bascule vers la Note de calcul.
        </p>
        <p className="text-sm">
          <strong>Note de calcul</strong> — document formel exportable (bouton PDF ou Ctrl+P) : cartouche compact
          (logo, projet/référence, rédacteur/date), hypothèses et matériaux, actions et sollicitations (avec
          diagrammes des moments et efforts tranchants), vérifications ELU/ELS, tableau consolidé des vérifications
          réglementaires, et nomenclature complète avec récapitulatif par diamètre. Le bouton{' '}
          <strong>« Paramétrer le cartouche »</strong> ouvre une fenêtre dédiée pour éditer le projet, la référence,
          le rédacteur, le bureau d'études, la date et le sous-titre.
        </p>
      </div>
    ),
  },
  {
    titre: 'Nomenclature des aciers',
    icon: Weight,
    contenu: (
      <div className="space-y-3">
        <p className="text-sm">
          Chaque poste (aciers de travée, chapeau, étriers) est décrit par sa désignation, sa <strong>forme de
          façonnage</strong>, son diamètre, son nombre, sa longueur développée et son poids. Les longueurs tiennent
          compte de l'ancrage réglementaire calculé, de la forme réelle du chapeau (droit si calculé, en L avec
          crochet plongeant si forfaitaire) et du façonnage complet de l'étrier triangulaire.
        </p>
      </div>
    ),
  },
];

export function ManuelModal({ open, onClose }: ManuelModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <HelpCircle size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight">Manuel d'utilisation</h2>
              </div>
              <button onClick={onClose} className="hover:rotate-90 transition-transform p-1" aria-label="Fermer">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 text-gray-700 leading-relaxed space-y-10">
              {SECTIONS.map((s, i) => (
                <section key={s.titre}>
                  <h3 className="text-blue-900 font-black uppercase tracking-[0.15em] text-sm border-b-2 border-blue-100 pb-3 mb-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">{i + 1}</div>
                    {s.titre}
                  </h3>
                  {s.contenu}
                </section>
              ))}

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                <h4 className="text-amber-900 font-bold m-0 mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <AlertCircle size={16} />
                  Avertissement légal
                </h4>
                <p className="text-amber-800 text-xs m-0 italic leading-snug">
                  Ce logiciel est une aide au calcul. Bien que basé sur des algorithmes issus de l'Eurocode 2, les
                  résultats doivent impérativement être validés par un ingénieur structure qualifié avant toute
                  signature ou commande de matériaux.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={onClose} className="win-button py-2 px-12 text-xs">
                Ok
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}