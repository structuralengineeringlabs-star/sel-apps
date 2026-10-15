"use client";
/**
 * Portail d'abonnement d'une application payante : offres et tarifs, paiement (sans connexion préalable),
 * abonnement et reçus, administration. La page qui l'accueille est statique : l'état du visiteur (connexion,
 * abonnement, reçus, droits d'administration) est lu à l'affichage auprès de /api/compte/etat. Tous les contrôles
 * (prix, droits, activation) sont faits côté serveur ; ce composant n'en décide aucun.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Formule = "mensuel" | "annuel";
type Pays = "CM" | "CI" | "SN";
interface Paiement { transaction: string; recu: string | null; date: string; formule: Formule; montant: number; devise: string; statut: string; moyen: string; essai: boolean }
type Etat = { connecte: false } | { connecte: true; email: string; admin: boolean; fin: string | null; paiements: Paiement[] };
export interface PropsPortail {
  slug: string; nom: string; appUrl?: string;
  prix: Partial<Record<Formule, number>>; essai: boolean; prestataire: string; google: boolean;
  avantages: string[]; demo: string[];
}

const PAYS: Record<Pays, { nom: string; devise: "XAF" | "XOF"; zone: string; moyens: string }> = {
  CM: { nom: "Cameroun", devise: "XAF", zone: "CEMAC", moyens: "MTN Mobile Money, Orange Money" },
  CI: { nom: "Côte d'Ivoire", devise: "XOF", zone: "UEMOA", moyens: "MTN, Orange Money, Wave" },
  SN: { nom: "Sénégal", devise: "XOF", zone: "UEMOA", moyens: "Wave, Orange Money, Free Money" },
};
const ONGLETS = ["1. Offres et tarifs", "2. Paiement", "3. Mon abonnement et reçus", "4. Administration"] as const;
const ERREURS: Record<string, string> = {
  cgv: "Cochez l'acceptation des conditions générales de vente pour continuer.",
  email: "Adresse e-mail invalide : elle reçoit le reçu et sert à vous connecter.",
  trop: "Plusieurs commandes viennent d'être lancées pour cette adresse : patientez dix minutes.",
  paiement: "Le paiement n'a pas pu être lancé. Réessayez dans quelques instants ou contactez-nous.",
};
const STATUTS: Record<string, { t: string; c: string }> = {
  accepte: { t: "Payé", c: "text-emerald-400" }, en_attente: { t: "En attente", c: "text-amber-300" }, refuse: { t: "Refusé", c: "text-rose-400" },
};
const fcfa = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ")} F CFA`;
const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Douala" });
const Coche = () => <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-none text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10.5l4 4 8-9" /></svg>;
const carte = "rounded-xl border border-white/10 bg-[#0f1726]";

export default function PortailAbonnement(p: PropsPortail) {
  const formules = (["mensuel", "annuel"] as const).filter(f => p.prix[f]);
  // Choix conservés à travers une redirection (erreur, connexion) : ?formule=&pays=&erreur=&onglet=
  const q = useSearchParams();
  const qf = q.get("formule"), qp = q.get("pays"), qe = q.get("erreur"), qo = Number(q.get("onglet"));
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>(qe && ERREURS[qe] ? ONGLETS[1] : qo >= 1 && qo <= 3 ? ONGLETS[qo - 1] : ONGLETS[0]);
  const [formule, setFormule] = useState<Formule>(qf === "mensuel" || qf === "annuel" ? qf : formules.includes("annuel") ? "annuel" : formules[0]);
  const [pays, setPays] = useState<Pays>(qp === "CI" || qp === "SN" ? qp : "CM");
  const erreur = qe ? ERREURS[qe] ?? null : null;
  const [etat, setEtat] = useState<Etat | null>(null);
  useEffect(() => {
    fetch(`/api/compte/etat?application=${encodeURIComponent(p.slug)}`, { cache: "no-store" })
      .then(r => r.json()).then(setEtat).catch(() => setEtat({ connecte: false }));
  }, [p.slug]);

  const connecte = etat?.connecte ? etat : null;
  const actif = connecte?.fin && new Date(connecte.fin) > new Date() ? connecte.fin : null;
  const onglets = ONGLETS.filter(o => o !== ONGLETS[3] || connecte?.admin);
  const montant = p.prix[formule] ?? 0;
  const economie = p.prix.mensuel && p.prix.annuel ? Math.round((1 - p.prix.annuel / (12 * p.prix.mensuel)) * 100) : 0;
  const retour = useMemo(() => `/applications/${p.slug}?onglet=2&formule=${formule}&pays=${pays}#souscrire`, [p.slug, formule, pays]);
  const choisir = (f: Formule) => { setFormule(f); setOnglet(ONGLETS[1]); };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a101c] text-slate-200 shadow-xl">
      {/* En-tête */}
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-cyan-500/90 text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white sm:text-xl">Abonnement — {p.nom}</h2>
          <p className="text-xs text-slate-400 sm:text-sm">Paiement sécurisé par Mobile Money ({p.prestataire}) — Cameroun (XAF), Côte d&apos;Ivoire et Sénégal (XOF). Prix TTC, accès immédiat, sans reconduction.</p>
        </div>
      </div>
      <div className="border-b border-white/10 px-4 py-3 sm:px-6">
        <div role="tablist" aria-label="Abonnement" className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-white/10 bg-[#0f1726] p-1">
          {onglets.map(o => {
            const admin = o === ONGLETS[3], sel = o === onglet;
            return <button key={o} role="tab" aria-selected={sel} onClick={() => setOnglet(o)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${sel ? (admin ? "bg-amber-500 text-slate-950" : "bg-cyan-600 text-white") : admin ? "text-amber-400 hover:bg-white/5" : "text-slate-300 hover:bg-white/5"}`}>{o}</button>;
          })}
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* Bandeau d'état */}
        <div className={`${carte} flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13px]`}>
          <span className="text-slate-400">
            {connecte ? <>Compte : <span className="text-slate-200">{connecte.email}</span> · </> : null}
            Statut : {actif ? <span className="font-semibold text-emerald-400">abonnement actif jusqu&apos;au {dateFr(actif)}</span> : <span className="text-slate-200">{connecte ? "aucun abonnement actif" : "démonstration (non connecté)"}</span>}
          </span>
          <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-[#0a101c] p-1 font-mono text-[11px]">
            {(Object.keys(PAYS) as Pays[]).map(k => (
              <button key={k} onClick={() => setPays(k)} aria-pressed={pays === k}
                className={`rounded px-2.5 py-1 font-semibold ${pays === k ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50" : "text-slate-400 hover:text-slate-200"}`}>
                {PAYS[k].nom} · {PAYS[k].devise}
              </button>
            ))}
          </div>
        </div>
        {p.essai && <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-[13px] text-amber-200">Tarif d&apos;essai temporaire : toutes les formules sont facturées {fcfa(montant)}.</p>}

        {onglet === ONGLETS[0] && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`${carte} flex flex-col p-5`}>
              <p className="text-xs font-semibold text-cyan-400">Découverte</p>
              <h3 className="mt-1 text-lg font-bold text-white">Démonstration</h3>
              <p className="mt-1 text-[13px] text-slate-400">Essayer l&apos;application avant d&apos;acheter, sans compte.</p>
              <p className="mt-4 border-t border-white/10 pt-4 font-mono text-2xl font-bold text-white">0 F CFA</p>
              <p className="font-mono text-[11px] text-slate-500">Accès libre et permanent</p>
              <ul className="mt-4 flex-1 space-y-2 text-[13px]">{p.demo.map(d => <li key={d} className="flex gap-2"><Coche />{d}</li>)}</ul>
              {p.appUrl && <a href={p.appUrl} className="mt-5 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-center text-[13px] font-semibold text-white hover:bg-white/10">Ouvrir la démonstration</a>}
            </div>
            {formules.map(f => {
              const reco = f === "annuel";
              return (
                <div key={f} className={`flex flex-col rounded-xl border p-5 ${reco ? "border-cyan-400/70 bg-[#0f1c2b] shadow-[0_0_0_1px_rgba(34,211,238,.25)]" : "border-white/10 bg-[#0f1726]"}`}>
                  <p className="text-xs font-semibold text-cyan-400">{reco ? "Recommandé bureaux d'études" : "Sans engagement"}</p>
                  <h3 className="mt-1 text-lg font-bold text-white">{reco ? "Abonnement annuel" : "Abonnement mensuel"}</h3>
                  <p className="mt-1 text-[13px] text-slate-400">{reco ? "Pour une utilisation sur l'année, au meilleur prix." : "Pour un projet ponctuel."}</p>
                  <p className="mt-4 border-t border-white/10 pt-4 font-mono text-2xl font-bold text-white">{fcfa(p.prix[f]!)} <span className="text-sm font-normal text-slate-400">/ {reco ? "an" : "mois"}</span></p>
                  <p className="font-mono text-[11px] text-slate-500">{reco ? `365 jours${economie > 0 && !p.essai ? ` · soit ${fcfa(Math.round(p.prix.annuel! / 12))} / mois, −${economie} % sur 12 mois` : ""}` : "30 jours, sans reconduction automatique"}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-[13px]">{p.avantages.map(a => <li key={a} className="flex gap-2"><Coche />{a}</li>)}</ul>
                  <button onClick={() => choisir(f)} className={`mt-5 rounded-lg px-4 py-2.5 text-[13px] font-semibold ${reco ? "bg-cyan-600 text-white hover:bg-cyan-500" : "border border-white/15 bg-white/5 text-white hover:bg-white/10"}`}>
                    {actif ? "Prolonger" : "Choisir"} — {reco ? "annuel" : "mensuel"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {onglet === ONGLETS[1] && (
          <form action="/api/paiement/initier" method="post" className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
            <input type="hidden" name="application" value={p.slug} />
            <input type="hidden" name="formule" value={formule} />
            <input type="hidden" name="pays" value={pays} />
            <div className="space-y-5">
              <div className={`${carte} p-5`}>
                <h3 className="mb-4 font-bold text-white">01. Pays et moyen de paiement</h3>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {(Object.keys(PAYS) as Pays[]).map(k => (
                    <button type="button" key={k} onClick={() => setPays(k)} aria-pressed={pays === k}
                      className={`rounded-lg border p-3 text-left ${pays === k ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-[#0a101c] hover:border-white/25"}`}>
                      <span className="font-mono text-[10px] font-semibold text-amber-300">{PAYS[k].zone} · {PAYS[k].devise}</span>
                      <span className="mt-1 block font-semibold text-white">{PAYS[k].nom}</span>
                      <span className="block text-[11px] text-slate-400">{PAYS[k].moyens}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${carte} space-y-4 p-5`}>
                <h3 className="font-bold text-white">02. Vos coordonnées</h3>
                {etat === null ? <p className="text-[13px] text-slate-400">Chargement…</p> : connecte ? (
                  <p className="text-[13px] text-slate-300">Connecté : <strong className="text-white">{connecte.email}</strong>. Le reçu est envoyé à cette adresse.</p>
                ) : (
                  <>
                    <label className="block text-[13px]">
                      <span className="font-semibold text-slate-200">Adresse e-mail</span>
                      <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.cm"
                        className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-[#0a101c] px-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none" />
                      <span className="mt-1 block text-[11px] text-slate-400">Pas de compte à créer ni de mot de passe : le reçu et l&apos;accès sont rattachés à cette adresse. Ce navigateur est connecté dès le paiement confirmé.</span>
                    </label>
                    {p.google && <a href={`/api/auth/google?retour=${encodeURIComponent(retour)}`} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-semibold text-white hover:bg-white/10">
                      <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" /></svg>
                      Ou continuer avec Google</a>}
                    <p className="text-[11px] text-slate-500">Déjà client ? Indiquez la même adresse : l&apos;abonnement s&apos;ajoute à votre compte, et vous vous connectez ensuite par un code reçu par e-mail.</p>
                  </>
                )}
                <label className="flex items-start gap-2 text-[12px] text-slate-400">
                  <input type="checkbox" name="cgv" value="oui" required className="mt-0.5 accent-cyan-500" />
                  <span>J&apos;accepte les <a href="/cgv" className="underline">conditions générales de vente</a>. L&apos;accès étant ouvert dès le paiement, <strong className="text-slate-200">aucun remboursement</strong> n&apos;est possible ; la démonstration permet d&apos;essayer avant d&apos;acheter.</span>
                </label>
                {erreur && <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">{erreur}</p>}
                <div className="flex justify-end">
                  <button type="submit" disabled={etat === null} className="rounded-lg bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50">
                    Payer {fcfa(montant)} ({PAYS[pays].devise}) via {p.prestataire}
                  </button>
                </div>
              </div>
            </div>
            <div className={`${carte} h-fit p-5`}>
              <h3 className="mb-4 font-bold text-white">03. Récapitulatif</h3>
              <p className="text-[12px] text-slate-400">Application</p>
              <p className="mb-3 rounded-lg border border-white/15 bg-[#0a101c] px-3 py-2 text-[13px] font-semibold text-white">{p.nom}</p>
              {formules.length > 1 && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {formules.map(f => <button type="button" key={f} onClick={() => setFormule(f)} aria-pressed={formule === f}
                    className={`rounded-lg border px-3 py-2 text-[13px] font-semibold ${formule === f ? "border-cyan-400 bg-cyan-500/10 text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>
                    {f === "annuel" ? `Annuel${economie > 0 && !p.essai ? ` −${economie} %` : ""}` : "Mensuel"}</button>)}
                </div>
              )}
              <dl className="space-y-2 rounded-lg border border-white/10 bg-[#0a101c] p-4 font-mono text-[12px]">
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Formule</dt><dd className="text-white">{formule === "annuel" ? "Annuelle" : "Mensuelle"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Durée d&apos;accès</dt><dd className="text-white">{formule === "annuel" ? "365 jours" : "30 jours"}</dd></div>
                {formule === "annuel" && p.prix.mensuel && !p.essai && <div className="flex justify-between gap-3"><dt className="text-slate-400">12 mois au tarif mensuel</dt><dd className="text-slate-400 line-through">{fcfa(12 * p.prix.mensuel)}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-slate-400">Devise ({PAYS[pays].nom})</dt><dd className="text-amber-300">{PAYS[pays].devise}</dd></div>
                {actif && <div className="flex justify-between gap-3"><dt className="text-slate-400">Nouvelle échéance</dt><dd className="text-white">prolongée à partir du {dateFr(actif)}</dd></div>}
                <div className="mt-2 flex justify-between gap-3 border-t border-white/10 pt-3 text-[14px] font-bold"><dt className="text-white">Total TTC à régler</dt><dd className="text-cyan-300">{fcfa(montant)}</dd></div>
              </dl>
              <p className="mt-4 text-[13px] font-semibold text-white">Droits débloqués dès le paiement confirmé :</p>
              <ul className="mt-2 space-y-1.5 text-[13px]">{p.avantages.map(a => <li key={a} className="flex gap-2"><Coche />{a}</li>)}</ul>
            </div>
          </form>
        )}

        {onglet === ONGLETS[2] && (etat === null ? <p className="text-[13px] text-slate-400">Chargement…</p> : !connecte ? (
          <div className={`${carte} max-w-xl space-y-3 p-5 text-[13px]`}>
            <h3 className="font-bold text-white">Connectez-vous pour voir votre abonnement et vos reçus</h3>
            <p className="text-slate-400">Un code à 6 chiffres vous est envoyé par e-mail ; saisissez-le sur la page suivante.</p>
            <form action="/api/auth/email" method="post" className="flex flex-wrap gap-2">
              <input type="hidden" name="retour" value={`/applications/${p.slug}?onglet=3#souscrire`} />
              <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.cm" className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-[#0a101c] px-3 text-white placeholder:text-slate-500" />
              <button className="rounded-lg bg-cyan-600 px-4 text-[13px] font-semibold text-white hover:bg-cyan-500">Recevoir un code</button>
            </form>
            {p.google && <a href={`/api/auth/google?retour=${encodeURIComponent(`/applications/${p.slug}?onglet=3#souscrire`)}`} className="inline-block text-cyan-300 underline">Ou continuer avec Google</a>}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`${carte} p-5`}>
                <p className="text-[12px] text-slate-400">Abonnement</p>
                <p className="mt-1 text-lg font-bold text-white">{actif ? "Édition complète" : "Démonstration"}</p>
                <p className={`mt-2 text-[13px] font-semibold ${actif ? "text-emerald-400" : "text-slate-400"}`}>{actif ? `Valide jusqu'au ${dateFr(actif)}` : connecte.fin ? `Expiré le ${dateFr(connecte.fin)}` : "Aucun abonnement"}</p>
              </div>
              <div className={`${carte} p-5`}>
                <p className="text-[12px] text-slate-400">Application</p>
                <p className="mt-1 font-mono text-lg font-bold text-cyan-300">{p.nom}</p>
                {p.appUrl && <a href={p.appUrl} className="mt-2 inline-block text-[13px] font-semibold text-cyan-300 underline">Ouvrir {actif ? "l'édition complète" : "la démonstration"}</a>}
              </div>
              <div className={`${carte} p-5`}>
                <p className="text-[12px] text-slate-400">Compte</p>
                <p className="mt-1 break-all font-mono text-[15px] font-bold text-emerald-300">{connecte.email}</p>
                <a href="/compte" className="mt-2 inline-block text-[13px] text-slate-300 underline">Tous mes abonnements</a>
              </div>
            </div>
            <div className={`${carte} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <h3 className="font-bold text-white">Journal des paiements et reçus</h3>
                <span className="font-mono text-[11px] text-slate-500">{connecte.paiements.length} opération(s)</span>
              </div>
              {connecte.paiements.length === 0 ? <p className="px-5 py-4 text-[13px] text-slate-400">Aucun paiement pour cette application.</p> : (
                <div className="overflow-x-auto"><table className="w-full text-[13px]">
                  <thead><tr className="text-left text-[12px] text-slate-400"><th className="px-5 py-2">N° de reçu</th><th>Date</th><th>Formule</th><th>Moyen de paiement</th><th className="text-right">Montant</th><th className="pl-4">État</th><th className="pr-5 text-right">Action</th></tr></thead>
                  <tbody>{connecte.paiements.map(x => (
                    <tr key={x.transaction} className="border-t border-white/5">
                      <td className="px-5 py-2.5 font-mono text-[12px] font-semibold text-white">{x.recu ?? "—"}</td>
                      <td className="font-mono text-[12px] text-slate-400">{dateFr(x.date)}</td>
                      <td className="font-semibold text-cyan-300">{x.formule === "annuel" ? "Annuel" : "Mensuel"}</td>
                      <td className="text-slate-300">{x.moyen}{x.essai ? " (essai)" : ""}</td>
                      <td className="whitespace-nowrap text-right font-mono font-semibold text-white">{fcfa(x.montant).replace("F CFA", x.devise)}</td>
                      <td className={`pl-4 font-semibold ${STATUTS[x.statut]?.c ?? ""}`}>{STATUTS[x.statut]?.t ?? x.statut}</td>
                      <td className="pr-5 text-right"><a href={`/compte/paiement/${x.transaction}`} className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[12px] hover:bg-white/10">{x.statut === "accepte" ? "Reçu" : "Détail"}</a></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              )}
            </div>
          </div>
        ))}

        {onglet === ONGLETS[3] && connecte?.admin && (
          <div className="grid gap-5 lg:grid-cols-2">
            <form action="/api/admin/activer" method="post" className={`${carte} space-y-3 p-5 text-[13px]`}>
              <h3 className="font-bold text-white">Activation manuelle (paiement hors ligne)</h3>
              <p className="text-slate-400">Virement, espèces, dépôt Mobile Money ou bon de commande : l&apos;abonnement est activé côté serveur, un reçu numéroté est émis et le client est prévenu par e-mail.</p>
              <input type="hidden" name="application" value={p.slug} />
              <label className="block">Adresse e-mail du client<input name="email" type="email" required className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-[#0a101c] px-3 text-white" /></label>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">Formule<select name="formule" className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-[#0a101c] px-2 text-white">{formules.map(f => <option key={f} value={f}>{f === "annuel" ? "Annuel" : "Mensuel"}</option>)}</select></label>
                <label className="block">Montant reçu<input name="montant" type="number" min={0} step={1} required className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-[#0a101c] px-2 text-white" /></label>
                <label className="block">Devise<select name="devise" className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-[#0a101c] px-2 text-white"><option>XAF</option><option>XOF</option></select></label>
              </div>
              <label className="block">Note (référence de l&apos;opération)<input name="note" required maxLength={300} placeholder="Ex. : virement n° … du …" className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-[#0a101c] px-3 text-white placeholder:text-slate-500" /></label>
              <button className="rounded-lg bg-amber-500 px-4 py-2.5 font-bold text-slate-950 hover:bg-amber-400">Activer l&apos;abonnement</button>
            </form>
            <div className={`${carte} space-y-3 p-5 text-[13px]`}>
              <h3 className="font-bold text-white">Aperçu et suivi</h3>
              <p className="text-slate-400">En tant qu&apos;administrateur ({connecte.email}), vous voyez l&apos;édition complète sans abonnement ; les clients non abonnés voient la démonstration. Ce droit est vérifié par le serveur.</p>
              <div className="flex flex-wrap gap-2">
                {p.appUrl && <a href={p.appUrl} className="rounded-lg border border-cyan-400/60 bg-cyan-500/10 px-3 py-2 font-semibold text-white">Ouvrir l&apos;édition complète</a>}
                <a href={`/tools/${p.slug}/index.html`} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-semibold text-white">Voir la démonstration</a>
                <a href="/admin" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-semibold text-white">Paiements et exports</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
