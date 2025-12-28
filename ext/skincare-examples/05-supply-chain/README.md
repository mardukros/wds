# Example 5: Complete Skincare Supply Chain

A comprehensive multi-tier supply chain with 3 actors of each type, demonstrating complex relationships, BFS path-finding, and network analysis.

## Overview

This example showcases:
- **12 Total Actors**: 3 suppliers, 3 producers, 3 distributors, 3 salons
- Complete supply chain from raw materials to end customers
- Multi-tier relationship management
- BFS algorithm for shortest path finding
- DFS algorithm for finding all possible paths
- Network topology analysis
- Product flow tracking
- Cooperative memberships

## Network Structure

### Suppliers (Raw Materials)
1. **Botanical Extracts International** (Portland, OR)
   - Natural ingredients: aloe vera, chamomile, green tea, lavender, rose
   - Organic certified, sustainable sourcing
   - Supplies → PureSkin Labs, Natural Beauty Co

2. **Active Ingredients Corp** (Cambridge, MA)
   - Active compounds: hyaluronic acid, retinol, vitamin C, niacinamide, peptides
   - Pharmaceutical grade, GMP certified
   - Supplies → PureSkin Labs, Dermatech Formulations

3. **Essential Oils & Aromatics** (Grasse, France)
   - Oils and fragrances: jojoba, argan, essential oils
   - Aromatherapy association certified
   - Supplies → PureSkin Labs, Natural Beauty Co

### Producers (Manufacturers)
1. **PureSkin Laboratories** (Newark, NJ)
   - General formulation manufacturer
   - Products: cleansers, moisturizers, serums, masks
   - Capacity: 100,000 units/month
   - Distributes → BeautyChain Logistics, Spa Supply Direct

2. **Dermatech Formulations** (San Diego, CA)
   - Medical-grade manufacturer
   - Products: prescription strength, medical grade, clinical formulations
   - Capacity: 50,000 units/month
   - Distributes → BeautyChain Logistics, MedSpa Distributors

3. **Natural Beauty Co** (Boulder, CO)
   - Organic manufacturer
   - Products: organic skincare, natural cosmetics, aromatherapy
   - Capacity: 75,000 units/month
   - Distributes → Spa Supply Direct

### Distributors (Logistics)
1. **BeautyChain Logistics** (Memphis, TN)
   - National distributor
   - Coverage: USA, Canada
   - Delivery: 2-5 days
   - Serves → Luxe Spa, Dermaclinic Medical Spa

2. **Spa Supply Direct** (Dallas, TX)
   - Specialty distributor
   - Coverage: Southwest USA, Mountain States
   - Delivery: 1-3 days
   - Serves → Luxe Spa, Natural Glow Organic Spa

3. **MedSpa Distributors Inc** (Chicago, IL)
   - Medical distributor
   - Coverage: Midwest USA, East Coast
   - Delivery: 1-2 days
   - Serves → Dermaclinic Medical Spa

### Salons (End Points)
1. **Luxe Spa & Wellness** (New York, NY)
   - Luxury spa
   - 12 treatment rooms, 18 therapists
   - 50 clients/day capacity
   - Receives from → BeautyChain, Spa Supply Direct

2. **Dermaclinic Medical Spa** (Los Angeles, CA)
   - Medical spa
   - 8 treatment rooms, 6 doctors, 10 nurses
   - 35 patients/day capacity
   - Receives from → BeautyChain, MedSpa Distributors

3. **Natural Glow Organic Spa** (Austin, TX)
   - Organic spa
   - 6 treatment rooms, 9 therapists
   - 25 clients/day capacity
   - Member of wellness cooperative
   - Receives from → Spa Supply Direct

## Data Files

- **actors.json** - 12 actors with detailed specifications
- **relationships.json** - Multi-tier relationships and product flows

## Key Features

### Path-Finding Algorithms

