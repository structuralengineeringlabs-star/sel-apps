  return (
    <div className="w-full py-4 px-2 sm:px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto space-y-3">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">Calculette EC2 Plancher Corps Creux</h1>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest opacity-70">EN 1992-1-1 · v1.0</p>
          </div>
          <button onClick={() => setShowHelp(true)} className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Manuel">
            <HelpCircle size={16} />
          </button>
        </div>

        {/* Onglets */}
        <div className="p-1 border border-slate-200 bg-white rounded-md flex gap-1">
          {ONGLETS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all duration-200 ${
                activeTab === tab.id ? 'bg-[#0078d4] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={12} />
              <span className="uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu : UN SEUL onglet rendu à la fois */}
        {activeTab === 'resultats' && (
          <SyntheseCompacte
            geometrie={geometrie}
            setGeometrie={setGeometrie}
            materiaux={materiaux}
            setMateriaux={setMateriaux}
            durabilite={durabilite}
            setDurabilite={setDurabilite}
            chargesDetails={chargesDetails}
            setChargesDetails={setChargesDetails}
            choixManuel={choixManuel}
            setChoixManuel={setChoixManuel}
            etriersParams={etriersParams}
            setEtriersParams={setEtriersParams}
            enrobage_nominal={enrobage_nominal}
            resultats={resultats}
            total_acier_kg={total_acier_kg}
            longueur_barre_travee={longueur_barre_travee}
            longueur_chapeau={longueur_chapeau}
            nombre_etriers={nombre_etriers}
            longueur_etrier_unitaire={longueur_etrier_unitaire}
            onVoirRapport={() => setActiveTab('rapport')}
          />
        )}

        {activeTab === 'rapport' && (
          <RapportTab
            resultats={resultats}
            geometrie={geometrie}
            materiaux={materiaux}
            durabilite={durabilite}
            chargesDetails={chargesDetails}
            choixManuel={choixManuel}
            infosProjet={infosProjet}
            setInfosProjet={setInfosProjet}
            enrobage_nominal={enrobage_nominal}
            courbesM={courbesM}
            courbesV={courbesV}
            total_acier_kg={total_acier_kg}
            longueur_barre_travee={longueur_barre_travee}
            longueur_chapeau={longueur_chapeau}
            nombre_etriers={nombre_etriers}
            longueur_etrier_unitaire={longueur_etrier_unitaire}
          />
        )}

        {/* Copyright */}
        <div className="text-center pt-2">
          <input
            className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-transparent border-none text-center focus:ring-0 w-full"
            value={infosProjet.copyright}
            onChange={(e) => setInfosProjet({ ...infosProjet, copyright: e.target.value })}
          />
        </div>
      </div>

      <ManuelModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );