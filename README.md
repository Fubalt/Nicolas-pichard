# Nicolas Pichard

Une application web interactive de devinette inspirée de **Heardle** et **Framed**, dédiée aux vidéos cultes du créateur **Cyprien**.

## 🎮 Concept & Règles du Jeu

Le joueur doit deviner le titre exact d'une vidéo culte de Cyprien à partir de micro-extraits **vidéo et sonores** de plus en plus longs, tirés à un timecode aléatoire :

- **Essai 1** : `0.1s` (micro-flash vidéo et audio de 100 ms)
- **Essai 2 (Skip ou Erreur)** : `+2.0s` (total : `2.1s`)
- **Essai 3 (Skip ou Erreur)** : `+8.0s` (total : `10.1s`)
- **Essai 4 (Skip ou Erreur)** : `+16.0s` (total : `26.1s`)
- **Arrêt sur image & Gel** : À chaque palier, la vidéo joue l'extrait puis se **fige automatiquement sur la dernière image**, offrant un indice visuel permanent.
- **Victoire / Défaite** : Révélation complète de la vidéo (titre, timecode de départ, lecteur vidéo YouTube débloqué pour visionnage libre, partage du score en emojis style Heardle 🟩 🟥 ⬜ ⬛).

---

## ⚡ Fonctionnalités Clés

1. **Lecteur Vidéo Dédié Anti-Triche :**
   - Recadrage cinéma discret (1.20x) masquant le titre YouTube et le tiroir "Plus de vidéos" sans déformer la scène.
   - Timer précis coupant la lecture au millième de seconde près selon le palier débloqué.
   - Maintien sur la dernière image (arrêt sur image) pour fournir un indice visuel permanent.
   - Déblocage automatique du lecteur officiel en fin de partie (victoire ou défaite).

2. **Sélection Aléatoire & Timecode Sécurisé :**
   - Catalogue complet de **205 vidéos longues** de Cyprien (`data/cyprien-videos.json`), exempt de Shorts (<60s) et d'épisodes de podcast audio.
   - Génération d'un `startTime` strictement compris entre **5 secondes** et **`(durée_totale - 35 secondes)`** pour éviter les génériques de fin ou les coupures hors vidéo.

3. **Système de Recherche Tolérant & Autocomplétion :**
   - Champ de recherche intelligent avec racinisation (stemming), tolérance pluriel/singulier, gestion implicite des numéros (ex: "reunions 1" trouve "Les réunions").
   - Navigation au clavier (`Flèche Haut`, `Flèche Bas`, `Entrée`, `Échap`).
   - Raccourci clavier universel : Barre d'espace pour lancer / mettre en pause la lecture de l'extrait.

4. **Timeline & Indicateurs Visuels :**
   - Barre de progression dynamique divisée selon les 4 paliers de durée (0.1s, 2.1s, 10.1s, 26.1s).
   - Remplissage visuel en temps réel au rythme de la lecture.
   - Historique des 4 essais avec statuts (Validé 🟩, Erreur 🟥, Passé ⬜, Restant ⬛).

5. **Interface Moderne & Responsive :**
   - Dark mode natif (zinc-950/amber/orange).
   - Explosion de confettis en cas de victoire.
   - Bouton de partage prêt pour les réseaux sociaux / Discord (`🎬 Nicolas Pichard • X/4`).
   - Mode partie aléatoire infinie (*"Partie suivante"*).

---

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) 16 (App Router)
- **Langage** : TypeScript 5
- **Design & UI** : Tailwind CSS v4, Lucide React
- **Animations & Effets** : Canvas-Confetti
- **Audio / Vidéo** : API YouTube IFrame officielle

---

## 🌿 Stratégie de Branches (Production vs Dev)

- **`main`** : Branche de **Production publique**. Seules les versions validées et stables y sont fusionnées.
- **`dev`** : Branche de **Développement / Staging**. Toutes les modifications et tests s'effectuent ici avec prévisualisation Vercel privée avant mise en ligne.

---

## 🚀 Démarrage Rapide

Dans le dossier du projet :

```bash
# Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur (ou votre adresse IP locale sur mobile).
