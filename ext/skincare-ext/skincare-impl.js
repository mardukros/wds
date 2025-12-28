// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

import { createSalonActor, getSalonProcedures, calculateProcedureCost } from "skincare-brand-internal:salon";
import { 
  getFormulation, 
  findFormulationsByType, 
  findFormulationsBySkinType 
} from "skincare-brand-internal:formulations";
import { 
  getProcedure, 
  findProceduresBySalon, 
  findProceduresBySkinType,
  findProceduresByDuration 
} from "skincare-brand-internal:procedures";

export class SkincareBrand {
  #salons;
  #formulations;
  #procedures;

  constructor(data) {
    this.#salons = new Map();
    this.#formulations = data.formulations || [];
    this.#procedures = data.procedures || [];
    
    // Initialize salons from data
    if (data.salons) {
      for (const salonData of data.salons) {
        const salon = createSalonActor(salonData);
        this.#salons.set(salon.id, salon);
      }
    }
  }

  // Get a salon by ID
  getSalon(id) {
    const salon = this.#salons.get(id);
    if (!salon) {
      throw new Error(`Salon not found: ${id}`);
    }
    return salon;
  }

  // Get all salons
  getAllSalons() {
    return Array.from(this.#salons.values()).filter(s => s.type === 'salon');
  }

  // Get production plants
  getProductionPlants() {
    return Array.from(this.#salons.values()).filter(s => s.type === 'production_plant');
  }

  // Find salons by specialty
  findSalonsBySpecialty(specialty) {
    return Array.from(this.#salons.values()).filter(
      salon => salon.type === 'salon' && salon.specialties.includes(specialty)
    );
  }

  // Get procedures for a salon
  getSalonProcedures(salonId) {
    return findProceduresBySalon(salonId, this.#procedures);
  }

  // Get a specific procedure
  getProcedure(procedureId) {
    const proc = getProcedure(procedureId, this.#procedures);
    if (!proc) {
      throw new Error(`Procedure not found: ${procedureId}`);
    }
    return proc;
  }

  // Find procedures by skin type
  findProceduresBySkinType(skinType) {
    return findProceduresBySkinType(skinType, this.#procedures);
  }

  // Find procedures by duration
  findProceduresByDuration(minDuration, maxDuration) {
    return findProceduresByDuration(minDuration, maxDuration, this.#procedures);
  }

  // Calculate procedure cost
  calculateProcedureCost(procedureId) {
    const procedure = this.getProcedure(procedureId);
    return calculateProcedureCost(procedure, this.#formulations);
  }

  // Get a formulation by ID
  getFormulation(formulationId) {
    const formulation = getFormulation(formulationId, this.#formulations);
    if (!formulation) {
      throw new Error(`Formulation not found: ${formulationId}`);
    }
    return formulation;
  }

  // Get all formulations
  getAllFormulations() {
    return this.#formulations;
  }

  // Find formulations by type
  findFormulationsByType(type) {
    return findFormulationsByType(type, this.#formulations);
  }

  // Find formulations by skin type
  findFormulationsBySkinType(skinType) {
    return findFormulationsBySkinType(skinType, this.#formulations);
  }

  // Query salons with filters
  querySalons(query) {
    let results = Array.from(this.#salons.values()).filter(s => s.type === 'salon');

    if (query.specialty) {
      results = results.filter(salon => 
        salon.specialties.includes(query.specialty)
      );
    }

    if (query.city) {
      results = results.filter(salon => 
        salon.location.city === query.city
      );
    }

    if (query.cooperativeId) {
      results = results.filter(salon =>
        salon.cooperativeMemberships.some(
          m => m.cooperativeId === query.cooperativeId
        )
      );
    }

    return results;
  }
}
