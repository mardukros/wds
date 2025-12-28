# API Documentation

## Supply Chain Implementation API

This document describes the API for the wodog supply chain implementation.

## Core Concepts

### Actors

Actors represent entities in the supply chain. Each actor has:

- **id**: Unique identifier
- **name**: Human-readable name
- **type**: One of: supplier, producer, distributor, wholesaler, retailer, marketplace
- **capacities**: Array of capacity constraints
- **pricingRules**: Array of pricing rules
- **cooperativeMemberships**: Array of cooperative memberships

#### Actor Types

##### Supplier (S)
Entities that provide raw materials.

```typescript
interface Supplier extends Actor {
  type: 'supplier';
  rawMaterialTypes: string[];
}
```

##### Producer (P)
Entities that manufacture products.

```typescript
interface Producer extends Actor {
  type: 'producer';
  productionCapacity: number;
  productTypes: string[];
}
```

##### Distributor (D)
Entities that distribute goods.

```typescript
interface Distributor extends Actor {
  type: 'distributor';
  coverageArea: string[];
  transportCapacity: number;
}
```

##### Wholesaler (W)
Entities that sell in bulk.

```typescript
interface Wholesaler extends Actor {
  type: 'wholesaler';
  warehouseCapacity: number;
  minimumOrderQuantity: number;
}
```

##### Retailer (R)
Entities that sell to end consumers.

```typescript
interface Retailer extends Actor {
  type: 'retailer';
  storefront: 'physical' | 'online' | 'both';
  serviceArea: string[];
}
```

##### Marketplace (M)
Platforms for multi-vendor sales.

```typescript
interface Marketplace extends Actor {
  type: 'marketplace';
  platform: string;
  commission: number;
  vendorCount: number;
}
```

### Relationships

Relationships connect actors in the supply chain.

```typescript
interface Relationship {
  id: string;
  fromActorId: string;
  toActorId: string;
  type: RelationshipType;
  status: RelationshipStatus;
  contractTerms?: ContractTerms;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationship Types:**
- `supplies`: A supplies materials to B
- `produces_for`: A produces products for B
- `distributes_to`: A distributes to B
- `sells_to`: A sells to B
- `partners_with`: A partners with B
- `competes_with`: A competes with B

**Relationship Status:**
- `active`: Currently active
- `inactive`: Temporarily inactive
- `pending`: Awaiting activation
- `terminated`: Permanently ended

### Products

Products are goods in the supply chain.

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  attributes: ProductAttributes;
  producedBy: string[];
  tags: string[];
}
```

**Product Categories:**
- `raw_material`: Raw materials
- `intermediate`: Partially processed goods
- `finished_good`: Ready for sale
- `service`: Service offerings

### Services

Services provided by actors.

```typescript
interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  providedBy: string;
  sla: ServiceLevelAgreement;
  pricing: {...};
}
```

**Service Types:**
- `transportation`
- `warehousing`
- `processing`
- `packaging`
- `consulting`
- `marketing`

## SupplyChainLookup Class

The main class for querying supply chain entities.

### Constructor

```typescript
const lookup = new SupplyChainLookup();
```

### Methods

#### findActors(query, page?, pageSize?)

Find actors matching the query criteria.

**Parameters:**
- `query: ActorQuery` - Query criteria
  - `type?: ActorType` - Filter by actor type
  - `name?: string` - Search by name (case-insensitive substring match)
  - `cooperativeId?: string` - Filter by cooperative membership
  - `capacityType?: string` - Filter by capacity type
  - `minCapacity?: number` - Minimum capacity value
  - `tags?: string[]` - Filter by tags
- `page?: number` - Page number (default: 1)
- `pageSize?: number` - Results per page (default: 10)

**Returns:** `Promise<LookupResult<SupplyChainActor>>`

**Example:**
```typescript
const suppliers = await lookup.findActors({ type: 'supplier' });
const highCapacity = await lookup.findActors({ 
  capacityType: 'storage', 
  minCapacity: 10000 
});
```

#### findProducts(query, page?, pageSize?)

Find products matching the query criteria.

**Parameters:**
- `query: ProductQuery` - Query criteria
  - `category?: string` - Filter by category
  - `producedBy?: string` - Filter by producer ID
  - `tags?: string[]` - Filter by tags
  - `name?: string` - Search by name
  - `inStock?: boolean` - Filter by availability
