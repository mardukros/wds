// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      // Root - API documentation
      if (path === "/" || path === "") {
        const stats = env.supplyChain.getNetworkStatistics();
        const depth = env.supplyChain.calculateNetworkDepth();
        
        return new Response(JSON.stringify({
          service: "Skincare Supply Chain API",
          network: {
            statistics: stats,
            networkDepth: depth
          },
          endpoints: [
            "GET / - This documentation with network statistics",
            "GET /actors - Get all actors in supply chain",
            "GET /actors?type={type} - Get actors by type (supplier/producer/distributor/salon)",
            "GET /actors?subtype={subtype} - Get actors by subtype",
            "GET /actor/{id} - Get specific actor details",
            "GET /actor/{id}/connected - Get all directly connected actors",
            "GET /suppliers - Get all suppliers",
            "GET /producers - Get all producers",
            "GET /distributors - Get all distributors",
            "GET /salons - Get all salons",
            "GET /path?from={id}&to={id} - Find shortest path between actors (BFS)",
            "GET /paths?from={id}&to={id} - Find all paths between actors (DFS)",
            "GET /salon/{id}/supply-chain - Get complete supply chain for salon",
            "GET /supplier/{id}/producers - Get direct producers",
            "GET /producer/{id}/suppliers - Get direct suppliers",
            "GET /producer/{id}/distributors - Get direct distributors",
            "GET /distributor/{id}/salons - Get direct salons",
            "GET /query?city={city}&type={type}&certification={cert} - Query actors",
            "GET /product-flows - Get product flow information",
            "GET /cooperatives - Get cooperative information",
            "GET /statistics - Get detailed network statistics"
          ]
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get all actors
      if (path === "/actors") {
        const type = url.searchParams.get("type");
        const subtype = url.searchParams.get("subtype");

        let actors;
        if (type) {
          actors = env.supplyChain.getActorsByType(type);
        } else if (subtype) {
          actors = env.supplyChain.getActorsBySubtype(subtype);
        } else {
          actors = env.supplyChain.getAllActors();
        }

        return new Response(JSON.stringify(actors, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get suppliers
      if (path === "/suppliers") {
        const suppliers = env.supplyChain.getActorsByType("supplier");
        return new Response(JSON.stringify(suppliers, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get producers
      if (path === "/producers") {
        const producers = env.supplyChain.getActorsByType("producer");
        return new Response(JSON.stringify(producers, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get distributors
      if (path === "/distributors") {
        const distributors = env.supplyChain.getActorsByType("distributor");
        return new Response(JSON.stringify(distributors, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get salons
      if (path === "/salons") {
        const salons = env.supplyChain.getActorsByType("salon");
        return new Response(JSON.stringify(salons, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get statistics
      if (path === "/statistics") {
        const stats = env.supplyChain.getNetworkStatistics();
        const depth = env.supplyChain.calculateNetworkDepth();
        return new Response(JSON.stringify({
          ...stats,
          networkDepth: depth
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Find path between actors
      if (path === "/path") {
        const fromId = url.searchParams.get("from");
        const toId = url.searchParams.get("to");
        
        if (!fromId || !toId) {
          return new Response(JSON.stringify({
            error: "Both 'from' and 'to' parameters are required"
          }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const path = env.supplyChain.findPath(fromId, toId);
        if (!path) {
          return new Response(JSON.stringify({
            message: "No path found between actors"
          }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify(path, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Find all paths between actors
      if (path === "/paths") {
        const fromId = url.searchParams.get("from");
        const toId = url.searchParams.get("to");
        
        if (!fromId || !toId) {
          return new Response(JSON.stringify({
            error: "Both 'from' and 'to' parameters are required"
          }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const paths = env.supplyChain.getAllPaths(fromId, toId);
        return new Response(JSON.stringify({
          totalPaths: paths.length,
          paths: paths
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Query actors
      if (path === "/query") {
        const filters = {
          type: url.searchParams.get("type"),
          subtype: url.searchParams.get("subtype"),
          city: url.searchParams.get("city"),
          certification: url.searchParams.get("certification"),
          product: url.searchParams.get("product")
        };
        const actors = env.supplyChain.queryActors(filters);
        return new Response(JSON.stringify(actors, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get product flows
      if (path === "/product-flows") {
        const flows = env.supplyChain.getProductFlows();
        return new Response(JSON.stringify(flows, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get cooperatives
      if (path === "/cooperatives") {
        const coops = env.supplyChain.getCooperatives();
        return new Response(JSON.stringify(coops, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific actor
      const actorMatch = path.match(/^\/actor\/([^/]+)$/);
      if (actorMatch) {
        const actorId = actorMatch[1];
        const actor = env.supplyChain.getActor(actorId);
        return new Response(JSON.stringify(actor, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get connected actors
      const connectedMatch = path.match(/^\/actor\/([^/]+)\/connected$/);
      if (connectedMatch) {
        const actorId = connectedMatch[1];
        const connected = env.supplyChain.getConnectedActors(actorId);
        return new Response(JSON.stringify(connected, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get supply chain for salon
      const salonChainMatch = path.match(/^\/salon\/([^/]+)\/supply-chain$/);
      if (salonChainMatch) {
        const salonId = salonChainMatch[1];
        const chain = env.supplyChain.getSupplyChainForSalon(salonId);
        return new Response(JSON.stringify(chain, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get direct producers for supplier
      const supplierProducersMatch = path.match(/^\/supplier\/([^/]+)\/producers$/);
      if (supplierProducersMatch) {
        const supplierId = supplierProducersMatch[1];
        const producers = env.supplyChain.getDirectProducers(supplierId);
        return new Response(JSON.stringify(producers, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get direct suppliers for producer
      const producerSuppliersMatch = path.match(/^\/producer\/([^/]+)\/suppliers$/);
      if (producerSuppliersMatch) {
        const producerId = producerSuppliersMatch[1];
        const suppliers = env.supplyChain.getDirectSuppliers(producerId);
        return new Response(JSON.stringify(suppliers, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get direct distributors for producer
      const producerDistributorsMatch = path.match(/^\/producer\/([^/]+)\/distributors$/);
      if (producerDistributorsMatch) {
        const producerId = producerDistributorsMatch[1];
        const distributors = env.supplyChain.getDirectDistributors(producerId);
        return new Response(JSON.stringify(distributors, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get direct salons for distributor
      const distributorSalonsMatch = path.match(/^\/distributor\/([^/]+)\/salons$/);
      if (distributorSalonsMatch) {
        const distributorId = distributorSalonsMatch[1];
        const salons = env.supplyChain.getDirectSalons(distributorId);
        return new Response(JSON.stringify(salons, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response("Not Found", { status: 404 });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
