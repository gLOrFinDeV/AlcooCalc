---
title: Roadmap du projet
status: actif
last-reviewed: 2026-10-04
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

## 💬 À trancher
- Faut-il des icônes PWA soignées (actuellement des placeholders générés "AC" sur fond noir/vert) ?

## ✅ v2 — Livrée (mergée dans `main` le 2026-10-04)
- Développée sur la branche `v2` (créée le 2026-09-13) pour ne pas déployer de travail en cours sur
  `main`/GitHub Pages, puis mergée.
- ✅ **Vert principal assombri** : `--terminal-green` passe de `#00FF41` à `#00CC52` (plus de
  contraste que `#00993D`, testé puis ajusté suite au retour de l'utilisateur).
- ✅ **Résumé collant sur mobile** : bandeau en bas d'écran (< 768px) affichant Eau/Sucre en
  continu ; clic → scroll fluide jusqu'aux Résultats.
- ✅ **Historique** : cliquable (recharge tous les paramètres), suppression par entrée, **favoris**
  (étoile + filtre), **nom de recette** (nommer une entrée en fait un favori), favoris conservés
  sans limite (l'historique courant reste plafonné à 10 entrées), ascenseur aux couleurs du thème.
- ✅ **Volume cible (V₁)** optionnel, notation harmonisée (V₁, C₁, S, ΔVₛ) avec symboles dans les
  libellés de Résultats, valeurs affichées en L (mL) / kg (g).
- ✅ **Toggle Eau-de-vie / Liqueur** à la place du menu des presets ; Eau-de-vie = dilution simple,
  sans sucre (champs, résultats, formule et copie adaptés).
- ✅ **Aide contextuelle (?)** au clic/tap sur Alcool de base, V₁, S et k.
- ✅ **Accessibilité** : annonce des résultats aux lecteurs d'écran (`aria-live`), champ fautif
  surligné en rouge (`aria-invalid`), curseurs nommés, focus visible, contrastes des bordures
  (4,9:1), cibles tactiles de 44 px, lien d'évitement, `aria-pressed` FR/EN, `prefers-reduced-motion`.
- ✅ **Splash screen au lancement** : pluie Matrix (canvas) ~3s, clic pour passer, sauté si
  `prefers-reduced-motion`.
- ✅ **Licence et partage** : PolyForm Noncommercial 1.0.0 (ADR
  [0004](decisions/0004-licence-polyform-noncommercial.md)), README (licence, KaTeX, contribution,
  auteur), pied de page « code source ouvert ».

## ✅ v2.1 — Livrée (mergée dans `main` le 2026-10-04)
- ✅ Carte **Réglages** en haut de l'app : **Langue** (FR/EN, en premier), **Unités**
  (Métrique/US) et **Dilution** (Eau-de-vie/Liqueur) ; section extensible **Conversions** (table de
  référence gal/L, fl oz/mL, lb/kg, oz/g, oz/gal, proof US). FR/EN quitte l'en-tête.
- ✅ **Unités US** (ADR [0005](decisions/0005-unites-metrique-us.md)) : volumes en fl oz (gal), masses
  en oz (lb), sucre en oz/gal, k en fl oz/oz ; formule détaillée en gal/oz ; historique, résumé
  collant, texte copié et textes d'aide suivent le système choisi. Calcul interne et sauvegarde
  restent en métrique (vérifié contre un calcul indépendant) ; choix mémorisé. Unités impériales
  britanniques écartées.
- ✅ **Valeurs par défaut de première ouverture** : EN, Metric, Liqueur, 1 L (24 fl oz en US),
  96 % → 30 %, sucre 200 g/L (30 oz/gal en US) ; preset Liqueur à 96 → 30 %.
- ✅ **Splash screen** recalé sur la nouvelle interface (caractères figés = UI finale en anglais).
- ✅ Pied de page « v2.1 code source ouvert / source code available ».

## 🔜 À faire
- Test visuel sur un téléphone réel (au-delà de l'émulation du navigateur).
- Mise à jour du service worker : prévenir l'utilisateur (« Nouvelle version disponible ») au lieu de
  demander un double rafraîchissement.
