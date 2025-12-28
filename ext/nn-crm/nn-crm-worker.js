// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    
    // CORS headers
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

      // API documentation
      if (path === '/api' || path === '/api/') {
        return jsonResponse({
          service: 'Neural Network CRM',
          version: '1.0.0',
          endpoints: {
            'GET /api': 'API documentation',
            'GET /api/summary': 'CRM summary statistics',
            'GET /api/analytics': 'Complete CRM analytics',
            'GET /api/customers': 'Query customers (filters: type, industry, segment, minRevenue, maxChurnRisk)',
            'GET /api/customer/:id': 'Get customer details',
            'GET /api/embedding/:id': 'Get customer embedding',
            'GET /api/similar/:id': 'Find similar customers',
            'GET /api/churn/:id': 'Predict churn risk',
            'GET /api/lifecycle/:id': 'Analyze customer lifecycle',
            'GET /api/pipeline/:id': 'Predict sales pipeline',
            'GET /api/segments': 'Customer segmentation',
            'GET /api/embeddings/export': 'Export all embeddings'
          }
        }, corsHeaders);
      }

      // Summary
      if (path === '/api/summary') {
        const summary = env.neuralCRM.getSummary();
        return jsonResponse(summary, corsHeaders);
      }

      // Analytics
      if (path === '/api/analytics') {
        const analytics = env.neuralCRM.getCRMAnalytics();
        return jsonResponse(analytics, corsHeaders);
      }

      // Query customers
      if (path === '/api/customers') {
        const filters = {
          type: url.searchParams.get('type'),
          industry: url.searchParams.get('industry'),
          segment: url.searchParams.get('segment'),
          minRevenue: url.searchParams.get('minRevenue') ? parseInt(url.searchParams.get('minRevenue')) : undefined,
          maxChurnRisk: url.searchParams.get('maxChurnRisk') ? parseFloat(url.searchParams.get('maxChurnRisk')) : undefined,
          engagementLevel: url.searchParams.get('engagementLevel')
        };
        const customers = env.neuralCRM.queryCustomers(filters);
        return jsonResponse({ customers, count: customers.length }, corsHeaders);
      }

      // Get customer
      const customerMatch = path.match(/^\/api\/customer\/([^/]+)$/);
      if (customerMatch) {
        const customerId = customerMatch[1];
        const customer = env.neuralCRM.getCustomer(customerId);
        return jsonResponse(customer, corsHeaders);
      }

      // Get embedding
      const embeddingMatch = path.match(/^\/api\/embedding\/([^/]+)$/);
      if (embeddingMatch) {
        const customerId = embeddingMatch[1];
        const embedding = env.neuralCRM.getCustomerEmbedding(customerId);
        return jsonResponse(embedding, corsHeaders);
      }

      // Find similar customers
      const similarMatch = path.match(/^\/api\/similar\/([^/]+)$/);
      if (similarMatch) {
        const customerId = similarMatch[1];
        const topK = parseInt(url.searchParams.get('topK') || '5');
        const similar = env.neuralCRM.findSimilarCustomers(customerId, topK);
        return jsonResponse({ customerId, similar }, corsHeaders);
      }

      // Predict churn
      const churnMatch = path.match(/^\/api\/churn\/([^/]+)$/);
      if (churnMatch) {
        const customerId = churnMatch[1];
        const prediction = env.neuralCRM.predictChurn(customerId);
        return jsonResponse({ customerId, prediction }, corsHeaders);
      }

      // Lifecycle analysis
      const lifecycleMatch = path.match(/^\/api\/lifecycle\/([^/]+)$/);
      if (lifecycleMatch) {
        const customerId = lifecycleMatch[1];
        const lifecycle = env.neuralCRM.analyzeLifecycle(customerId);
        return jsonResponse({ customerId, lifecycle }, corsHeaders);
      }

      // Pipeline prediction
      const pipelineMatch = path.match(/^\/api\/pipeline\/([^/]+)$/);
      if (pipelineMatch) {
        const customerId = pipelineMatch[1];
        const pipeline = env.neuralCRM.predictSalesPipeline(customerId);
        return jsonResponse({ customerId, pipeline }, corsHeaders);
      }

      // Customer segments
      if (path === '/api/segments') {
        const segments = env.neuralCRM.segmentCustomers();
        return jsonResponse(segments, corsHeaders);
      }

      // Export embeddings
      if (path === '/api/embeddings/export') {
        const embeddings = env.neuralCRM.exportEmbeddings();
        return jsonResponse(embeddings, corsHeaders);
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
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