1. **BFS (Breadth-First Search)**: Find shortest path between any two actors
   ```
   Example: sup1 → prod1 → dist1 → salon1
   (Botanical Extracts → PureSkin Labs → BeautyChain → Luxe Spa)
   ```

2. **DFS (Depth-First Search)**: Find all possible paths
   ```
   Example paths from sup1 to salon1:
   - sup1 → prod1 → dist1 → salon1
   - sup1 → prod1 → dist2 → salon1
   - sup1 → prod3 → dist2 → salon1
   ```

### Network Analysis

- **Network Depth**: Maximum path length (typically 3 for this chain)
- **Actor Connectivity**: Direct and indirect relationships
- **Supply Chain Visualization**: Complete chain for any salon
- **Product Flow Tracking**: How materials move through the network

### Relationship Types

1. **Forward Relationships**:
   - Supplier → Producer
   - Producer → Distributor
   - Distributor → Salon

2. **Reverse Relationships**:
   - Producer ← Supplier
   - Distributor ← Producer
   - Salon ← Distributor

3. **Product Flows**:
   - Natural ingredients path
   - Active compounds path
   - Oils and aromatics path

## Modules

- **supply-chain:supply-chain** - Public API module
- **supply-chain-internal:impl** - Internal implementation (SkincareSupplyChain class)
- **supply-chain-internal:actors** - Internal actor management (hidden)
- **supply-chain-internal:lookup** - Internal lookup service with BFS/DFS (hidden)
- **supply-chain:binding** - Binding module for environment initialization

## API Endpoints

### Network Overview
- `GET /` - API documentation with network statistics
- `GET /statistics` - Detailed network statistics and depth
- `GET /product-flows` - Product flow information
- `GET /cooperatives` - Cooperative relationship information

### Actor Queries
- `GET /actors` - Get all actors
- `GET /actors?type={type}` - Filter by type (supplier/producer/distributor/salon)
- `GET /actors?subtype={subtype}` - Filter by subtype
- `GET /suppliers` - Get all suppliers
- `GET /producers` - Get all producers
- `GET /distributors` - Get all distributors
- `GET /salons` - Get all salons
- `GET /actor/{id}` - Get specific actor details
- `GET /actor/{id}/connected` - Get all directly connected actors
- `GET /query?type={type}&city={city}&certification={cert}` - Advanced query

### Relationship Queries
- `GET /supplier/{id}/producers` - Get direct producers for supplier
- `GET /producer/{id}/suppliers` - Get direct suppliers for producer
- `GET /producer/{id}/distributors` - Get direct distributors for producer
- `GET /distributor/{id}/salons` - Get direct salons for distributor

### Path-Finding
- `GET /path?from={id}&to={id}` - Find shortest path (BFS)
- `GET /paths?from={id}&to={id}` - Find all paths (DFS)
- `GET /salon/{id}/supply-chain` - Get complete supply chain for salon

## Running the Example

```bash
# With workerd installed
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/05-supply-chain/supply-chain-config.capnp

# Network overview
curl localhost:8080/
curl localhost:8080/statistics

# Query actors
curl localhost:8080/suppliers
curl localhost:8080/producers
curl localhost:8080/distributors
curl localhost:8080/salons
curl localhost:8080/actor/sup1
curl localhost:8080/query?type=supplier&certification=organic_certified

# Explore relationships
curl localhost:8080/supplier/sup1/producers
curl localhost:8080/producer/prod1/distributors
curl localhost:8080/distributor/dist1/salons

# Path-finding
curl "localhost:8080/path?from=sup1&to=salon1"
curl "localhost:8080/paths?from=sup1&to=salon1"
curl localhost:8080/salon/salon1/supply-chain

# Product flows
curl localhost:8080/product-flows
```

## Usage Example

