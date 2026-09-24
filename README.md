# Nicolas Pichard 🎬

> 🎮 **Jouer en direct : [https://nicolas-pichard.vercel.app](https://nicolas-pichard.vercel.app)**

Une application web interactive de devinette et de quiz vidéo dédiée aux vidéos cultes du créateur **Cyprien**, proposant 3 modes de jeu complets : **Blindtest Solo**, **Battle Multijoueur en temps réel**, et le tout nouveau mode **« Complète la réplique »**.

---

## 🕹️ Les 3 Modes de Jeu

### 1. 🎯 Blindtest Solo (Inspiré de Heardle & Framed)
Devinez le titre exact de la vidéo de Cyprien à partir de micro-extraits vidéo et sonores à timecode aléatoire :
- **Essai 1** : `0.1s` (micro-flash vidéo et audio de 100 ms)
- **Essai 2** : `+2.0s` (total : `2.1s`)
- **Essai 3** : `+8.0s` (total : `10.1s`)
- **Essai 4** : `+16.0s` (total : `26.1s`)
- **Arrêt sur image & Gel** : À chaque palier, la vidéo se fige automatiquement sur la dernière frame pour offrir un indice visuel permanent.
- **Sélection d'époque** :
  - 🌟 **Toutes les époques** : Catalogue complet (2010 à aujourd'hui).
  - 📼 **Classique ≤ 2016** : L'âge d'or culte (*Le dessin*, *Les réunions*, *Les vieux et la technologie*, *McDonald's*, etc.).
- **Partage de score** : Grille d'emojis prête pour Twitter / Discord (🟩 🟥 ⬜ ⬛).

---

### 2. ⚔️ Battle Multijoueur (Salons en Temps Réel)
Défiez vos amis dans des salons de jeu privés :
- **Création & Rejoindre** : Partage d'un code de salon à 5 lettres ou lien direct d'invitation (`?room=CODE`).
- **Synchronisation en direct** : Les joueurs découvrent le même extrait vidéo au même moment.
- **Système de points dynamique** :
  - Points selon le palier débloqué (1000 pts au 1er essai, 750 au 2e, 500 au 3e, 250 au 4e).
  - **Bonus de vitesse** : Plus vous répondez vite après le début de l'extrait, plus vous marquez de points supplémentaires.
- **Récapitulatif de manche & Podium final** : Classement en direct entre chaque round et couronnement du vainqueur.

---

### 3. 💬 « Complète la réplique » (Quiz Répliques Culte)
Le mode punchlines et scènes mémorables :
- **Mécanique** : La vidéo commence, joue le début de la réplique culte puis se coupe pile avant le mot ou la vanne finale.
- **QCM 4 choix** : Trouvez la punchline exacte parmi des propositions réalistes et contextualisées.
- **Révélation vidéo continue** : Dès que vous répondez, la vidéo continue de jouer la scène entière pour vous faire réentendre la phrase exacte dans son flow naturel.
- **Système de Combo & Flammes** :
  - Enchaînez les bonnes réponses pour monter votre streak.
  - Multiplicateurs de combo : **x1.2** (2 d'affilée), **x1.5** (3 d'affilée), **x2.0** (4+ d'affilée).
- **Formats au choix** : Sessions de **5** ou **10 répliques**.

---

## ⌨️ Raccourcis Clavier Universels

| Touche | Action |
| :--- | :--- |
| <kbd>Espace</kbd> | Lancer / Mettre en pause / Réécouter l'extrait |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Sélectionner directement une proposition dans le mode Répliques |
| <kbd>Entrée</kbd> | Passer à la réplique suivante lors de la révélation |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Naviguer dans les suggestions d'autocomplétion du Blindtest |
| <kbd>Échap</kbd> | Fermer les suggestions ou la fenêtre de règles |

---

## ⚡ Fonctionnalités Clés & Architecture

1. **Lecteur YouTube Dédié & Sécurisé :**
   - Recadrage cinéma précis (1.20x) masquant les overlays YouTube sans déformer l'image.
   - Surveillance d'horloge haute précision via `requestAnimationFrame` + `performance.now()`.
   - Contrôle du volume indépendant avec mémorisation de l'état muet.

2. **Recherche Intelligente & Tolérante :**
   - Moteur de recherche avec normalisation Unicode, racinisation lexicale, tolérance pluriel/singulier et accents.
   - Détection des titres alternatifs et des chiffres implicites (ex : "reunion" → "Les réunions").

3. **Catalogue Vidéos Filtré :**
   - Extraction automatisée via script dédié (`scripts/fetch-videos.mjs`).
   - Exclusion stricte des Shorts (<60s) et podcasts sans support vidéo.
   - Bornage des timecodes pour éviter les intros sponsorisées et génériques de fin.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) 16 (App Router & Turbopack)
- **Langage** : TypeScript 5 (Typage strict, 0 `any`)
- **Bibliothèque UI** : React 19 (Conformité stricte au React Compiler)
- **Styling** : Tailwind CSS v4 & Lucide React
- **Multijoueur** : Architecture synchronisée temps réel Server-Sent Events / Sockets
- **Animations** : Canvas-Confetti

---

## 🌿 Stratégie de Branches

- **`main`** : Branche de **Production publique** déployée sur Vercel.
- **`dev`** : Branche de **Développement / Intégration** pour tester les fonctionnalités avant publication.

---

## 🚀 Démarrage en Local

```bash
# Cloner le dépôt
git clone https://github.com/Fubalt/Nicolas-pichard.git
cd Nicolas-pichard

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.
