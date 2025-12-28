// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

export class MobileTherapist {
  #therapist;
  #procedures;

  constructor(data) {
    this.#therapist = data.therapist || {};
    this.#procedures = data.procedures || [];
  }

  // Get therapist information
  getTherapist() {
    return this.#therapist;
  }

  // Get all available procedures
  getProcedures() {
    return this.#procedures;
  }

  // Get a specific procedure by ID
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

  // Find procedures by price range
  findProceduresByPrice(minPrice, maxPrice) {
    return this.#procedures.filter(
      p => p.price >= minPrice && p.price <= maxPrice
    );
  }

  // Calculate total service time for a day
  calculateDailyCapacity() {
    const therapist = this.#therapist;
    const clientsPerDay = therapist.capacities?.find(
      c => c.type === "clients_per_day"
    )?.value || 0;
    
    return {
      maxClients: clientsPerDay,
      serviceArea: therapist.location?.serviceArea,
      specialties: therapist.specialties || []
    };
  }

  // Check if therapist is available for a service
  canProvideService(specialty) {
    return this.#therapist.specialties?.includes(specialty) || false;
  }
}
