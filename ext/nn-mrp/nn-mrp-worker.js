// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const path = url.pathname;

      if (path === '/api' || path === '/api/') {
        return jsonResponse({
          service: 'Neural Network MRP',
          version: '1.0.0',
          endpoints: {
            'GET /api': 'API documentation',
            'GET /api/summary': 'MRP summary statistics',
            'GET /api/analytics': 'Complete MRP analytics',
            'GET /api/materials': 'Query materials (filters: type, category, lowStock, location)',
            'GET /api/material/:id': 'Get material details',
            'GET /api/embedding/:id': 'Get material embedding',
            'GET /api/similar/:id': 'Find similar materials',
            'GET /api/optimize/:id': 'Optimize inventory for material',
            'GET /api/demand/:materialId/:demandId': 'Predict demand',
            'GET /api/flow/:id': 'Predict material flow',
            'GET /api/schedule': 'Calculate production schedule',
            'GET /api/embeddings/export': 'Export all embeddings'
          }
        }, corsHeaders);
      }

      if (path === '/api/summary') {
        return jsonResponse(env.neuralMRP.getSummary(), corsHeaders);
      }

      if (path === '/api/analytics') {
        return jsonResponse(env.neuralMRP.getMRPAnalytics(), corsHeaders);
      }

      if (path === '/api/materials') {
        const filters = {
          type: url.searchParams.get('type'),
          category: url.searchParams.get('category'),
          lowStock: url.searchParams.get('lowStock') === 'true',
          location: url.searchParams.get('location')
        };
        const materials = env.neuralMRP.queryMaterials(filters);
        return jsonResponse({ materials, count: materials.length }, corsHeaders);
      }

      const materialMatch = path.match(/^\/api\/material\/([^/]+)$/);
      if (materialMatch) {
        return jsonResponse(env.neuralMRP.getMaterial(materialMatch[1]), corsHeaders);
      }

      const embeddingMatch = path.match(/^\/api\/embedding\/([^/]+)$/);
      if (embeddingMatch) {
        return jsonResponse(env.neuralMRP.getMaterialEmbedding(embeddingMatch[1]), corsHeaders);
      }

      const similarMatch = path.match(/^\/api\/similar\/([^/]+)$/);
      if (similarMatch) {
        const topK = parseInt(url.searchParams.get('topK') || '5');
        const similar = env.neuralMRP.findSimilarMaterials(similarMatch[1], topK);
        return jsonResponse({ materialId: similarMatch[1], similar }, corsHeaders);
      }

      const optimizeMatch = path.match(/^\/api\/optimize\/([^/]+)$/);
      if (optimizeMatch) {
        return jsonResponse(env.neuralMRP.optimizeInventory(optimizeMatch[1]), corsHeaders);
      }

      const demandMatch = path.match(/^\/api\/demand\/([^/]+)\/([^/]+)$/);
      if (demandMatch) {
        const prediction = env.neuralMRP.predictDemand(demandMatch[1], demandMatch[2]);
        return jsonResponse({ materialId: demandMatch[1], demandId: demandMatch[2], prediction }, corsHeaders);
      }

      const flowMatch = path.match(/^\/api\/flow\/([^/]+)$/);
      if (flowMatch) {
        return jsonResponse(env.neuralMRP.predictMaterialFlow(flowMatch[1]), corsHeaders);
      }

      if (path === '/api/schedule') {
        return jsonResponse(env.neuralMRP.calculateProductionSchedule(), corsHeaders);
      }

      if (path === '/api/embeddings/export') {
        return jsonResponse(env.neuralMRP.exportEmbeddings(), corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, corsHeaders, 404);

    } catch (error) {
      return jsonResponse({ error: error.message, stack: error.stack }, corsHeaders, 500);
    }
  }
};

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
