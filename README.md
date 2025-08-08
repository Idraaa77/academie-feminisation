# Académie de Féminisation — Starter (Next.js + Supabase + Vercel)

Girly + touche *Sabrina Carpenter*, paliers de progression, exercices quotidiens, preuves notées par **Mlle Amélia**, examens mensuels, dressing avec tenue du samedi, bulletin sur 20.

## Lancer en local
1. Clone ce dossier
2. `cp .env.example .env.local` et remplis les clés Supabase
3. `npm install` (ou `pnpm i`)
4. `npm run dev`
5. Ouvre http://localhost:3000

## Déployer
- Pousse sur GitHub → **Vercel** importe le repo → ajoute les variables d’environnement.
- Le cron du samedi est défini dans `vercel.json` (07:00 UTC).

## Supabase
- Crée un projet → exécute `supabase/schema.sql` dans SQL editor.
- Mets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` dans Vercel.
- `npm run db:seed` (en local avec `SUPABASE_SERVICE_ROLE`).

## Sécurité
- L’onglet **Professeure** est protégé (démo) par `PROF_PASSWORD` (par défaut `amelia123`). En prod, utilise l’auth Supabase + rôle `prof`.
