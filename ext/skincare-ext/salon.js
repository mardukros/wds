// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal salon module - handles salon and plant actor creation

export function createSalonActor(data) {
  // Validate required fields
  if (!data.id || !data.name || !data.type) {
    throw new Error('Salon actor must have id, name, and type');
  }

  // Create base actor
  const actor = {
    id: data.id,
    name: data.name,
    type: data.type,
    location: data.location || {},
    capacities: data.capacities || [],
    cooperativeMemberships: data.cooperativeMemberships || [],
  };

  // Add type-specific properties
  if (data.type === 'salon') {
    actor.specialties = data.specialties || [];
    actor.operatingHours = data.operatingHours || {};
    actor.certifications = data.certifications || [];
  } else if (data.type === 'production_plant') {
    actor.productionCapability = data.productionCapability || [];
    actor.certifications = data.certifications || [];
  }

  return actor;
}

// Get available procedures for a salon
export function getSalonProcedures(salonId, procedures) {
  return procedures.filter(proc => proc.salonId === salonId);
}

// Calculate procedure cost
export function calculateProcedureCost(procedure, formulations) {
  let totalCost = procedure.basePrice || 0;
  
  // Add cost of products used in the procedure
  for (const step of procedure.steps) {
    for (const formulationId of step.products || []) {
      const formulation = formulations.find(f => f.id === formulationId);
      if (formulation) {
        totalCost += formulation.basePrice * 0.1; // 10% of product price per use
      }
    }
  }
  
  return totalCost;
}
