// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal lookup service with BFS path-finding - hidden from user code

export function createLookupService(actors, relationships) {
  const actorMap = new Map(actors.map(a => [a.id, a]));

  // Build adjacency list for path-finding
  function buildGraph() {
    const graph = new Map();
    
    // Add supplier -> producer edges
    for (const [supplier, producers] of Object.entries(relationships.supplierToProducer || {})) {
      if (!graph.has(supplier)) graph.set(supplier, []);
      graph.get(supplier).push(...producers);
    }
    
    // Add producer -> distributor edges
    for (const [producer, distributors] of Object.entries(relationships.producerToDistributor || {})) {
      if (!graph.has(producer)) graph.set(producer, []);
      graph.get(producer).push(...distributors);
    }
    
    // Add distributor -> salon edges
    for (const [distributor, salons] of Object.entries(relationships.distributorToSalon || {})) {
      if (!graph.has(distributor)) graph.set(distributor, []);
      graph.get(distributor).push(...salons);
    }
    
    return graph;
  }

  const graph = buildGraph();

  return {
    // Find path between two actors using BFS
    findPath(fromId, toId) {
      if (fromId === toId) return [fromId];
      
      const queue = [{ id: fromId, path: [fromId] }];
      const visited = new Set([fromId]);
      
      while (queue.length > 0) {
        const { id, path } = queue.shift();
        const neighbors = graph.get(id) || [];
        
        for (const neighbor of neighbors) {
          if (neighbor === toId) {
            return [...path, neighbor];
          }
          
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push({ id: neighbor, path: [...path, neighbor] });
          }
        }
      }
      
      return null; // No path found
    },

    // Get direct relationships
    getDirectSuppliers(producerId) {
      const suppliers = relationships.reverseRelationships?.producerToSupplier?.[producerId] || [];
      return suppliers.map(id => actorMap.get(id)).filter(Boolean);
    },

    getDirectProducers(supplierId) {
      const producers = relationships.supplierToProducer?.[supplierId] || [];
      return producers.map(id => actorMap.get(id)).filter(Boolean);
    },

    getDirectDistributors(producerId) {
      const distributors = relationships.producerToDistributor?.[producerId] || [];
      return distributors.map(id => actorMap.get(id)).filter(Boolean);
    },

    getDirectSalons(distributorId) {
      const salons = relationships.distributorToSalon?.[distributorId] || [];
      return salons.map(id => actorMap.get(id)).filter(Boolean);
    },

    // Get all actors in supply chain for a salon
    getSupplyChainForSalon(salonId) {
      const distributors = relationships.reverseRelationships?.salonToDistributor?.[salonId] || [];
      const producers = [];
      const suppliers = [];

      for (const distId of distributors) {
        const prods = relationships.reverseRelationships?.distributorToProducer?.[distId] || [];
        producers.push(...prods);
      }

      for (const prodId of producers) {
        const sups = relationships.reverseRelationships?.producerToSupplier?.[prodId] || [];
        suppliers.push(...sups);
      }

      return {
        salon: actorMap.get(salonId),
        distributors: [...new Set(distributors)].map(id => actorMap.get(id)).filter(Boolean),
        producers: [...new Set(producers)].map(id => actorMap.get(id)).filter(Boolean),
        suppliers: [...new Set(suppliers)].map(id => actorMap.get(id)).filter(Boolean)
      };
    },

    // Get all possible paths from supplier to salon
    getAllPaths(fromId, toId, maxDepth = 10) {
      const paths = [];
      
      function dfs(currentId, targetId, currentPath, visited, depth) {
        if (depth > maxDepth) return;
        
        if (currentId === targetId) {
          paths.push([...currentPath]);
          return;
        }
        
        const neighbors = graph.get(currentId) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            currentPath.push(neighbor);
            dfs(neighbor, targetId, currentPath, visited, depth + 1);
            currentPath.pop();
            visited.delete(neighbor);
          }
        }
      }
      
      const visited = new Set([fromId]);
      dfs(fromId, toId, [fromId], visited, 0);
      return paths;
    },

    // Query actors with filters
    queryActors(filters) {
      let results = Array.from(actorMap.values());

      if (filters.type) {
        results = results.filter(a => a.type === filters.type);
      }

      if (filters.subtype) {
        results = results.filter(a => a.subtype === filters.subtype);
      }

      if (filters.city) {
        results = results.filter(a => a.location?.city === filters.city);
      }

      if (filters.certification) {
        results = results.filter(a => a.certifications?.includes(filters.certification));
      }

      if (filters.product) {
        results = results.filter(a => 
          a.products?.includes(filters.product) || 
          a.productTypes?.includes(filters.product)
        );
      }

      return results;
    },

    // Get network statistics
    getNetworkStatistics() {
      const suppliers = actors.filter(a => a.type === "supplier");
      const producers = actors.filter(a => a.type === "producer");
      const distributors = actors.filter(a => a.type === "distributor");
      const salons = actors.filter(a => a.type === "salon");

      return {
        totalActors: actors.length,
        actorCounts: {
          suppliers: suppliers.length,
          producers: producers.length,
          distributors: distributors.length,
          salons: salons.length
        },
        relationshipCounts: {
          supplierToProducer: Object.values(relationships.supplierToProducer || {}).flat().length,
          producerToDistributor: Object.values(relationships.producerToDistributor || {}).flat().length,
          distributorToSalon: Object.values(relationships.distributorToSalon || {}).flat().length
        }
      };
    }
  };
}
