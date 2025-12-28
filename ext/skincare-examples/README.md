# Skincare Supply Chain Examples

Progressive examples demonstrating workerd extensions for skincare businesses, from a simple mobile therapist to a complete multi-tier supply chain.

## Overview

This directory contains 5 comprehensive examples that progressively increase in complexity, demonstrating different scales of skincare business operations and their implementation as workerd extensions.

## Examples Summary

| Example | Complexity | Actors | Key Features |
|---------|-----------|---------|--------------|
| [01-mobile-therapist](./01-mobile-therapist/) | Level 1 - Simplest | 1 | Single operator, basic services |
| [02-small-salon](./02-small-salon/) | Level 2 - Small Business | 1 | Multiple rooms, product line, staff |
| [03-mediclinic](./03-mediclinic/) | Level 3 - Medical Facility | 1 | Medical staff, advanced treatments, Rx products |
| [04-franchise](./04-franchise/) | Level 4 - Multi-Location | 5 | Multiple locations, network coordination |
| [05-supply-chain](./05-supply-chain/) | Level 5 - Full Network | 12 | Complete supply chain, path-finding |

## Example 1: Mobile Therapist

**Complexity**: Level 1 - Simplest (1 actor, basic services)

A solo mobile beauty therapist operating independently with basic treatments.

- **Actor**: 1 mobile therapist
- **Capacity**: 4 clients/day
- **Procedures**: 3 basic treatments
- **Features**: Simple service catalog, capacity management

**Best for**: Freelancers, independent contractors, learning workerd basics

[View Full Documentation →](./01-mobile-therapist/)

## Example 2: Small Salon

**Complexity**: Level 2 - Small Business (1 location, product line)

A boutique salon with multiple treatment rooms and custom-formulated products.

- **Actors**: 1 salon
- **Capacity**: 3 treatment rooms, 4 therapists, 12 clients/day
- **Products**: 4 custom formulations
- **Procedures**: 5 diverse treatments
- **Features**: Product formulation tracking, cost calculation, equipment inventory

**Best for**: Independent salon owners, small business operations

[View Full Documentation →](./02-small-salon/)

## Example 3: Large Mediclinic

**Complexity**: Level 3 - Medical Facility (advanced operations)

A comprehensive medical aesthetics and dermatology clinic with FDA-approved devices and prescription products.

- **Actors**: 1 medical clinic
- **Capacity**: 10 treatment rooms, 3 procedure suites, 26 staff, 40 patients/day
- **Products**: 6 medical-grade formulations (prescription and OTC)
- **Procedures**: 8 advanced medical procedures
- **Features**: Medical clearance tracking, contraindications, downtime management, multi-provider workflows

**Best for**: Medical spas, dermatology clinics, advanced aesthetic centers

[View Full Documentation →](./03-mediclinic/)

## Example 4: Franchise of Stores

**Complexity**: Level 4 - Multi-Location (coordinated operations)

A regional franchise with multiple locations, corporate headquarters, and shared product line.

- **Actors**: 4 franchise locations + 1 corporate HQ
- **Total Capacity**: 23 therapists, 72 clients/day
- **Products**: 4 proprietary branded formulations
- **Procedures**: 5 treatments (some location-specific)
- **Features**: Multi-location coordination, referral networks, franchise analytics, proximity clustering

**Best for**: Franchise operations, regional chains, coordinated multi-site businesses

[View Full Documentation →](./04-franchise/)

## Example 5: Complete Supply Chain

**Complexity**: Level 5 - Full Network (multi-tier supply chain)

A comprehensive 4-tier supply chain from raw material suppliers to end-customer salons.

- **Actors**: 12 total (3 suppliers, 3 producers, 3 distributors, 3 salons)
- **Network Depth**: 3 hops (supplier → producer → distributor → salon)
- **Features**: BFS path-finding, DFS all paths, network topology analysis, product flow tracking, cooperative memberships

**Best for**: Enterprise supply chain management, network optimization, complex multi-tier operations

[View Full Documentation →](./05-supply-chain/)

## Progressive Learning Path

### Start Here: Understanding the Basics
Begin with **Example 1 (Mobile Therapist)** to understand:
- Basic workerd extension structure
- Public and internal modules
- Simple binding pattern
- Basic API endpoints

### Build Up: Adding Complexity
Progress through **Examples 2-3** to learn:
- Product formulation tracking
- Cost calculation with product integration
- Medical-grade operations
- Multi-provider workflows
- Advanced querying and filtering

### Scale Out: Multi-Entity Systems
Advance to **Example 4 (Franchise)** to explore:
- Multiple actor management
- Relationship networks
- Lookup services
- Aggregate analytics
- Location-specific offerings

### Master: Full Supply Chain
Complete with **Example 5** to master:
- Multi-tier network topology
- Path-finding algorithms (BFS/DFS)
- Complex relationship management
- Network depth calculation
- Supply chain visualization

## Common Patterns Across Examples

### Module Structure
All examples follow the same module pattern:
```
{example}::{name}                    # Public API
{example}-internal::impl              # Implementation (hidden)
{example}-internal::{helpers}         # Helper modules (hidden)
{example}::binding                    # Binding module (hidden, internal)
```

