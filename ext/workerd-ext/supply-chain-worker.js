// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { SupplyChain } from "supply-chain:supply-chain";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route 1: Get actor by ID
    if (path.startsWith('/actor/')) {
      const actorId = path.substring(7);
      try {
        if (req.headers.has("X-Use-Direct-Api")) {
          // Direct API usage - create SupplyChain with hardcoded data
          const chain = new SupplyChain({
            actors: [
              {
                id: "s1",
                name: "Direct API Supplier",
                type: "supplier",
                capacities: [],
                pricingRules: [],
                cooperativeMemberships: [],
                rawMaterialTypes: ["steel"]
              }
            ],
            relationships: []
          });
          const actor = chain.getActor(actorId);
          return new Response(JSON.stringify(actor, null, 2), {
            headers: { "Content-Type": "application/json" }
          });
        } else {
          // Use environment binding (capability-based design)
          const actor = env.supplyChain.getActor(actorId);
          return new Response(JSON.stringify(actor, null, 2), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Route 2: Find actors by type
    if (path === '/actors') {
      const actorType = url.searchParams.get('type');
      const actors = actorType 
        ? env.supplyChain.findActorsByType(actorType)
        : env.supplyChain.queryActors({});
      
      return new Response(JSON.stringify({ actors, count: actors.length }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Route 3: Find supply chain path
    if (path === '/path') {
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      
      if (!from || !to) {
        return new Response(
          JSON.stringify({ error: 'Missing from or to parameter' }), 
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      
      const path = env.supplyChain.findPath(from, to);
      return new Response(JSON.stringify({ from, to, path }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Route 4: Query actors with filters
    if (path === '/query') {
      const name = url.searchParams.get('name');
      const cooperativeId = url.searchParams.get('cooperative');
      
      const query = {};
      if (name) query.name = name;
      if (cooperativeId) query.cooperativeId = cooperativeId;
      
      const actors = env.supplyChain.queryActors(query);
      return new Response(JSON.stringify({ actors, count: actors.length }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Route 5: Get actor relationships
    if (path.startsWith('/relationships/')) {
      const actorId = path.substring(15);
      const relationships = env.supplyChain.getActorRelationships(actorId);
      return new Response(JSON.stringify({ actorId, relationships }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Default: Show API info
    return new Response(JSON.stringify({
      message: "Supply Chain API",
      endpoints: {
        "/actor/{id}": "Get actor by ID",
        "/actors?type={type}": "Find actors by type",
        "/path?from={id}&to={id}": "Find supply chain path",
        "/query?name={name}&cooperative={id}": "Query actors",
        "/relationships/{id}": "Get actor relationships"
      }
    }, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
