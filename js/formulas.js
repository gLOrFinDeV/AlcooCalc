'use strict';

/*
 * Modèle physique (spécifié dans le cahier des charges — voir
 * docs/decisions/0002-formule-dilution-sucre.md) :
 *
 *   1) Conservation de l'alcool pur lors de la dilution à l'eau :
 *        V0 * C0 = Vf * Cf   =>   Vf = (V0 * C0) / Cf
 *   2) Le sucre est ajouté pour atteindre une concentration cible dans le volume final :
 *        ms = S_conc * Vf
 *   3) Dissoudre du sucre augmente légèrement le volume (coefficient k, L par gramme) :
 *        deltaV_sucre = k * ms
 *   4) L'eau à ajouter comble le reste du volume final :
 *        Ve = Vf - V0 - deltaV_sucre
 *
 * Si Ve < 0, la combinaison demandée est physiquement impossible (trop de sucre pour
 * l'écart de dilution choisi) : on renvoie feasible=false plutôt qu'un résultat négatif.
 */

function calculateDilution(V0, C0, Cf, S_conc, k) {
  const errors = [];

  if (![V0, C0, Cf, S_conc, k].every((v) => Number.isFinite(v))) {
    errors.push('errorPositive');
    return { feasible: false, errors };
  }
  if (V0 <= 0 || C0 <= 0 || Cf <= 0 || S_conc < 0 || k < 0) {
    errors.push('errorPositive');
  }
  if (Cf >= C0) {
    errors.push('errorCfGteC0');
  }
  if (errors.length) {
    return { feasible: false, errors };
  }

  const Vf = (V0 * C0) / Cf;
  const ms = S_conc * Vf;
  const expansion = k * ms;
  const Ve = Vf - V0 - expansion;

  if (Ve < 0) {
    return { feasible: false, errors: ['errorNegativeWater'], Vf, ms, expansion, Ve };
  }

  return { feasible: true, errors: [], Vf, ms, expansion, Ve };
}


// Unités affichées dans la formule détaillée : volumes en L ou gal, masses en g ou oz,
// S en g/L ou oz/gal, k en L/g ou gal/oz (système cohérent, les calculs restent identiques).
function formulaUnits(system) {
  if (system === 'us') {
    return {
      vol: (liters) => liters / L_PER_GAL,
      volUnit: 'gal',
      volDec: 4,
      mass: (grams) => grams / G_PER_OZ,
      massUnit: 'oz',
      massDec: 2,
      conc: (gPerL) => (gPerL * L_PER_GAL) / G_PER_OZ,
      concDec: 2,
      coef: (lPerG) => (lPerG * G_PER_OZ) / L_PER_GAL,
      small: (liters) => `${((liters / L_PER_GAL) * FLOZ_PER_GAL).toFixed(1)}\\ \\text{fl oz}`,
    };
  }
  return {
    vol: (liters) => liters,
    volUnit: 'L',
    volDec: 3,
    mass: (grams) => grams,
    massUnit: 'g',
    massDec: 1,
    conc: (gPerL) => gPerL,
    concDec: 1,
    coef: (lPerG) => lPerG,
    small: (liters) => `${(liters * 1000).toFixed(1)}\\ \\text{mL}`,
  };
}

function generateFormulaSteps(V0, C0, Cf, S_conc, k, results, system) {
  const u = formulaUnits(system);
  const fmt = (n, d = 3) => Number(n).toFixed(d);
  const vol = (liters) => fmt(u.vol(liters), u.volDec);
  const mass = (grams) => fmt(u.mass(grams), u.massDec);
  const unitV = `\\ \\text{${u.volUnit}}`;
  const dV = '\\Delta V_s';
  const step1 = {
    tex: 'V_1 = \\dfrac{V_0 \\cdot C_0}{C_1}',
    substituted: `V_1 = \\dfrac{${vol(V0)} \\times ${fmt(C0, 1)}}{${fmt(Cf, 1)}} = ${vol(results.Vf)}${unitV}`,
  };
  if (!(S_conc > 0)) {
    return [
      step1,
      {
        tex: 'V_e = V_1 - V_0',
        substituted: `V_e = ${vol(results.Vf)} - ${vol(V0)} = ${vol(results.Ve)}${unitV}`,
      },
    ];
  }
  return [
    step1,
    {
      tex: 'm_s = S \\cdot V_1',
      substituted: `m_s = ${fmt(u.conc(S_conc), u.concDec)} \\times ${vol(results.Vf)} = ${mass(results.ms)}\\ \\text{${u.massUnit}}`,
    },
    {
      tex: `${dV} = k \\cdot m_s`,
      substituted: `${dV} = ${fmt(u.coef(k), 5)} \\times ${mass(results.ms)} = ${vol(results.expansion)}${unitV} = ${u.small(results.expansion)}`,
    },
    {
      tex: `V_e = V_1 - V_0 - ${dV}`,
      substituted: `V_e = ${vol(results.Vf)} - ${vol(V0)} - ${vol(results.expansion)} = ${vol(results.Ve)}${unitV}`,
    },
  ];
}

function renderFormula(containerEl, stepsContainerEl, V0, C0, Cf, S_conc, k, results, system) {
  if (typeof katex === 'undefined') return;

  const dV = '\\Delta V_s';
  const mainFormula = S_conc > 0
    ? `\\begin{aligned} V_1 &= \\dfrac{V_0 \\cdot C_0}{C_1} \\\\ m_s &= S \\cdot V_1 \\\\ ${dV} &= k \\cdot m_s \\\\ V_e &= V_1 - V_0 - ${dV} \\end{aligned}`
    : '\\begin{aligned} V_1 &= \\dfrac{V_0 \\cdot C_0}{C_1} \\\\ V_e &= V_1 - V_0 \\end{aligned}';

  katex.render(mainFormula, containerEl, { throwOnError: false, displayMode: true });

  stepsContainerEl.innerHTML = '';
  if (!results.feasible && !Number.isFinite(results.Vf)) return;

  const steps = generateFormulaSteps(V0, C0, Cf, S_conc, k, results, system);
  steps.forEach((step, i) => {
    const line = document.createElement('div');
    line.className = 'formula-step';
    const num = document.createElement('span');
    num.className = 'formula-step__num';
    num.textContent = `${i + 1}.`;
    const math = document.createElement('span');
    math.className = 'formula-step__math';
    katex.render(step.substituted, math, { throwOnError: false, displayMode: false });
    line.appendChild(num);
    line.appendChild(math);
    stepsContainerEl.appendChild(line);
  });
}
