---
title: "ADR 0005 — Systèmes d'unités : métrique et US"
status: accepted
last-reviewed: 2026-10-04
sources: []
tags: [decision, unites]
---

# ADR 0005 — Systèmes d'unités : métrique et US

## Statut
Accepted — 2026-10-04

## Contexte
L'utilisateur veut pouvoir saisir et lire les valeurs en unités américaines. La question d'ajouter
aussi les unités impériales britanniques a été posée et écartée (voir Décision).

## Décision
- **Deux systèmes seulement : métrique et US.** Les unités impériales britanniques (fl oz de
  28,41 mL, gallon de 4,55 L) sont écartées : peu de demande (le Royaume-Uni dose ses alcools en
  mL/cl) et risque d'erreur de dose de ~4 % si l'utilisateur choisit le mauvais système.
- **Le calcul, l'historique et la sauvegarde restent toujours en métrique** (L, g, g/L, mL/g). Le
  système US ne change que la saisie et l'affichage, via `js/units.js` (table de facteurs par
  champ) : ajouter un système plus tard = une entrée de table + des libellés.
- Unités US : volumes en **fl oz** (saisie et résultats, gal en secondaire), masses en **oz**
  (lb en secondaire), sucre visé en **oz/gal**, coefficient k en **fl oz/oz**. La formule détaillée
  utilise un système cohérent gal / oz / oz·gal⁻¹ / gal·oz⁻¹. 1 gal US = 3,785411784 L = 128 fl oz.
- **Pas de dérive d'arrondi** : le formulaire affiche des valeurs arrondies, mais la valeur
  métrique exacte d'origine est conservée (`exactValues`) tant que le champ n'est pas modifié par
  l'utilisateur, donc basculer metric ↔ US n'altère pas les résultats.
- Le choix est mémorisé (`alcoocalc_units`), défaut métrique. Libellé du toggle : « Métrique / US ».

## Conséquences
- L'« imperial » du vocabulaire de départ désigne ici le système US (gallon US), pas le britannique.
- Chaque nouveau champ numérique doit déclarer son entrée dans `FIELD_SPECS` (min/max/step/décimales
  + conversions) s'il porte une unité.
