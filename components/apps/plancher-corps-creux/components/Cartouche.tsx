import type { InfosProjet } from '../types';

interface CartoucheProps {
  infosProjet: InfosProjet;
  estValide: boolean | null;
}

/**
 * Cartouche compact de la note de calcul — trois colonnes égales
 * (logo / projet / rédacteur+titre), padding réduit, typographie fine.
 *
 * Sombre à l'écran (fond #0b111e), blanc et noir à l'impression.
 */
export function Cartouche({ infosProjet, estValide }: CartoucheProps) {
  return (
    <div className="cartouche-sel font-sans rounded overflow-hidden border-2 border-[#1e2d45] cartouche-sel-border grid grid-cols-1 sm:grid-cols-3 mb-8">
      {/* Cellule 1 : logo */}
      <div className="p-4 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-[#1e2d45] cartouche-sel-border bg-[#3a9bd5]/5">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full">
              <path d="M24 4 L44 14 L44 34 L24 44 L4 34 L4 14 Z" fill="rgba(58,155,213,0.05)" />
              <path d="M24 4 L44 14 L44 34 L24 44 L4 34 L4 14 Z" fill="none" stroke="#3a9bd5" strokeWidth="2.5" />
              <path d="M4 14 L44 34 M4 34 L44 14 M24 4 L24 44" stroke="rgba(58,155,213,0.4)" strokeWidth="0.5" />
              <rect x="16" y="18" width="16" height="12" rx="2" fill="#3a9bd5" />
            </svg>
            <span className="relative font-black text-white text-[10px] tracking-tighter mt-0.5">S.E.L.</span>
          </div>
          <div className="flex flex-col -mt-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-lg tracking-tighter">STRUCTURAL</span>
              <span className="text-[#3a9bd5] font-bold text-lg">&</span>
            </div>
            <span className="font-bold text-[#6b8aaa] text-[10px] tracking-[0.35em] uppercase">Engineering Labs</span>
          </div>
        </div>
      </div>

      {/* Cellule 2 : projet */}
      <div className="p-4 flex flex-col justify-center gap-4 border-b sm:border-b-0 sm:border-r border-[#1e2d45] cartouche-sel-border">
        <div>
          <div className="text-[8px] text-[#6b8aaa] uppercase font-bold tracking-widest mb-1">Projet / Affaire</div>
          <div className="text-sm font-bold uppercase">{infosProjet.nom}</div>
        </div>
        <div>
          <div className="text-[8px] text-[#6b8aaa] uppercase font-bold tracking-widest mb-1">Référence dossier</div>
          <div className="text-xs font-mono text-[#3a9bd5]">{infosProjet.reference}</div>
        </div>
      </div>

      {/* Cellule 3 : rédacteur & titre */}
      <div className="p-4 flex flex-col justify-center">
        <div className="flex justify-between mb-2.5">
          <div>
            <div className="text-[8px] text-[#6b8aaa] uppercase font-bold tracking-widest mb-1">Rédacteur</div>
            <div className="text-xs">{infosProjet.redacteur}</div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-[#6b8aaa] uppercase font-bold tracking-widest mb-1">Date d'édition</div>
            <div className="text-xs">{infosProjet.date}</div>
          </div>
        </div>
        <div className="mt-auto pt-3 border-t border-[#1e2d45]/50 cartouche-sel-border text-center">
          <div className={`text-xs font-bold tracking-[0.2em] ${estValide === false ? 'text-red-400' : 'text-[#3a9bd5]'}`}>
            NOTE DE CALCUL{estValide !== null && (estValide ? ' · CONFORME' : ' · NON CONFORME')}
          </div>
          <div className="text-[10px] font-bold text-[#6b8aaa] tracking-wider">{infosProjet.typeCalcul}</div>
        </div>
      </div>
    </div>
  );
}