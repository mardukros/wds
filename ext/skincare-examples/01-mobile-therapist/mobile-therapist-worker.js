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
          service: "Mobile Therapist API",
          endpoints: [
            "GET / - This documentation",
            "GET /therapist - Get therapist information",
            "GET /procedures - Get all procedures",
            "GET /procedure/{id} - Get specific procedure",
            "GET /procedures/duration?min={min}&max={max} - Find by duration",
            "GET /procedures/price?min={min}&max={max} - Find by price",
            "GET /capacity - Get daily capacity info"
          ]
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get therapist info
      if (path === "/therapist") {
        const therapist = env.mobileTherapist.getTherapist();
        return new Response(JSON.stringify(therapist, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get all procedures
      if (path === "/procedures") {
        const minDuration = url.searchParams.get("minDuration");
        const maxDuration = url.searchParams.get("maxDuration");
        const minPrice = url.searchParams.get("minPrice");
        const maxPrice = url.searchParams.get("maxPrice");

        let procedures;
        if (minDuration && maxDuration) {
          procedures = env.mobileTherapist.findProceduresByDuration(
            parseInt(minDuration),
            parseInt(maxDuration)
          );
        } else if (minPrice && maxPrice) {
          procedures = env.mobileTherapist.findProceduresByPrice(
            parseInt(minPrice),
            parseInt(maxPrice)
          );
        } else {
          procedures = env.mobileTherapist.getProcedures();
        }

        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get specific procedure
      const procedureMatch = path.match(/^\/procedure\/([^/]+)$/);
      if (procedureMatch) {
        const procedureId = procedureMatch[1];
        const procedure = env.mobileTherapist.getProcedure(procedureId);
        return new Response(JSON.stringify(procedure, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get capacity info
      if (path === "/capacity") {
        const capacity = env.mobileTherapist.calculateDailyCapacity();
        return new Response(JSON.stringify(capacity, null, 2), {
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
