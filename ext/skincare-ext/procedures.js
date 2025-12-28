// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal procedures module - handles procedure queries and management

export function getProcedure(procedureId, procedures) {
  return procedures.find(p => p.id === procedureId);
}

export function findProceduresBySalon(salonId, procedures) {
  return procedures.filter(p => p.salonId === salonId);
}

export function findProceduresBySkinType(skinType, procedures) {
  return procedures.filter(p => 
    p.skinTypes.includes('all') || p.skinTypes.includes(skinType)
  );
}

export function getProcedureDuration(procedure) {
  return procedure.totalDuration;
}

export function getProcedureSteps(procedure) {
  return procedure.steps.sort((a, b) => a.order - b.order);
}

export function findProceduresByDuration(minDuration, maxDuration, procedures) {
  return procedures.filter(p => 
    p.totalDuration >= minDuration && 
    (!maxDuration || p.totalDuration <= maxDuration)
  );
}
