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
        return new Response(JSON.stringify({
          service: "Small Salon API",
          salon: env.smallSalon.getSalon().name,
          endpoints: [
            "GET / - This documentation",
            "GET /salon - Get salon information",
            "GET /capacity - Get salon capacity",
            "GET /equipment - Get available equipment",
            "GET /formulations - Get all formulations",
            "GET /formulations?type={type} - Filter by type",
            "GET /formulations?skinType={type} - Filter by skin type",
            "GET /formulation/{id} - Get specific formulation",
            "GET /procedures - Get all procedures",
            "GET /procedures?minDuration={min}&maxDuration={max} - Filter by duration",
            "GET /procedures?skinType={type} - Filter by skin type",
            "GET /procedure/{id} - Get specific procedure",
            "GET /procedure/{id}/cost - Calculate procedure cost with products"
          ]
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get salon info
      if (path === "/salon") {
        const salon = env.smallSalon.getSalon();
        return new Response(JSON.stringify(salon, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get capacity
      if (path === "/capacity") {
        const capacity = env.smallSalon.getCapacity();
        return new Response(JSON.stringify(capacity, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get equipment
      if (path === "/equipment") {
        const equipment = env.smallSalon.getEquipment();
        return new Response(JSON.stringify(equipment, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get formulations
      if (path === "/formulations") {
        const type = url.searchParams.get("type");
        const skinType = url.searchParams.get("skinType");

        let formulations;
        if (type) {
          formulations = env.smallSalon.findFormulationsByType(type);
        } else if (skinType) {
          formulations = env.smallSalon.findFormulationsBySkinType(skinType);
        } else {
          formulations = env.smallSalon.getFormulations();
        }

        return new Response(JSON.stringify(formulations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific formulation
      const formulationMatch = path.match(/^\/formulation\/([^/]+)$/);
      if (formulationMatch) {
        const formulationId = formulationMatch[1];
        const formulation = env.smallSalon.getFormulation(formulationId);
        return new Response(JSON.stringify(formulation, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedures
      if (path === "/procedures") {
        const minDuration = url.searchParams.get("minDuration");
        const maxDuration = url.searchParams.get("maxDuration");
        const skinType = url.searchParams.get("skinType");

        let procedures;
        if (minDuration && maxDuration) {
          procedures = env.smallSalon.findProceduresByDuration(
            parseInt(minDuration),
            parseInt(maxDuration)
          );
        } else if (skinType) {
          procedures = env.smallSalon.findProceduresBySkinType(skinType);
        } else {
          procedures = env.smallSalon.getProcedures();
        }

        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific procedure
      const procedureMatch = path.match(/^\/procedure\/([^/]+)$/);
      if (procedureMatch) {
        const procedureId = procedureMatch[1];
        const procedure = env.smallSalon.getProcedure(procedureId);
        return new Response(JSON.stringify(procedure, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedure cost
      const procedureCostMatch = path.match(/^\/procedure\/([^/]+)\/cost$/);
      if (procedureCostMatch) {
        const procedureId = procedureCostMatch[1];
        const cost = env.smallSalon.calculateProcedureCost(procedureId);
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
