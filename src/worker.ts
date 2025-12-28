/**
 * Example Cloudflare Worker using the supply chain system
 * 
 * This demonstrates how to use the supply chain implementation
 * in a workerd environment with proper bindings.
 */

import {
  SupplyChainLookup,
  Supplier,
  Producer,
  Relationship,
  Product,
  Env,
  defaultConfig,
} from './index.js';

/**
 * Example worker that handles supply chain queries
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize lookup service
    const lookup = new SupplyChainLookup();

    // In a real implementation, you would load data from KV or Durable Objects
    // For this example, we'll use in-memory data
    await initializeSupplyChain(lookup, env);

    try {
      // Route handling
      if (path === '/actors' && request.method === 'GET') {
        return handleGetActors(lookup, url);
      } else if (path === '/products' && request.method === 'GET') {
        return handleGetProducts(lookup, url);
      } else if (path === '/path' && request.method === 'GET') {
        return handleFindPath(lookup, url);
      } else if (path === '/config' && request.method === 'GET') {
        return handleGetConfig(env);
      } else {
        return new Response('Not found', { status: 404 });
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

/**
 * Initialize supply chain with example data
 */
async function initializeSupplyChain(
  lookup: SupplyChainLookup,
  env: Env
): Promise<void> {
  // In production, load from KV storage
  // if (env.ACTORS) {
  //   const actorsData = await env.ACTORS.get('all-actors');
  //   if (actorsData) {
  //     const actors = JSON.parse(actorsData);
  //     actors.forEach((actor: any) => lookup.addActor(actor));
  //   }
  // }

  // For demo, add some example actors
  const supplier: Supplier = {
    id: 's1',
    name: 'Raw Materials Inc',
    type: 'supplier',
    capacities: [{ type: 'storage', value: 10000, unit: 'kg' }],
    pricingRules: [{
      id: 'pr1',
      name: 'Bulk Pricing',
      type: 'tiered',
      tiers: [
        { minQuantity: 0, maxQuantity: 100, price: 10 },
        { minQuantity: 100, price: 9 }
      ]
    }],
    cooperativeMemberships: [],
    rawMaterialTypes: ['steel', 'aluminum']
  };

  lookup.addActor(supplier);
}

/**
 * Handle GET /actors endpoint
 */
async function handleGetActors(
  lookup: SupplyChainLookup,
  url: URL
): Promise<Response> {
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

  const result = await lookup.findActors(
    { 
      type: type as any,
      name: name || undefined 
    },
    page,
    pageSize
  );

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle GET /products endpoint
 */
async function handleGetProducts(
  lookup: SupplyChainLookup,
  url: URL
): Promise<Response> {
  const category = url.searchParams.get('category');
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

  const result = await lookup.findProducts(
    { category: category || undefined },
    page,
    pageSize
  );

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle GET /path endpoint
 */
async function handleFindPath(
  lookup: SupplyChainLookup,
  url: URL
): Promise<Response> {
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  if (!from || !to) {
    return new Response(
      JSON.stringify({ error: 'Missing from or to parameter' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const path = await lookup.findSupplyChainPath(from, to);

  return new Response(JSON.stringify({ path }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle GET /config endpoint
 */
async function handleGetConfig(env: Env): Promise<Response> {
  const config = env.config || defaultConfig;

  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json' },
  });
}
