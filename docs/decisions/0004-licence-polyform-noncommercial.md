---
title: "ADR 0004 — Licence PolyForm Noncommercial 1.0.0"
status: accepted
last-reviewed: 2026-10-04
sources: []
tags: [decision, licence]
---

# ADR 0004 — Licence PolyForm Noncommercial 1.0.0

## Statut
Accepted — 2026-10-04

## Contexte
L'utilisateur veut offrir l'application à la communauté (code téléchargeable et améliorable) tout
en empêchant qu'un tiers la reprenne pour en faire une application commerciale. Le dépôt était
public mais sans fichier `LICENSE` (le README annonçait "MIT", sans texte à l'appui) : sans licence,
la réutilisation du code n'était pas légalement autorisée ; et la MIT, elle, autorise l'usage
commercial.

## Décision
- Licence **PolyForm Noncommercial 1.0.0** (texte officiel, fichier `LICENSE` à la racine, avec la
  ligne `Required Notice: Copyright (c) 2026 gLOrFinD`). Usage, modification et partage libres pour
  tout usage non commercial ; usage commercial interdit sans accord de l'auteur.
- **KaTeX** (MIT, © Khan Academy and other contributors) reste sous sa propre licence : son texte
  est conservé dans `js/katex/LICENSE` et mentionné dans le README.
- Les contributions sont acceptées sous la même licence (précisé dans le README).

## Alternatives écartées
- **MIT / Apache-2.0** : autorisent l'usage commercial, contraire à l'objectif.
- **AGPL-3.0** : vraie licence open source, empêche la reprise dans un produit fermé mais n'interdit
  pas la vente d'une version elle-même ouverte.
- **CC BY-NC-SA 4.0** : même effet non commercial, mais Creative Commons déconseille de l'utiliser
  pour du logiciel.

## Conséquences
- Ce n'est **pas** de l'"open source" au sens de l'OSI (qui interdit toute restriction d'usage) mais
  du **source-available** ; le README le dit explicitement. Le pied de page de l'app affiche
  "100% open source" : formulation à réexaminer.
- Texte juridique non relu par un juriste ; la licence PolyForm est une licence publiée et utilisée
  telle quelle.
