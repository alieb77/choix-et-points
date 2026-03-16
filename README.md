# Choix & Points 🎲

Jeu de stratégie multijoueur en temps réel. Bluffez, devinez, survivez.

## Stack
- **React + Vite** — Frontend
- **Supabase** — Base de données + temps réel (WebSockets)
- **Vercel** — Déploiement

---

## 1. Créer un compte Supabase

1. Allez sur [supabase.com](https://supabase.com) → **Start your project**
2. Connectez-vous avec GitHub
3. Cliquez **New project** → donnez un nom (ex: `choix-et-points`) → choisissez une région proche (ex: `West EU`)
4. Notez votre **mot de passe** (vous n'en aurez plus besoin)
5. Attendez ~2 minutes que le projet se crée

---

## 2. Configurer la base de données

1. Dans Supabase, allez dans **SQL Editor** (menu gauche)
2. Cliquez **New query**
3. Copiez-collez tout le contenu de `supabase-schema.sql`
4. Cliquez **Run** (ou Ctrl+Enter)
5. Vérifiez que les tables `rooms` et `players` apparaissent dans **Table Editor**

---

## 3. Récupérer les clés Supabase

1. Dans Supabase, allez dans **Settings → API**
2. Copiez :
   - **Project URL** → ex: `https://abcdefgh.supabase.co`
   - **anon / public key** → longue chaîne JWT

---

## 4. Configuration locale

```bash
# Cloner / ouvrir le projet dans VS Code
cd choix-et-points

# Créer le fichier .env
cp .env.example .env
```

Éditez `.env` :
```
VITE_SUPABASE_URL=https://VOTRE_ID.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

```bash
# Installer les dépendances
npm install

# Lancer en local
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) 🎉

---

## 5. Déployer sur Vercel

### Option A — Via GitHub (recommandé)

1. Créez un repo GitHub et poussez le code :
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/vous/choix-et-points.git
git push -u origin main
```

2. Allez sur [vercel.com](https://vercel.com) → **New Project**
3. Importez votre repo GitHub
4. Dans **Environment Variables**, ajoutez :
   - `VITE_SUPABASE_URL` = votre URL
   - `VITE_SUPABASE_ANON_KEY` = votre clé
5. Cliquez **Deploy** ✅

### Option B — Via Vercel CLI

```bash
npm i -g vercel
vercel
# Suivez les instructions, ajoutez les env vars quand demandé
```

---

## Règles du jeu

| Paramètre | Valeur |
|-----------|--------|
| Score de départ | 10 pts |
| Élimination | −30 pts |
| Victoire | Adaptée au nombre de joueurs |

**Plage de nombres** (adaptée automatiquement) :
- 2–5 joueurs → 1–10
- 10 joueurs → 1–20
- 15 joueurs → 1–30
- 20 joueurs → 1–40

**Règle** : Choisissez un nombre en secret.
- Si vous êtes le **seul** à avoir choisi ce nombre → **+points**
- Si d'**autres** ont choisi le même → **tout le monde perd** ces points

---

## Architecture

```
src/
├── lib/
│   ├── supabase.js     # Client Supabase
│   └── game.js         # Formule + couleurs
├── hooks/
│   └── useGame.js      # Logique temps réel
├── components/
│   ├── Scoreboard.jsx
│   └── NumberPicker.jsx
├── pages/
│   ├── Home.jsx        # Créer / rejoindre
│   └── GameRoom.jsx    # Lobby + jeu + résultats
├── App.jsx
├── main.jsx
└── index.css
```
