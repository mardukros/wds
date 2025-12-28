// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

import { createActorMap, getActorsByType, getActorsBySubtype, findActorsByName } from "supply-chain-internal:actors";
import { createLookupService } from "supply-chain-internal:lookup";

export class SkincareSupplyChain {
  #actors;
  #relationships;
  #actorMap;
  #lookup;

  constructor(data) {
    this.#actors = data.actors || [];
    this.#relationships = data.relationships || {};
    this.#actorMap = createActorMap(this.#actors);
    this.#lookup = createLookupService(this.#actors, this.#relationships);
  }

  // Get a specific actor by ID
  getActor(actorId) {
    const actor = this.#actorMap.get(actorId);
    if (!actor) {
      throw new Error(`Actor not found: ${actorId}`);
    }
    return actor;
  }

  // Get all actors
  getAllActors() {
    return this.#actors;
  }

  // Get actors by type
  getActorsByType(type) {
    return getActorsByType(this.#actors, type);
  }

  // Get actors by subtype
  getActorsBySubtype(subtype) {
    return getActorsBySubtype(this.#actors, subtype);
  }

  // Find actors by name
  findActorsByName(nameFragment) {
    return findActorsByName(this.#actors, nameFragment);
  }

  // Query actors with filters
  queryActors(filters) {
    return this.#lookup.queryActors(filters);
  }

  // Find path between two actors
  findPath(fromId, toId) {
    const path = this.#lookup.findPath(fromId, toId);
    if (!path) {
      return null;
    }
    return path.map(id => this.#actorMap.get(id));
  }

  // Get all possible paths
  getAllPaths(fromId, toId) {
    const paths = this.#lookup.getAllPaths(fromId, toId);
    return paths.map(path => 
      path.map(id => this.#actorMap.get(id))
    );
  }

  // Get direct relationships
  getDirectSuppliers(producerId) {
    return this.#lookup.getDirectSuppliers(producerId);
  }

  getDirectProducers(supplierId) {
    return this.#lookup.getDirectProducers(supplierId);
  }

  getDirectDistributors(producerId) {
    return this.#lookup.getDirectDistributors(producerId);
  }

  getDirectSalons(distributorId) {
    return this.#lookup.getDirectSalons(distributorId);
  }

  // Get complete supply chain for a salon
  getSupplyChainForSalon(salonId) {
    return this.#lookup.getSupplyChainForSalon(salonId);
  }

  // Get network statistics
  getNetworkStatistics() {
    return this.#lookup.getNetworkStatistics();
  }

  // Get product flows
  getProductFlows() {
    return this.#relationships.productFlows || {};
  }

  // Find actors by product
  findActorsByProduct(product) {
    return this.#actors.filter(a => 
      a.products?.includes(product) || 
      a.productTypes?.includes(product)
    );
  }

  // Get cooperative information
  getCooperatives() {
    return this.#relationships.cooperativeRelationships || {};
  }

  // Find actors in a cooperative
  getCooperativeMembers(cooperativeId) {
    const coop = this.#relationships.cooperativeRelationships?.[cooperativeId];
    if (!coop) {
      return [];
    }
    return coop.members.map(id => this.#actorMap.get(id)).filter(Boolean);
  }

  // Calculate network depth (longest path)
  calculateNetworkDepth() {
    const suppliers = this.getActorsByType("supplier");
    const salons = this.getActorsByType("salon");
    
    let maxDepth = 0;
    for (const supplier of suppliers) {
      for (const salon of salons) {
        const path = this.findPath(supplier.id, salon.id);
        if (path) {
          maxDepth = Math.max(maxDepth, path.length - 1);
        }
      }
    }
    return maxDepth;
  }

  // Get all actors connected to a specific actor
  getConnectedActors(actorId) {
    const connected = new Set();
    const actor = this.getActor(actorId);
    
    if (actor.type === "supplier") {
      const producers = this.getDirectProducers(actorId);
      producers.forEach(p => connected.add(p));
    } else if (actor.type === "producer") {
      const suppliers = this.getDirectSuppliers(actorId);
      const distributors = this.getDirectDistributors(actorId);
      suppliers.forEach(s => connected.add(s));
      distributors.forEach(d => connected.add(d));
    } else if (actor.type === "distributor") {
      const salons = this.getDirectSalons(actorId);
      salons.forEach(s => connected.add(s));
    }
    
    return Array.from(connected);
  }
}
