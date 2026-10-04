'use strict';

/*
 * Degrés (C0/Cf) typiques pour un usage maison (infusion/macération à l'alcool
 * neutre puis dilution) — valeurs de départ, à ajuster librement ensuite.
 */
const SPIRIT_PRESETS = {
  eaudevie: { c0: 86, cf: 45 },
  liqueur: { c0: 96, cf: 30 },
};

function applyPreset(key) {
  return SPIRIT_PRESETS[key] || null;
}
