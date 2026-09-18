import { X, Settings2 } from 'lucide-react';
import type { InfosProjet } from '../types';

interface CartoucheSettingsModalProps {
  open: boolean;
  onClose: () => void;
  infosProjet: InfosProjet;
  setInfosProjet: (v: InfosProjet) => void;
}

export function CartoucheSettingsModal({ open, onClose, infosProjet, setInfosProjet }: CartoucheSettingsModalProps) {
  if (!open) return null;

  const champ = (label: string, key: keyof InfosProjet) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
      <input type="text" value={infosProjet[key]} onChange={(e) => setInfosProjet({ ...infosProjet, [key]: e.target.value })} className="win-input w-full text-sm" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Settings2 size={18} />
            <h2 className="text-sm font-black uppercase tracking-tight">Paramètres du cartouche</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-1" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {champ('Projet / Affaire', 'nom')}
          {champ('Référence dossier', 'reference')}
          {champ('Rédacteur', 'redacteur')}
          {champ('Bureau d’études', 'auteur')}
          {champ('Date d’édition', 'date')}
          {champ('Type de calcul (sous-titre)', 'typeCalcul')}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button onClick={onClose} className="win-button py-2 px-10 text-xs">
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}