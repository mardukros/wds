// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

export class Mediclinic {
  #clinic;
  #formulations;
  #procedures;

  constructor(data) {
    this.#clinic = data.clinic || {};
    this.#formulations = data.formulations || [];
    this.#procedures = data.procedures || [];
  }

  // Get clinic information
  getClinic() {
    return this.#clinic;
  }

  // Get clinic capacity and staff info
  getCapacity() {
    const capacities = {};
    if (this.#clinic.capacities) {
      for (const cap of this.#clinic.capacities) {
        capacities[cap.type] = { value: cap.value, unit: cap.unit };
      }
    }
    return {
      ...capacities,
      specialties: this.#clinic.specialties || [],
      certifications: this.#clinic.certifications || []
    };
  }

  // Get medical equipment
  getEquipment() {
    return this.#clinic.equipment || [];
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

  // Find prescription-strength formulations
  getPrescriptionFormulations() {
    return this.#formulations.filter(f => f.prescriptionRequired === true);
  }

  // Find over-the-counter formulations
  getOTCFormulations() {
    return this.#formulations.filter(f => f.prescriptionRequired === false);
  }

  // Find formulations by skin concern
  findFormulationsByConcern(concern) {
    return this.#formulations.filter(f => 
      f.suitableFor.includes(concern) || f.suitableFor.includes("all")
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

  // Find procedures by category
  findProceduresByCategory(category) {
    return this.#procedures.filter(p => p.category === category);
  }

  // Find procedures requiring consultation
  getConsultationRequiredProcedures() {
    return this.#procedures.filter(p => p.requiresConsultation === true);
  }

  // Find procedures by downtime
  findProceduresByDowntime(maxDowntime) {
    return this.#procedures.filter(p => {
      if (!p.downtime || p.downtime === "none" || p.downtime === "minimal") {
        return true;
      }
      // Parse downtime like "7-10 days" or "2-3 days"
      const match = p.downtime.match(/(\d+)/);
      if (match) {
        const days = parseInt(match[1]);
        return days <= maxDowntime;
      }
      return false;
    });
  }

  // Find procedures by price range
  findProceduresByPrice(minPrice, maxPrice) {
    return this.#procedures.filter(
      p => p.basePrice >= minPrice && p.basePrice <= maxPrice
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
      category: procedure.category,
      basePrice: procedure.basePrice,
      productCost: productCost,
      totalCost: procedure.basePrice + productCost,
      duration: procedure.duration,
      downtime: procedure.downtime,
      requiresConsultation: procedure.requiresConsultation,
      requiresMedicalClearance: procedure.requiresMedicalClearance
    };
  }

  // Get procedures by provider type
  findProceduresByProvider(providerType) {
    return this.#procedures.filter(p => 
      p.steps.some(step => step.provider === providerType)
    );
  }

  // Check if clinic has specialty
  hasSpecialty(specialty) {
    return this.#clinic.specialties?.includes(specialty) || false;
  }

  // Get all available specialties
  getSpecialties() {
    return this.#clinic.specialties || [];
  }

  // Get certifications
  getCertifications() {
    return this.#clinic.certifications || [];
  }
}
