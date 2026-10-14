-- Schéma de la base S.E.L. (Postgres). Idempotent : peut être rejoué (npm run db:migrer).

create table if not exists utilisateurs (
  id           bigserial primary key,
  email        text not null unique,                 -- en minuscules
  nom          text,
  google_sub   text unique,                          -- identifiant Google (compte lié)
  cree_le      timestamptz not null default now()
);

-- Sessions : le navigateur ne détient qu'un jeton aléatoire ; la base n'en garde que l'empreinte SHA-256.
create table if not exists sessions (
  jeton_hash     text primary key,
  utilisateur_id bigint not null references utilisateurs(id) on delete cascade,
  expire_le      timestamptz not null,
  cree_le        timestamptz not null default now()
);
create index if not exists sessions_utilisateur on sessions(utilisateur_id);

-- Liens de connexion par e-mail (usage unique, 15 minutes).
create table if not exists liens_connexion (
  jeton_hash  text primary key,
  email       text not null,
  retour      text,
  expire_le   timestamptz not null,
  utilise_le  timestamptz,
  cree_le     timestamptz not null default now()
);
create index if not exists liens_email on liens_connexion(email, cree_le);

-- Paiements CinetPay : une ligne par transaction initiée.
create table if not exists paiements (
  id              bigserial primary key,
  transaction_id  text not null unique,
  utilisateur_id  bigint not null references utilisateurs(id),
  application     text not null,
  formule         text not null check (formule in ('mensuel', 'annuel')),
  montant         integer not null,                  -- XAF, TTC
  devise          text not null default 'XAF',
  statut          text not null default 'en_attente' check (statut in ('en_attente', 'accepte', 'refuse')),
  methode         text,
  reponse         jsonb,                             -- dernière réponse de vérification CinetPay
  numero_recu     text unique,
  cree_le         timestamptz not null default now(),
  maj_le          timestamptz not null default now(),
  paye_le         timestamptz
);
create index if not exists paiements_utilisateur on paiements(utilisateur_id, cree_le desc);
create sequence if not exists recus_seq;

-- Droit d'accès par application : date de fin (prolongée à chaque paiement accepté).
create table if not exists abonnements (
  utilisateur_id  bigint not null references utilisateurs(id) on delete cascade,
  application     text not null,
  fin             timestamptz not null,
  maj_le          timestamptz not null default now(),
  primary key (utilisateur_id, application)
);

-- Rappels d'échéance déjà envoyés (un par échéance et par type).
create table if not exists rappels (
  utilisateur_id  bigint not null references utilisateurs(id) on delete cascade,
  application     text not null,
  fin             timestamptz not null,
  type            text not null check (type in ('J7', 'J1')),
  envoye_le       timestamptz not null default now(),
  primary key (utilisateur_id, application, fin, type)
);
