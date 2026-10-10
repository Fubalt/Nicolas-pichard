@AGENTS.md

# Nicolas Pichard - Directives de Travail & Règles Essentielles

## ⚠️ RÈGLE ABSOLUE DE DÉPLOIEMENT & BRANCHES :
1. **Branche de travail (`dev`)** :
   - TOUTES les modifications, développements, tests, corrections et commits se font **EXCLUSIVEMENT sur la branche `dev`**.
   - On ne touche JAMAIS à la branche `main` de façon autonome.
2. **Branche de production publique (`main`)** :
   - `main` est reliée directement au déploiement public Vercel (`https://nicolas-pichard.vercel.app`).
   - On ne merge ou push sur `main` **UNIQUEMENT si l'utilisateur en fait la demande explicite** (ex : *"mets en prod"*, *"déploie sur la version publique"*, *"mets à jour le site public"*).
3. **Traçabilité & Rollback** :
   - Faire des commits atomiques, propres et clairs sur `dev` pour permettre des retours en arrière faciles (`git revert`, `git checkout`, `git reset`) si nécessaire.
