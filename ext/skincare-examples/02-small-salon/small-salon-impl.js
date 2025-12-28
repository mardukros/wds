// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

export class SmallSalon {
  #salon;
  #formulations;
  #procedures;

  constructor(data) {
    this.#salon = data.salon || {};
    this.#formulations = data.formulations || [];
    this.#procedures = data.procedures || [];
  }

  // Get salon information
  getSalon() {
    return this.#salon;
  }

  // Get all formulations
  getFormulations() {
    return this.#formulations;
  }

  // Get a specific formulation
  getFormulation(formulationId) {
    const formulation = this.#formulations.find(f => f.id === formulationId);
    if (!formulation) {
      throw new Error(`Formulation not found: ${formulationId}`);
    }
    return formulation;
  }

  // Find formulations by skin type
  findFormulationsBySkinType(skinType) {
    return this.#formulations.filter(f => 
      f.suitableFor.includes(skinType) || f.suitableFor.includes("all")
    );
  }

  // Find formulations by type
  findFormulationsByType(type) {
    return this.#formulations.filter(f => f.type === type);
  }

  // Get all procedures
  getProcedures() {
    return this.#procedures;
  }

  // Get a specific procedure
  getProcedure(procedureId) {
    const proc = this.#procedures.find(p => p.id === procedureId);
    if (!proc) {
      throw new Error(`Procedure not found: ${procedureId}`);
    }
    return proc;
  }

  // Find procedures by duration
  findProceduresByDuration(minDuration, maxDuration) {
    return this.#procedures.filter(
      p => p.duration >= minDuration && p.duration <= maxDuration
    );
  }

  // Find procedures by skin type
  findProceduresBySkinType(skinType) {
    return this.#procedures.filter(p => 
      p.suitableFor.includes(skinType) || p.suitableFor.includes("all")
    );
  }

  // Calculate procedure cost including products
  calculateProcedureCost(procedureId) {
    const procedure = this.getProcedure(procedureId);
    let productCost = 0;

    if (procedure.products && procedure.products.length > 0) {
      for (const productId of procedure.products) {
        const formulation = this.#formulations.find(f => f.id === productId);
        if (formulation) {
          productCost += formulation.cost;
        }
      }
    }

    return {
      procedureId: procedure.id,
      name: procedure.name,
      basePrice: procedure.basePrice,
      productCost: productCost,
      totalCost: procedure.basePrice + productCost,
      duration: procedure.duration
    };
  }

  // Get salon capacity info
  getCapacity() {
    return {
      treatmentRooms: this.#salon.capacities?.find(c => c.type === "treatment_rooms")?.value || 0,
      staff: this.#salon.capacities?.find(c => c.type === "staff")?.value || 0,
      clientsPerDay: this.#salon.capacities?.find(c => c.type === "clients_per_day")?.value || 0,
      specialties: this.#salon.specialties || []
    };
  }

  // Get available equipment
  getEquipment() {
    return this.#salon.equipment || [];
  }
}
