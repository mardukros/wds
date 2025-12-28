// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal implementation - hidden from user code

import { createLookupService } from "supply-chain-internal:lookup";
import { createActor } from "supply-chain-internal:actors";

export class SupplyChain {
  #actors;
  #relationships;
  #lookup;

  constructor(data) {
    this.#actors = new Map();
    this.#relationships = new Map();
    
    // Initialize actors from data
    if (data.actors) {
      for (const actorData of data.actors) {
        const actor = createActor(actorData);
        this.#actors.set(actor.id, actor);
      }
    }
    
    // Initialize relationships
    if (data.relationships) {
      for (const rel of data.relationships) {
        this.#relationships.set(rel.id, rel);
      }
    }
    
    // Create lookup service
    this.#lookup = createLookupService(this.#actors, this.#relationships);
  }

  // Get an actor by ID
  getActor(id) {
    const actor = this.#actors.get(id);
    if (!actor) {
      throw new Error(`Actor not found: ${id}`);
    }
    return actor;
  }

  // Find actors by type
  findActorsByType(type) {
    return Array.from(this.#actors.values()).filter(actor => actor.type === type);
  }

  // Find a supply chain path between two actors
  findPath(fromId, toId) {
    return this.#lookup.findPath(fromId, toId);
  }

  // Get all relationships for an actor
  getActorRelationships(actorId) {
    return Array.from(this.#relationships.values()).filter(
      rel => rel.fromActorId === actorId || rel.toActorId === actorId
    );
  }

  // Query actors with filters
  queryActors(query) {
    return this.#lookup.queryActors(query);
  }
}
