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
        const stats = env.franchise.getStatistics();
        return new Response(JSON.stringify({
          service: "Franchise Management API",
          franchise: "Radiance Spa & Beauty",
          statistics: stats,
          endpoints: [
            "GET / - This documentation with franchise statistics",
            "GET /locations - Get all franchise locations",
            "GET /location/{id} - Get specific location",
            "GET /location/{id}/capacity - Get location capacity",
            "GET /location/{id}/procedures - Get procedures at location",
            "GET /location/{id}/nearby - Get nearby locations",
            "GET /location/{id}/referrals - Get referral network",
            "GET /hq - Get headquarters information",
            "GET /statistics - Get franchise-wide statistics",
            "GET /capacity - Get total franchise capacity",
            "GET /query/locations?city={city}&level={level}&specialty={specialty} - Query locations",
            "GET /formulations - Get all formulations",
            "GET /formulation/{id} - Get specific formulation",
            "GET /procedures - Get all procedures",
            "GET /procedures/standard - Get franchise standard procedures",
            "GET /procedures/common?locations={id1,id2} - Find procedures available at multiple locations",
            "GET /procedure/{id} - Get specific procedure",
            "GET /procedure/{id}/cost - Calculate procedure cost"
          ]
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get headquarters
      if (path === "/hq") {
        const hq = env.franchise.getHeadquarters();
        return new Response(JSON.stringify(hq, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get statistics
      if (path === "/statistics") {
        const stats = env.franchise.getStatistics();
        return new Response(JSON.stringify(stats, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get total capacity
      if (path === "/capacity") {
        const capacity = env.franchise.getTotalCapacity();
        return new Response(JSON.stringify(capacity, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get all locations
      if (path === "/locations") {
        const locations = env.franchise.getAllLocations();
        return new Response(JSON.stringify(locations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Query locations
      if (path === "/query/locations") {
        const filters = {
          city: url.searchParams.get("city"),
          level: url.searchParams.get("level"),
          specialty: url.searchParams.get("specialty"),
          minCapacity: url.searchParams.get("minCapacity")
        };
        const locations = env.franchise.queryLocations(filters);
        return new Response(JSON.stringify(locations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific location
      const locationMatch = path.match(/^\/location\/([^/]+)$/);
      if (locationMatch) {
        const locationId = locationMatch[1];
        const location = env.franchise.getLocation(locationId);
        return new Response(JSON.stringify(location, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get location capacity
      const capacityMatch = path.match(/^\/location\/([^/]+)\/capacity$/);
      if (capacityMatch) {
        const locationId = capacityMatch[1];
        const capacity = env.franchise.getLocationCapacity(locationId);
        return new Response(JSON.stringify(capacity, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedures at location
      const locProcMatch = path.match(/^\/location\/([^/]+)\/procedures$/);
      if (locProcMatch) {
        const locationId = locProcMatch[1];
        const procedures = env.franchise.getProceduresAtLocation(locationId);
        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get nearby locations
      const nearbyMatch = path.match(/^\/location\/([^/]+)\/nearby$/);
      if (nearbyMatch) {
        const locationId = nearbyMatch[1];
        const nearby = env.franchise.getNearbyLocations(locationId);
        return new Response(JSON.stringify(nearby, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get referral network
      const referralMatch = path.match(/^\/location\/([^/]+)\/referrals$/);
      if (referralMatch) {
        const locationId = referralMatch[1];
        const referrals = env.franchise.getReferralNetwork(locationId);
        return new Response(JSON.stringify(referrals, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get formulations
      if (path === "/formulations") {
        const formulations = env.franchise.getFormulations();
        return new Response(JSON.stringify(formulations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific formulation
      const formulationMatch = path.match(/^\/formulation\/([^/]+)$/);
      if (formulationMatch) {
        const formulationId = formulationMatch[1];
        const formulation = env.franchise.getFormulation(formulationId);
        return new Response(JSON.stringify(formulation, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedures
      if (path === "/procedures") {
        const procedures = env.franchise.getProcedures();
        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get standard procedures
      if (path === "/procedures/standard") {
        const procedures = env.franchise.getStandardProcedures();
        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Find common procedures
      if (path === "/procedures/common") {
        const locationIds = url.searchParams.get("locations")?.split(",") || [];
        const procedures = env.franchise.findCommonProcedures(locationIds);
        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific procedure
      const procedureMatch = path.match(/^\/procedure\/([^/]+)$/);
      if (procedureMatch) {
        const procedureId = procedureMatch[1];
        const procedure = env.franchise.getProcedure(procedureId);
        return new Response(JSON.stringify(procedure, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedure cost
      const procedureCostMatch = path.match(/^\/procedure\/([^/]+)\/cost$/);
      if (procedureCostMatch) {
        const procedureId = procedureCostMatch[1];
        const cost = env.franchise.calculateProcedureCost(procedureId);
        return new Response(JSON.stringify(cost, null, 2), {
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
