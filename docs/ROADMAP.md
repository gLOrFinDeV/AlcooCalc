---
title: Roadmap du projet
status: actif
last-reviewed: 2026-09-07
sources: []
tags: [roadmap]
---

# Roadmap — AlcooCalc (calculateur de dilution alcool + sucre)

## ✅ Fait
- Dossier de projet créé, dépôt git local initialisé, relié à `RobJBee/AlcooCalc` (privé) et premier
  commit poussé.
- Mémoire de projet mise en place (AGENTS.md, JOURNAL/ROADMAP/DECISIONS + ADR 0001 et 0002).
- Cahier des charges complet reçu et implémenté : calculateur de dilution alcool + sucre (conservation
  de l'alcool pur, sucre cible, expansion volumique du sucre), 11 presets d'alcools, formule détaillée
  avec rendu KaTeX et étapes substituées, historique des 10 derniers calculs, copier dans le
  presse-papiers, i18n FR/EN persistant, thème "terminal mainframe" responsive (320px→1920px), PWA
  (manifest + service worker, KaTeX vendored en local pour un usage 100% hors-ligne).
- Testé dans le navigateur (via un petit serveur local `scripts/serve.ps1`) : calculs conformes à
  l'exemple de référence du cahier des charges, presets, validation, i18n, historique, reset et
  responsive mobile tous fonctionnels.
- Déployé sur GitHub Pages : **https://glorfindev.github.io/AlcooCalc/** (dépôt rendu public par
  l'utilisateur, puis transféré du compte `RobJBee` vers `gLOrFinDeV` le 2026-09-10 — voir ADR
  [0003](decisions/0003-deploiement-github-pages.md)). Service worker vérifié fonctionnel en HTTPS
  réel.
- Mise en page desktop (≥1024px) revue : grille 2×2 explicite (Paramètres/Résultats en haut,
  Alcool de base/Historique en bas, alignés), flèches natives des champs numériques supprimées.
- Nouveau paramètre **Volume final** : champ optionnel (slider + nombre, même style que les autres
  paramètres) dans "Paramètres" qui, une fois renseigné, remplace V₀ dans le calcul (V₀ requis =
  Vf × Cf / C0) ; le champ V₀ devient alors lecture seule (grisé) et affiche la valeur calculée,
  redevient éditable dès que le champ est vidé.

## 🔜 À faire
- Test visuel sur un téléphone réel (au-delà de l'émulation mobile du navigateur) — le site étant
  maintenant en ligne, l'utilisateur peut le faire directement.

## 💬 À trancher
- Portée exacte de l'historique en localStorage (actuellement : 10 derniers calculs, sans limite de
  durée) — suffisant ou faut-il purger après un certain temps ?
- Faut-il des icônes PWA soignées (actuellement des placeholders générés "AC" sur fond noir/vert) ?

## 🚧 v2 — En cours (branche `v2`)
- Développement v2 fait sur la branche git `v2` (créée le 2026-09-13), pour ne pas déployer de
  travail en cours sur `main`/GitHub Pages. Merge dans `main` prévu une fois les fonctionnalités
  ci-dessous testées et prêtes.
- ✅ **Vert principal assombri** : `--terminal-green` passe de `#00FF41` à `#00CC52` (vert plus
  sombre que l'original mais avec plus de contraste que `#00993D`, testé puis ajusté en navigateur
  suite au retour de l'utilisateur).
- ✅ **Résumé collant sur mobile** : bandeau fixe en bas d'écran (< 768px uniquement, masqué en
  paysage sur petite hauteur) affichant Eau/Sucre en continu ; clic dessus → scroll fluide jusqu'à
  la section Résultats complète. Voir [`css/styles.css`](../css/styles.css) et
  [`js/app.js`](../js/app.js).
- ✅ **Historique cliquable** : cliquer sur une entrée recharge tous ses paramètres (V₀/V₁, C₀, C₁,
  sucre, k) dans les champs ; bouton "×" dédié pour supprimer une entrée individuellement, en plus
  d'"Effacer l'historique" pour tout vider. Voir [`js/app.js`](../js/app.js).

## 🔮 v2 — Pistes UX (validées par l'utilisateur le 2026-09-07)
- ✅ **Résultat "collant" sur mobile** : implémenté, voir "v2 — En cours" ci-dessus.
- ✅ **Historique cliquable** : implémenté, voir "v2 — En cours" ci-dessus.
- **Aide contextuelle (?)** : petites infobulles expliquant les champs moins évidents ("Sucre visé",
  "Coefficient d'expansion").
- **Accessibilité + erreurs visibles** : `aria-live` pour que les lecteurs d'écran annoncent le
  résultat après un changement ; surligner en rouge le champ fautif (ex. "Alcool cible") en cas
  d'erreur, en plus du message déjà affiché.
- ✅ **Splash screen au lancement** : implémenté — pluie Matrix (canvas) ~3s, ralentissement puis
  fondu vers l'interface, clic pour passer, sauté si `prefers-reduced-motion`. Voir
  [`js/splash.js`](../js/splash.js).
