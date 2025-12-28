// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { SkincareBrand } from "skincare-brand:skincare";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route 1: Get salon by ID
    if (path.startsWith('/salon/')) {
      const salonId = path.substring(7);
      try {
        if (req.headers.has("X-Use-Direct-Api")) {
          // Direct API usage - create SkincareBrand with hardcoded data
          const brand = new SkincareBrand({
            salons: [
              {
                id: "salon1",
                name: "Direct API Salon",
                type: "salon",
                location: {},
                capacities: [],
                specialties: ["facials"],
                operatingHours: {},
                certifications: [],
                cooperativeMemberships: []
              }
            ],
            formulations: [],
            procedures: []
          });
          const salon = brand.getSalon(salonId);
          return new Response(JSON.stringify(salon, null, 2), {
            headers: { "Content-Type": "application/json" }
          });
        } else {
          // Use environment binding (capability-based design)
          const salon = env.skincareBrand.getSalon(salonId);
          return new Response(JSON.stringify(salon, null, 2), {
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

    // Route 2: Get all salons
    if (path === '/salons') {
      const salons = env.skincareBrand.getAllSalons();
      return new Response(JSON.stringify({ salons, count: salons.length }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Route 3: Get salon procedures
    if (path.startsWith('/salon/') && path.includes('/procedures')) {
      const salonId = path.split('/')[2];
      try {
        const procedures = env.skincareBrand.getSalonProcedures(salonId);
        return new Response(JSON.stringify({ salonId, procedures, count: procedures.length }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Route 4: Get procedure by ID
    if (path.startsWith('/procedure/')) {
      const procedureId = path.substring(11);
      try {
        const procedure = env.skincareBrand.getProcedure(procedureId);
        const cost = env.skincareBrand.calculateProcedureCost(procedureId);
        return new Response(JSON.stringify({ ...procedure, calculatedCost: cost }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Route 5: Get formulation by ID
    if (path.startsWith('/formulation/')) {
      const formulationId = path.substring(13);
      try {
        const formulation = env.skincareBrand.getFormulation(formulationId);
        return new Response(JSON.stringify(formulation, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Route 6: Query formulations by type
    if (path === '/formulations') {
      const type = url.searchParams.get('type');
      const skinType = url.searchParams.get('skinType');
      
      let formulations;
      if (type) {
        formulations = env.skincareBrand.findFormulationsByType(type);
      } else if (skinType) {
        formulations = env.skincareBrand.findFormulationsBySkinType(skinType);
      } else {
        formulations = env.skincareBrand.getAllFormulations();
      }
      
      return new Response(JSON.stringify({ formulations, count: formulations.length }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Route 7: Query procedures by skin type or duration
    if (path === '/procedures') {
      const skinType = url.searchParams.get('skinType');
      const minDuration = parseInt(url.searchParams.get('minDuration')) || undefined;
      const maxDuration = parseInt(url.searchParams.get('maxDuration')) || undefined;
      
      let procedures;
      if (skinType) {
        procedures = env.skincareBrand.findProceduresBySkinType(skinType);
      } else if (minDuration) {
        procedures = env.skincareBrand.findProceduresByDuration(minDuration, maxDuration);
      } else {
        procedures = [];
      }
      
      return new Response(JSON.stringify({ procedures, count: procedures.length }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Route 8: Query salons
    if (path === '/query/salons') {
      const specialty = url.searchParams.get('specialty');
      const city = url.searchParams.get('city');
      const cooperativeId = url.searchParams.get('cooperative');
      
      const query = {};
      if (specialty) query.specialty = specialty;
      if (city) query.city = city;
      if (cooperativeId) query.cooperativeId = cooperativeId;
      
      const salons = env.skincareBrand.querySalons(query);
      return new Response(JSON.stringify({ salons, count: salons.length }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Default: Show API info
    return new Response(JSON.stringify({
      message: "Skincare Brand API",
      endpoints: {
        "/salon/{id}": "Get salon by ID",
        "/salons": "Get all salons",
        "/salon/{id}/procedures": "Get salon procedures",
        "/procedure/{id}": "Get procedure details with cost",
        "/formulation/{id}": "Get formulation details",
        "/formulations?type={type}&skinType={skinType}": "Query formulations",
        "/procedures?skinType={type}&minDuration={min}&maxDuration={max}": "Query procedures",
        "/query/salons?specialty={specialty}&city={city}&cooperative={id}": "Query salons"
      }
    }, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
