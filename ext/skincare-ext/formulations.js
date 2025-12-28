// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal formulations module - handles product formulation queries

export function getFormulation(formulationId, formulations) {
  return formulations.find(f => f.id === formulationId);
}

export function findFormulationsByType(type, formulations) {
  return formulations.filter(f => f.type === type);
}

export function findFormulationsBySkinType(skinType, formulations) {
  return formulations.filter(f => 
    f.skinTypes.includes('all') || f.skinTypes.includes(skinType)
  );
}

export function calculateFormulationCost(formulation) {
  // Base price already includes cost calculation
  return formulation.basePrice;
}

export function getFormulationIngredients(formulationId, formulations) {
  const formulation = getFormulation(formulationId, formulations);
  return formulation ? formulation.ingredients : [];
}
