# Wodog - Supply Chain Implementation for workerd

A formal specification and implementation for a generic supply-chain system designed for Cloudflare Workers (workerd).

## Overview

This package provides a comprehensive type system and implementation for managing supply chain actors, relationships, products, and services in a distributed environment.

## Features

### Actors and Roles

The system defines sets of entities representing different supply chain actors:

- **𝑆 = {s₁,…,sₙ}** - Suppliers: Entities that provide raw materials
- **𝑃 = {p₁,…,pₘ}** - Producers: Entities that manufacture products
- **𝐷** - Distributors: Entities that distribute goods
- **𝑊** - Wholesalers: Entities that sell in bulk
- **𝑅** - Retailers: Entities that sell to end consumers
- **𝑀** - Marketplaces: Platforms for multi-vendor sales

Each actor has:
- **Attributes**: name, type, capacities, pricing rules
- **Cooperative memberships**: primary, secondary, or tertiary level memberships

### Relationships

The system models relationships between actors with:
- Relationship types (supplies, produces_for, distributes_to, sells_to, partners_with, competes_with)
- Status tracking (active, inactive, pending, terminated)
- Contract terms and metadata
- Graph-based path finding

### Services and Products

- **Products**: Raw materials, intermediate goods, finished goods, and services
- **Product attributes**: Weight, dimensions, perishability, certifications
- **Services**: Transportation, warehousing, processing, packaging, consulting, marketing
- **Service Level Agreements**: Response time, availability, quality metrics
- **Inventory tracking**: Location-based inventory management

### Config and Bindings

Designed for workerd with:
- KV namespace bindings for persistence
- Durable Object support for state management
- Feature flags and validation rules
- API configuration and rate limiting

### Dynamic Lookups

Powerful query system supporting:
- Actor lookup by type, name, cooperative membership, capacity
- Product search by category, producer, tags
- Relationship queries with filtering
- Supply chain path finding between actors
- Paginated results

## Installation

```bash
npm install wodog
```

## Usage

### Basic Example

```typescript
import { SupplyChainLookup, Supplier, Producer, Retailer } from 'wodog';

const lookup = new SupplyChainLookup();

// Create a supplier
const supplier: Supplier = {
  id: 's1',
  name: 'Raw Materials Inc',
  type: 'supplier',
  capacities: [
    { type: 'storage', value: 10000, unit: 'kg' }
  ],
  pricingRules: [
    {
      id: 'pr1',
      name: 'Bulk Pricing',
      type: 'tiered',
      tiers: [
        { minQuantity: 0, maxQuantity: 100, price: 10 },
        { minQuantity: 100, price: 9 }
      ]
    }
  ],
  cooperativeMemberships: [],
  rawMaterialTypes: ['steel', 'aluminum']
};

lookup.addActor(supplier);

// Query actors
const suppliers = await lookup.findActors({ type: 'supplier' });
console.log('Found suppliers:', suppliers.items);
```

### Finding Supply Chain Paths

```typescript
// Find path from supplier to retailer
const path = await lookup.findSupplyChainPath('s1', 'r1');
console.log('Supply chain path:', path);
```

### Querying by Cooperative Membership

```typescript
const coopMembers = await lookup.findActors({ 
  cooperativeId: 'coop1' 
});
```

## API Reference

### Core Types

- `Actor` - Base interface for all supply chain actors
- `Supplier`, `Producer`, `Distributor`, `Wholesaler`, `Retailer`, `Marketplace` - Specific actor types
- `Relationship` - Connection between actors
- `Product` - Goods in the supply chain
- `Service` - Services provided by actors

### SupplyChainLookup

Main class for querying supply chain entities:

- `findActors(query, page, pageSize)` - Search for actors
- `findProducts(query, page, pageSize)` - Search for products
- `findRelationships(query, page, pageSize)` - Search for relationships
- `findSupplyChainPath(fromId, toId)` - Find path between actors
- `getActorById(id)` - Get actor by ID
- `getProductById(id)` - Get product by ID

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## License

ISC