### Data Files
Each example includes JSON data files:
- **Actor data**: Business entities (therapists, salons, producers, etc.)
- **Formulations**: Product recipes and ingredients
- **Procedures**: Treatment workflows
- **Relationships**: Connections between actors (examples 4-5)

### API Design
All examples provide REST APIs with:
- Root endpoint with documentation
- Entity retrieval (GET /entity/{id})
- List endpoints (GET /entities)
- Query endpoints with filters
- Relationship navigation
- Cost/capacity calculations

### Capability-Based Security
Each example demonstrates workerd's capability-based security:
- Internal modules hidden from user code
- Environment bindings provide configured objects
- No global fetch or unrestricted access
- Configuration declares all accessible resources

## Running Examples

Each example includes a workerd configuration file:

```bash
# General pattern
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/{example}/{config-file}.capnp

# Example 1: Mobile Therapist
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/01-mobile-therapist/mobile-therapist-config.capnp

# Example 5: Supply Chain
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/05-supply-chain/supply-chain-config.capnp
```

Then query the API:
```bash
curl localhost:8080/
```

## Key Concepts Demonstrated

### 1. Module Encapsulation
- **Public modules**: Importable by user code
- **Internal modules**: Hidden implementation details
- **Binding modules**: Environment initialization

### 2. Data-Driven Configuration
- Business entities defined in JSON
- Relationships as data structures
- Runtime configuration without code changes

### 3. Separation of Concerns
- **Actor management**: Entity lifecycle
- **Lookup services**: Querying and filtering
- **Relationship navigation**: Network traversal
- **Business logic**: Cost calculation, validation

### 4. Progressive Complexity
Each example adds new concepts:
- **Example 1**: Basic structure
- **Example 2**: Products and formulations
- **Example 3**: Medical workflows
- **Example 4**: Multi-entity relationships
- **Example 5**: Network algorithms

### 5. Real-World Modeling
Each example models realistic business scenarios:
- Solo practitioners
- Small businesses
- Medical facilities
- Franchise operations
- Supply chain networks

## Architecture Insights

### Generalized Supply Chain Pattern

These examples implement the **generalized supply chain pattern** described in `/ext/workerd-generalized-scm.md`:

1. **Parameterize roles and services**: Actors defined in data, not code
2. **Model relationships as data**: Adjacency lists in JSON
3. **Capability-based design**: Bindings provide secure resource access
4. **Dynamic lookups**: Query without knowing exact actor count
5. **Path-finding**: Navigate relationships programmatically

### From Simple to Complex

```
Example 1: Single Actor
  └─ Mobile Therapist

Example 2: Actor + Products
  └─ Salon + Formulations

Example 3: Advanced Actor
  └─ Mediclinic + Medical Workflows

Example 4: Multiple Actors + Relationships
  ├─ Store 1
  ├─ Store 2
  ├─ Store 3
  ├─ Store 4
  └─ HQ (coordinates)

Example 5: Multi-Tier Network
  Suppliers (3)
    └→ Producers (3)
        └→ Distributors (3)
            └→ Salons (3)
```

## Comparison Table

| Feature | Example 1 | Example 2 | Example 3 | Example 4 | Example 5 |
|---------|-----------|-----------|-----------|-----------|-----------|
| Total Actors | 1 | 1 | 1 | 5 | 12 |
| Products/Formulations | 0 | 4 | 6 | 4 | N/A |
| Procedures | 3 | 5 | 8 | 5 | N/A |
| Relationships | 0 | 0 | 0 | Multi | Multi-tier |
| Path-Finding | No | No | No | No | Yes (BFS/DFS) |
| Network Analysis | No | No | No | Basic | Advanced |
| Daily Capacity | 4 | 12 | 40 | 72 | 110 |
| Staff | 1 | 4 | 26 | 23 | N/A |
| Lines of Code (approx) | 200 | 400 | 600 | 800 | 1000 |

## Use Cases

### Learning & Education
- **Start with Example 1** for basic workerd concepts
- **Progress through Examples 2-3** for business logic
- **Advance to Examples 4-5** for complex systems

### Business Planning
- **Example 1**: Business plan for solo practitioner
- **Example 2**: Small business expansion planning
- **Example 3**: Medical facility requirements
- **Example 4**: Franchise rollout strategy
- **Example 5**: Supply chain optimization

### Software Development
- **API Design**: REST endpoint patterns
- **Data Modeling**: JSON schema design
- **Algorithm Implementation**: Path-finding, queries
- **Security**: Capability-based access control

## Next Steps

1. **Explore Examples**: Start with Example 1 and work your way up
2. **Run Locally**: Use workerd to run each example
3. **Modify Data**: Edit JSON files to customize business entities
4. **Extend Features**: Add new endpoints or calculations
5. **Create Your Own**: Use these as templates for your domain

## References

- **Generalized Supply Chain Theory**: `/ext/workerd-generalized-scm.md`
- **Existing Supply Chain Example**: `/ext/workerd-ext/supply-chain.capnp`
- **Skincare Extension Design**: `/ext/workerd-extensions-skintwin.md`
- **Implementation Guide**: `/ext/workerd-ext/IMPLEMENTATION.md`

## License

Copyright (c) 2024 Cloudflare, Inc.
Licensed under the Apache 2.0 license found in the LICENSE file or at:
    https://opensource.org/licenses/Apache-2.0
