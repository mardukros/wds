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

      // API documentation
      if (path === '/api' || path === '/api/') {
        return jsonResponse({
          service: 'Unified Neural Network Integration (Hyperd)',
          version: '1.0.0',
          description: 'Hyper-Graph Neural Network orchestration across SCM, CRM, MRP, and LMS systems',
          endpoints: {
            'GET /api': 'API documentation',
            'GET /api/dashboard': 'Enterprise-wide dashboard',
            'GET /api/insights': 'Unified insights across all systems',
            'GET /api/systems': 'List registered systems',
            'GET /api/system/:name/analytics': 'Get system-specific analytics',
            'POST /api/workflow': 'Execute cross-system workflow',
            'GET /api/cross-domain': 'Query across domains (params: source, entity, target, hops)',
            'GET /api/export': 'Export complete state'
          },
          workflows: {
            'full_enterprise_analysis': 'Analyze all systems comprehensively',
            'supply_demand_optimization': 'Optimize supply and demand (params: materialId, customerId)',
            'customer_material_learning': 'Link customers, materials, and learning (params: customerId, materialId, learnerId)'
          }
        }, corsHeaders);
      }

      // Enterprise dashboard
      if (path === '/api/dashboard') {
        const dashboard = env.unifiedIntegration.getEnterpriseDashboard();
        return jsonResponse(dashboard, corsHeaders);
      }

      // Unified insights
      if (path === '/api/insights') {
        const insights = env.unifiedIntegration.getUnifiedInsights();
        return jsonResponse(insights, corsHeaders);
      }

      // List systems
      if (path === '/api/systems') {
        const systems = ['scm', 'crm', 'mrp', 'lms'].map(name => {
          try {
            const system = env.unifiedIntegration.getSystem(name);
            return { name, available: !!system };
          } catch {
            return { name, available: false };
          }
        });
        return jsonResponse({ systems }, corsHeaders);
      }

      // System-specific analytics
      const systemMatch = path.match(/^\/api\/system\/([^/]+)\/analytics$/);
      if (systemMatch) {
        const systemName = systemMatch[1];
        const analytics = env.unifiedIntegration.getSystemAnalytics(systemName);
        return jsonResponse({ system: systemName, analytics }, corsHeaders);
      }

      // Execute workflow
      if (path === '/api/workflow' && req.method === 'POST') {
        const body = await req.json();
        const { workflow, params } = body;
        const result = await env.unifiedIntegration.executeWorkflow(workflow, params || {});
        return jsonResponse(result, corsHeaders);
      }

      // Execute workflow via GET (for simple workflows)
      if (path === '/api/workflow') {
        const workflow = url.searchParams.get('name') || 'full_enterprise_analysis';
        const result = await env.unifiedIntegration.executeWorkflow(workflow, {});
        return jsonResponse(result, corsHeaders);
      }

      // Cross-domain query
      if (path === '/api/cross-domain') {
        const source = url.searchParams.get('source');
        const entity = url.searchParams.get('entity');
        const target = url.searchParams.get('target');
        const hops = parseInt(url.searchParams.get('hops') || '3');

        if (!source || !entity || !target) {
          return jsonResponse({
            error: 'Missing parameters',
            required: ['source', 'entity', 'target'],
            optional: ['hops']
          }, corsHeaders, 400);
        }

        const result = env.unifiedIntegration.crossDomainQuery(source, entity, target, hops);
        return jsonResponse(result, corsHeaders);
      }

      // Export state
      if (path === '/api/export') {
        const exported = env.unifiedIntegration.export();
        return jsonResponse(exported, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, corsHeaders, 404);

    } catch (error) {
      return jsonResponse({
        error: error.message,
        stack: error.stack
      }, corsHeaders, 500);
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
