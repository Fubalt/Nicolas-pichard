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

1. **Lecteur YouTube IFrame Masqué & Haute Précision :**
   - Écran aveugle avec égaliseur audio animé durant la phase de jeu.
   - Timer précis calculant le temps réel de lecture et stoppant automatiquement dès que le palier de durée débloqué est atteint.
   - Rembobinage automatique au point de départ pour une réécoute instantanée.

2. **Sélection Aléatoire & Timecode Sécurisé :**
   - Pioche aléatoire parmi un catalogue de plus de 25 vidéos emblématiques de Cyprien (`data/cyprien-videos.json`).
   - Génération d'un `startTime` strictement compris entre **5 secondes** et **`(durée_totale - 35 secondes)`** pour éviter les génériques de fin ou les coupures hors vidéo.

3. **Système de Recherche & Autocomplétion :**
   - Champ de recherche avec filtre dynamique insensible à la casse et aux accents.
   - Navigation au clavier (`Flèche Haut`, `Flèche Bas`, `Entrée`, `Échap`).
   - Raccourci clavier universel : Barre d'espace pour lancer / mettre en pause l'écoute de l'extrait audio.

4. **Timeline & Indicateurs Visuels :**
   - Barre de progression dynamique divisée selon les 4 paliers de durée.
   - Remplissage en temps réel au rythme de la lecture sonore.
   - Historique des 4 essais avec statuts (Validé 🟩, Erreur 🟥, Passé ⬜, Restant ⬛).

5. **Interface Moderne & Responsive :**
   - Dark mode natif (zinc-950/amber/orange).
   - Explosion de confettis en cas de victoire.
   - Bouton de partage prêt pour les réseaux sociaux / Discord.
   - Mode partie aléatoire infinie (*"Partie suivante"*).

---

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) 16 (App Router)
- **Langage** : TypeScript 5
- **Design & UI** : Tailwind CSS v4, Lucide React
- **Animations & Effets** : Canvas-Confetti
- **Audio / Vidéo** : API YouTube IFrame officielle

---

## 🚀 Démarrage Rapide

Dans le dossier du projet :

```bash
# Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.
