// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal lookup module - provides query and path-finding capabilities

export function createLookupService(actors, relationships) {
  return {
    queryActors(query) {
      let results = Array.from(actors.values());

      // Filter by type
      if (query.type) {
        results = results.filter(actor => actor.type === query.type);
      }

      // Filter by name (partial match)
      if (query.name) {
        const lowerName = query.name.toLowerCase();
        results = results.filter(actor => 
          actor.name.toLowerCase().includes(lowerName)
        );
      }

      // Filter by cooperative membership
      if (query.cooperativeId) {
        results = results.filter(actor =>
          actor.cooperativeMemberships.some(
            m => m.cooperativeId === query.cooperativeId
          )
        );
      }

      // Filter by capacity
      if (query.capacityType && query.minCapacity !== undefined) {
        results = results.filter(actor =>
          actor.capacities.some(
            c => c.type === query.capacityType && c.value >= query.minCapacity
          )
        );
      }

      return results;
    },

    findPath(fromId, toId) {
      // Breadth-first search to find path through relationships
      const visited = new Set();
      const queue = [{ actorId: fromId, path: [fromId] }];

      while (queue.length > 0) {
        const { actorId, path } = queue.shift();

        if (actorId === toId) {
          return path;
        }

        if (visited.has(actorId)) {
          continue;
        }

        visited.add(actorId);

        // Find all outgoing relationships
        const outgoingRels = Array.from(relationships.values()).filter(
          rel => rel.fromActorId === actorId && rel.status === 'active'
        );

        for (const rel of outgoingRels) {
          if (!visited.has(rel.toActorId)) {
            queue.push({
              actorId: rel.toActorId,
              path: [...path, rel.toActorId],
            });
          }
        }
      }

      return []; // No path found
    },
  };
}
