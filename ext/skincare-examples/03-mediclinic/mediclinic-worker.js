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
          service: "Medical Clinic API",
          clinic: env.mediclinic.getClinic().name,
          medicalDirector: env.mediclinic.getClinic().medicalDirector,
          endpoints: [
            "GET / - This documentation",
            "GET /clinic - Get clinic information",
            "GET /capacity - Get clinic capacity and staffing",
            "GET /equipment - Get medical equipment list",
            "GET /specialties - Get clinic specialties",
            "GET /certifications - Get clinic certifications",
            "GET /formulations - Get all formulations",
            "GET /formulations/prescription - Get prescription-only products",
            "GET /formulations/otc - Get over-the-counter products",
            "GET /formulations?type={type} - Filter by type",
            "GET /formulations?concern={concern} - Filter by skin concern",
            "GET /formulation/{id} - Get specific formulation",
            "GET /procedures - Get all procedures",
            "GET /procedures?category={category} - Filter by category",
            "GET /procedures?consultation=true - Get consultation-required procedures",
            "GET /procedures?maxDowntime={days} - Filter by maximum downtime",
            "GET /procedures?minPrice={min}&maxPrice={max} - Filter by price range",
            "GET /procedures?provider={type} - Filter by provider type",
            "GET /procedure/{id} - Get specific procedure",
            "GET /procedure/{id}/cost - Calculate procedure total cost"
          ]
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get clinic info
      if (path === "/clinic") {
        const clinic = env.mediclinic.getClinic();
        return new Response(JSON.stringify(clinic, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get capacity
      if (path === "/capacity") {
        const capacity = env.mediclinic.getCapacity();
        return new Response(JSON.stringify(capacity, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get equipment
      if (path === "/equipment") {
        const equipment = env.mediclinic.getEquipment();
        return new Response(JSON.stringify(equipment, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specialties
      if (path === "/specialties") {
        const specialties = env.mediclinic.getSpecialties();
        return new Response(JSON.stringify(specialties, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get certifications
      if (path === "/certifications") {
        const certifications = env.mediclinic.getCertifications();
        return new Response(JSON.stringify(certifications, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get prescription formulations
      if (path === "/formulations/prescription") {
        const formulations = env.mediclinic.getPrescriptionFormulations();
        return new Response(JSON.stringify(formulations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get OTC formulations
      if (path === "/formulations/otc") {
        const formulations = env.mediclinic.getOTCFormulations();
        return new Response(JSON.stringify(formulations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get formulations
      if (path === "/formulations") {
        const type = url.searchParams.get("type");
        const concern = url.searchParams.get("concern");

        let formulations;
        if (type) {
          formulations = env.mediclinic.findFormulationsByType(type);
        } else if (concern) {
          formulations = env.mediclinic.findFormulationsByConcern(concern);
        } else {
          formulations = env.mediclinic.getFormulations();
        }

        return new Response(JSON.stringify(formulations, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific formulation
      const formulationMatch = path.match(/^\/formulation\/([^/]+)$/);
      if (formulationMatch) {
        const formulationId = formulationMatch[1];
        const formulation = env.mediclinic.getFormulation(formulationId);
        return new Response(JSON.stringify(formulation, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedures
      if (path === "/procedures") {
        const category = url.searchParams.get("category");
        const consultation = url.searchParams.get("consultation");
        const maxDowntime = url.searchParams.get("maxDowntime");
        const minPrice = url.searchParams.get("minPrice");
        const maxPrice = url.searchParams.get("maxPrice");
        const provider = url.searchParams.get("provider");

        let procedures;
        if (category) {
          procedures = env.mediclinic.findProceduresByCategory(category);
        } else if (consultation === "true") {
          procedures = env.mediclinic.getConsultationRequiredProcedures();
        } else if (maxDowntime) {
          procedures = env.mediclinic.findProceduresByDowntime(parseInt(maxDowntime));
        } else if (minPrice && maxPrice) {
          procedures = env.mediclinic.findProceduresByPrice(
            parseInt(minPrice),
            parseInt(maxPrice)
          );
        } else if (provider) {
          procedures = env.mediclinic.findProceduresByProvider(provider);
        } else {
          procedures = env.mediclinic.getProcedures();
        }

        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific procedure
      const procedureMatch = path.match(/^\/procedure\/([^/]+)$/);
      if (procedureMatch) {
        const procedureId = procedureMatch[1];
        const procedure = env.mediclinic.getProcedure(procedureId);
        return new Response(JSON.stringify(procedure, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get procedure cost
      const procedureCostMatch = path.match(/^\/procedure\/([^/]+)\/cost$/);
      if (procedureCostMatch) {
        const procedureId = procedureCostMatch[1];
        const cost = env.mediclinic.calculateProcedureCost(procedureId);
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