```javascript
import { SkincareSupplyChain } from "supply-chain:supply-chain";

const chain = new SkincareSupplyChain({
  actors: [ /* 12 actors */ ],
  relationships: { /* relationships */ }
});

// Get network statistics
const stats = chain.getNetworkStatistics();
// Returns: { totalActors: 12, actorCounts: {...}, relationshipCounts: {...} }

const depth = chain.calculateNetworkDepth();
// Returns: 3 (supplier → producer → distributor → salon)

// Find shortest path (BFS)
const path = chain.findPath("sup1", "salon1");
// Returns: [supplier_obj, producer_obj, distributor_obj, salon_obj]

// Find all paths (DFS)
const allPaths = chain.getAllPaths("sup1", "salon1");
// Returns: [path1, path2, path3, ...]

// Get complete supply chain for a salon
const salonChain = chain.getSupplyChainForSalon("salon1");
// Returns: { salon, distributors: [...], producers: [...], suppliers: [...] }

// Query actors
const organicSuppliers = chain.queryActors({
  type: "supplier",
  certification: "organic_certified"
});

// Get product flows
const flows = chain.getProductFlows();
// Shows how different products flow through the network
```

## Network Topology

```
SUPPLIERS (3)
├── Botanical Extracts (sup1)
│   ├→ PureSkin Labs (prod1)
│   └→ Natural Beauty Co (prod3)
│
├── Active Ingredients (sup2)
│   ├→ PureSkin Labs (prod1)
│   └→ Dermatech (prod2)
│
└── Essential Oils (sup3)
    ├→ PureSkin Labs (prod1)
    └→ Natural Beauty Co (prod3)

PRODUCERS (3)
├── PureSkin Labs (prod1)
│   ├→ BeautyChain (dist1)
│   └→ Spa Supply Direct (dist2)
│
├── Dermatech (prod2)
│   ├→ BeautyChain (dist1)
│   └→ MedSpa Distributors (dist3)
│
└── Natural Beauty Co (prod3)
    └→ Spa Supply Direct (dist2)

DISTRIBUTORS (3)
├── BeautyChain (dist1)
│   ├→ Luxe Spa (salon1)
│   └→ Dermaclinic (salon2)
│
├── Spa Supply Direct (dist2)
│   ├→ Luxe Spa (salon1)
│   └→ Natural Glow (salon3)
│
└── MedSpa Distributors (dist3)
    └→ Dermaclinic (salon2)

SALONS (3)
├── Luxe Spa (salon1) - Luxury
├── Dermaclinic (salon2) - Medical
└── Natural Glow (salon3) - Organic
```

## Example Paths

### Path 1: Natural Ingredients to Luxury Spa
```
Botanical Extracts → PureSkin Labs → BeautyChain → Luxe Spa
(sup1 → prod1 → dist1 → salon1)
```

### Path 2: Active Compounds to Medical Spa
```
Active Ingredients → Dermatech → MedSpa Distributors → Dermaclinic
(sup2 → prod2 → dist3 → salon2)
```

### Path 3: Essential Oils to Organic Spa
```
Essential Oils → Natural Beauty Co → Spa Supply Direct → Natural Glow
(sup3 → prod3 → dist2 → salon3)
```

## Complexity Level

**Level 5 - Complete Supply Chain** (multi-tier network, path-finding, full complexity)
- 12 actors across 4 tiers
- Complex N:M relationships
- BFS shortest path algorithm
- DFS all paths algorithm
- Network depth calculation
- Product flow tracking
- Reverse relationship queries
- Cooperative memberships
- Multi-modal supply routes
- Network topology analysis
- Suitable for enterprise supply chain management

## Advanced Features

1. **Path-Finding**: BFS for shortest path, DFS for all paths
2. **Network Analysis**: Calculate depth, connectivity, statistics
3. **Product Tracking**: Follow product flows through the network
4. **Relationship Navigation**: Forward and reverse lookups
5. **Cooperative Management**: Track multi-entity cooperatives
6. **Advanced Queries**: Multi-dimensional actor filtering
7. **Supply Chain Visualization**: Complete chain for any salon
8. **Topology Mapping**: Understand network structure
