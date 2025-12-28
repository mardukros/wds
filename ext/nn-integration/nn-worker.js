// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Worker implementation for Neural Network Supply Chain
// Provides REST API for ERP+SCM flow dynamics analysis

import { NeuralSupplyChain } from "nn-integration:nn-supply-chain";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      let result;

      // Use binding if available, otherwise direct API
      const useBinding = !req.headers.has('X-Use-Direct-Api');
      let nnsc;

      if (useBinding && env.neuralSupplyChain) {
        nnsc = env.neuralSupplyChain;
      } else {
        // Direct API mode - create instance from request
        const body = req.method === 'POST' ? await req.json() : {};
        nnsc = new NeuralSupplyChain(body.data || { actors: [], relationships: [] });
      }

      // Route requests
      if (path === '/' || path === '/api') {
        result = getAPIDocumentation();
      } else if (path === '/api/summary') {
        result = nnsc.getSummary();
      } else if (path === '/api/actors') {
        const query = Object.fromEntries(url.searchParams);
        result = nnsc.queryActors(query);
      } else if (path.startsWith('/api/actor/')) {
        const actorId = path.split('/').pop();
        result = nnsc.getActor(actorId);
      } else if (path.startsWith('/api/embedding/')) {
        const actorId = path.split('/').pop();
        result = nnsc.getActorEmbedding(actorId);
      } else if (path.startsWith('/api/similar/')) {
        const actorId = path.split('/').pop();
        const topK = parseInt(url.searchParams.get('topK')) || 5;
        result = nnsc.findSimilarActors(actorId, topK);
      } else if (path === '/api/similarity') {
        const actor1 = url.searchParams.get('actor1');
        const actor2 = url.searchParams.get('actor2');
        if (!actor1 || !actor2) {
          throw new Error('Both actor1 and actor2 query parameters required');
        }
        result = nnsc.computeActorSimilarity(actor1, actor2);
      } else if (path === '/api/flow/predict') {
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!from || !to) {
          throw new Error('Both from and to query parameters required');
        }
        result = nnsc.predictFlow(from, to);
      } else if (path === '/api/flow/analyze') {
        result = nnsc.analyzeNetworkFlow();
      } else if (path === '/api/network/health') {
        result = nnsc.getNetworkHealth();
      } else if (path === '/api/erp-scm/analysis') {
        result = nnsc.getERPSCMAnalysis();
      } else if (path === '/api/predict/future') {
        const days = parseInt(url.searchParams.get('days')) || 30;
        result = nnsc.predictFutureState(days);
      } else if (path === '/api/anomalies') {
        const threshold = parseFloat(url.searchParams.get('threshold')) || 0.3;
        result = nnsc.detectAnomalies(threshold);
      } else if (path === '/api/flow/statistics') {
        result = nnsc.getFlowStatistics();
      } else if (path === '/api/path/optimal') {
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!from || !to) {
          throw new Error('Both from and to query parameters required');
        }
        result = nnsc.findOptimalPath(from, to);
      } else if (path === '/api/embeddings/export') {
        result = nnsc.exportEmbeddings();
      } else {
        return new Response(JSON.stringify({
          error: 'Not found',
          message: `Unknown endpoint: ${path}`,
          availableEndpoints: getEndpointsList()
        }), {
          status: 404,
          headers
        });
      }

      return new Response(JSON.stringify(result, null, 2), { headers });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers
      });
    }
  }
};

function getAPIDocumentation() {
  return {
    name: 'Neural Network Supply Chain API',
    version: '1.0.0',
    description: 'Real-time ERP+SCM flow dynamics analysis using tensor embeddings and neural networks',
    endpoints: [
      {
        path: '/api/summary',
        method: 'GET',
        description: 'Get summary statistics of the supply chain network'
      },
      {
        path: '/api/actors',
        method: 'GET',
        description: 'Query actors with filters (type, name, minCapacity, capacityType, cooperativeId)',
        parameters: ['type', 'name', 'minCapacity', 'capacityType', 'cooperativeId']
      },
      {
        path: '/api/actor/{id}',
        method: 'GET',
        description: 'Get details of a specific actor'
      },
      {
        path: '/api/embedding/{actorId}',
        method: 'GET',
        description: 'Get tensor embedding for an actor'
      },
      {
        path: '/api/similar/{actorId}',
        method: 'GET',
        description: 'Find similar actors based on embedding similarity',
        parameters: ['topK (default: 5)']
      },
      {
        path: '/api/similarity',
        method: 'GET',
        description: 'Compute similarity between two actors',
        parameters: ['actor1', 'actor2']
      },
      {
        path: '/api/flow/predict',
        method: 'GET',
        description: 'Predict flow dynamics between two actors',
        parameters: ['from', 'to']
      },
      {
        path: '/api/flow/analyze',
        method: 'GET',
        description: 'Analyze entire network flow dynamics'
      },
      {
        path: '/api/network/health',
        method: 'GET',
        description: 'Get real-time network health metrics'
      },
      {
        path: '/api/erp-scm/analysis',
        method: 'GET',
        description: 'Get integrated ERP+SCM analysis with actor-level metrics'
      },
      {
        path: '/api/predict/future',
        method: 'GET',
        description: 'Predict future network state',
        parameters: ['days (default: 30)']
      },
      {
        path: '/api/anomalies',
        method: 'GET',
        description: 'Detect anomalies in flow history',
        parameters: ['threshold (default: 0.3)']
      },
      {
        path: '/api/flow/statistics',
        method: 'GET',
        description: 'Get flow statistics from history'
      },
      {
        path: '/api/path/optimal',
        method: 'GET',
        description: 'Find optimal paths between actors considering flow quality',
        parameters: ['from', 'to']
      },
      {
        path: '/api/embeddings/export',
        method: 'GET',
        description: 'Export all embeddings (actors, relationships, types)'
      }
    ],
    usage: {
      binding: 'Use env.neuralSupplyChain to access the configured instance',
      directApi: 'Add X-Use-Direct-Api header to use direct API mode (for testing)'
    },
    features: [
      'Tensor embeddings for actors, products, and relationships',
      'Neural network-based flow dynamics prediction',
      'Real-time network health monitoring',
      'Bottleneck detection and recommendations',
      'Similarity search and clustering',
      'Future state prediction',
      'Anomaly detection',
      'ERP+SCM integrated analysis'
    ]
  };
}

function getEndpointsList() {
  return [
    '/api',
    '/api/summary',
    '/api/actors',
    '/api/actor/{id}',
    '/api/embedding/{actorId}',
    '/api/similar/{actorId}',
    '/api/similarity',
    '/api/flow/predict',
    '/api/flow/analyze',
    '/api/network/health',
    '/api/erp-scm/analysis',
    '/api/predict/future',
    '/api/anomalies',
    '/api/flow/statistics',
    '/api/path/optimal',
    '/api/embeddings/export'
  ];
}