- `page?: number` - Page number (default: 1)
- `pageSize?: number` - Results per page (default: 10)

**Returns:** `Promise<LookupResult<Product>>`

**Example:**
```typescript
const finishedGoods = await lookup.findProducts({ 
  category: 'finished_good' 
});
```

#### findRelationships(query, page?, pageSize?)

Find relationships matching the query criteria.

**Parameters:**
- `query: RelationshipQuery` - Query criteria
  - `fromActorId?: string` - Filter by source actor
  - `toActorId?: string` - Filter by target actor
  - `type?: RelationshipType` - Filter by relationship type
  - `status?: string` - Filter by status
- `page?: number` - Page number (default: 1)
- `pageSize?: number` - Results per page (default: 10)

**Returns:** `Promise<LookupResult<Relationship>>`

**Example:**
```typescript
const activeRelations = await lookup.findRelationships({ 
  status: 'active' 
});
```

#### findSupplyChainPath(fromActorId, toActorId)

Find a path between two actors through relationships using breadth-first search.

**Parameters:**
- `fromActorId: string` - Starting actor ID
- `toActorId: string` - Target actor ID

**Returns:** `Promise<string[]>` - Array of actor IDs representing the path

**Example:**
```typescript
const path = await lookup.findSupplyChainPath('s1', 'r1');
// Returns: ['s1', 'p1', 'r1']
```

#### getActorById(id)

Get a specific actor by ID.

**Parameters:**
- `id: string` - Actor ID

**Returns:** `Promise<SupplyChainActor | null>`

**Example:**
```typescript
const actor = await lookup.getActorById('s1');
```

#### getProductById(id)

Get a specific product by ID.

**Parameters:**
- `id: string` - Product ID

**Returns:** `Promise<Product | null>`

#### getServiceById(id)

Get a specific service by ID.

**Parameters:**
- `id: string` - Service ID

**Returns:** `Promise<Service | null>`

#### addActor(actor)

Add an actor to the lookup index.

**Parameters:**
- `actor: SupplyChainActor` - Actor to add

**Example:**
```typescript
lookup.addActor({
  id: 's1',
  name: 'Raw Materials Inc',
  type: 'supplier',
  // ... other properties
});
```

#### addRelationship(relationship)

Add a relationship to the lookup index.

#### addProduct(product)

Add a product to the lookup index.

#### addService(service)

Add a service to the lookup index.

## LookupResult Interface

Result structure for paginated queries.

```typescript
interface LookupResult<T> {
  items: T[];           // Array of results
  total: number;        // Total number of matching items
  page: number;         // Current page number
  pageSize: number;     // Results per page
  hasMore: boolean;     // Whether more pages exist
}
```

## Configuration

### SupplyChainConfig

Configuration object for the supply chain system.

```typescript
interface SupplyChainConfig {
  maxActorsPerType: number;
  maxRelationshipsPerActor: number;
  enableCaching: boolean;
  cacheTTL: number;
  features: {
    dynamicPricing: boolean;
    cooperativeManagement: boolean;
    inventoryTracking: boolean;
    analyticsEnabled: boolean;
  };
  api: {
    rateLimit: number;
    timeout: number;
    version: string;
  };
  validation: {
    requireCooperativeMembership: boolean;
    minPricingRules: number;
    enforceCapacityLimits: boolean;
  };
}
```

### Default Configuration

```typescript
import { defaultConfig } from 'wodog';
```

## Workerd Integration

### Environment Bindings

```typescript
interface Env extends SupplyChainBindings {
  ACTORS?: KVNamespace;
  RELATIONSHIPS?: KVNamespace;
  PRODUCTS?: KVNamespace;
  SERVICES?: KVNamespace;
  SUPPLY_CHAIN_STATE?: DurableObjectNamespace;
  ENVIRONMENT?: string;
  API_VERSION?: string;
  config?: SupplyChainConfig;
}
```

### Worker Example

```typescript
import { SupplyChainLookup, Env } from 'wodog';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const lookup = new SupplyChainLookup();
    
    // Initialize from KV storage
    const actorsData = await env.ACTORS?.get('all-actors');
    
    // Handle requests...
  }
}
```

## Examples

See `src/example.ts` for complete examples including:
- Creating a supply chain
- Querying actors by type
- Finding supply chain paths
- Querying by cooperative membership
