// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

import { createLookupService } from "franchise-internal:lookup";

export class Franchise {
  #locations;
  #formulations;
  #procedures;
  #relationships;
  #lookup;

  constructor(data) {
    this.#locations = data.locations || [];
    this.#formulations = data.formulations || [];
    this.#procedures = data.procedures || [];
    this.#relationships = data.relationships || {};
    this.#lookup = createLookupService(this.#locations, this.#relationships);
  }

  // Get a specific location
  getLocation(locationId) {
    const location = this.#locations.find(l => l.id === locationId);
    if (!location) {
      throw new Error(`Location not found: ${locationId}`);
    }
    return location;
  }

  // Get all franchise locations
  getAllLocations() {
    return this.#lookup.getAllStores();
  }

  // Get headquarters
  getHeadquarters() {
    return this.#lookup.getHeadquarters();
  }

  // Find locations by city
  findLocationsByCity(city) {
    return this.#lookup.findByCity(city);
  }

  // Find locations by franchise level
  findLocationsByLevel(level) {
    return this.#lookup.findByLevel(level);
  }

  // Find locations by specialty
  findLocationsBySpecialty(specialty) {
    return this.#lookup.findBySpecialty(specialty);
  }

  // Get nearby locations
  getNearbyLocations(locationId) {
    return this.#lookup.findNearbyLocations(locationId);
  }

  // Get referral network
  getReferralNetwork(locationId) {
    return this.#lookup.getReferralNetwork(locationId);
  }

  // Get franchise statistics
  getStatistics() {
    return this.#lookup.getStatistics();
  }

  // Get total franchise capacity
  getTotalCapacity() {
    return this.#lookup.getTotalCapacity();
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

  // Get franchise standard procedures
  getStandardProcedures() {
    return this.#procedures.filter(p => p.franchiseStandard === true);
  }

  // Get procedures available at a location
  getProceduresAtLocation(locationId) {
    return this.#procedures.filter(p => p.availableAt?.includes(locationId));
  }

  // Find procedures available at multiple locations
  findCommonProcedures(locationIds) {
    return this.#procedures.filter(p => 
      locationIds.every(locId => p.availableAt?.includes(locId))
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
      duration: procedure.duration,
      availableAt: procedure.availableAt,
      franchiseStandard: procedure.franchiseStandard
    };
  }

  // Get location capacity
  getLocationCapacity(locationId) {
    const location = this.getLocation(locationId);
    const capacities = {};
    if (location.capacities) {
      for (const cap of location.capacities) {
        capacities[cap.type] = { value: cap.value, unit: cap.unit };
      }
    }
    return {
      locationId: location.id,
      name: location.name,
      ...capacities,
      specialties: location.specialties || []
    };
  }

  // Query locations with filters
  queryLocations(filters) {
    let results = this.getAllLocations();

    if (filters.city) {
      results = results.filter(l => l.location?.city === filters.city);
    }

    if (filters.level) {
      results = results.filter(l => l.franchiseLevel === filters.level);
    }

    if (filters.specialty) {
      results = results.filter(l => l.specialties?.includes(filters.specialty));
    }

    if (filters.minCapacity) {
      results = results.filter(l => {
        const capacity = l.capacities?.find(c => c.type === "clients_per_day");
        return capacity && capacity.value >= parseInt(filters.minCapacity);
      });
    }

    return results;
  }
}
