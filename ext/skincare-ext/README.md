# Skincare Extension

This directory contains a complete skincare-specific workerd extension implementation following the pattern demonstrated in the workerd-ext supply chain example.

## Overview

The skincare extension demonstrates workerd's capability-based security model and module system applied to a skincare business with multiple treatment salons and a production plant for skincare products.

## Modules and Structure

- **skincare-brand:skincare** - Public API module that can be imported by users
- **skincare-brand-internal:skincare-impl** - Internal implementation of SkincareBrand class
- **skincare-brand-internal:salon** - Internal salon and plant actor management
- **skincare-brand-internal:formulations** - Internal product formulation queries
- **skincare-brand-internal:procedures** - Internal treatment procedure management
- **skincare-brand:binding** - Binding module for environment initialization

## Configuration Files

The extension uses:
- `formulations.json` - Product ingredient lists and formulations (moisturizers, serums, cleansers, night creams)
- `procedures.json` - Treatment procedures for multiple salons with steps and durations
- `salons.json` - Salon and production plant data with locations, capacities, and specialties
- `skincare.capnp` - Extension definition with module declarations
- `skincare-config.capnp` - Worker configuration with bindings

## Implementation Status

✅ **Fully Implemented** - Complete working implementation with all features.

## Data Structure

### Salons
The extension includes 3 salons and 1 production plant:
- **Serenity Spa Downtown** - Specializes in facials, chemical peels, and skincare consultation
- **Radiance Beauty Center** - Luxury facials, massage therapy, LED treatments
- **Eternal Youth Med Spa** - Medical-grade treatments, anti-aging, laser therapy
- **Pure Formulations Lab** - Production plant for creating skincare products

### Formulations
4 product formulations with detailed ingredient breakdowns:
- Hydrating Moisturizer - For dry, normal, and combination skin
- Vitamin C Serum - Brightening and anti-oxidant for all skin types
- Gentle Cleanser - For sensitive, dry, and normal skin
- Anti-Aging Night Cream - For mature and dry skin

### Procedures
6 treatment procedures across the salons:
- Signature Facial (80 min, $120)
- Chemical Peel (60 min, $180)
- Deluxe Facial (80 min, $150)
- Relaxation Massage (70 min, $110)
- Anti-Aging Treatment (85 min, $200)
- Hydration Boost (60 min, $95)

## API Endpoints

The worker provides the following REST endpoints:

- `GET /` - API documentation
- `GET /salon/{id}` - Get specific salon by ID
- `GET /salons` - Get all salons
- `GET /salon/{id}/procedures` - Get procedures for a specific salon
- `GET /procedure/{id}` - Get procedure details with calculated cost
- `GET /formulation/{id}` - Get formulation details
- `GET /formulations?type={type}&skinType={skinType}` - Query formulations
- `GET /procedures?skinType={type}&minDuration={min}&maxDuration={max}` - Query procedures
- `GET /query/salons?specialty={specialty}&city={city}&cooperative={id}` - Query salons

## Usage Examples

### Direct API Usage

```javascript
import { SkincareBrand } from "skincare-brand:skincare";

const brand = new SkincareBrand({
  salons: [...],
  formulations: [...],
  procedures: [...]
});

const salon = brand.getSalon('salon1');
const procedures = brand.getSalonProcedures('salon1');
const cost = brand.calculateProcedureCost('proc1');
```

### Environment Binding Usage

```javascript
export default {
  async fetch(req, env) {
    // Access pre-configured skincare brand from environment
    const salon = env.skincareBrand.getSalon('salon1');
    const procedures = env.skincareBrand.getSalonProcedures('salon1');
    
    return new Response(JSON.stringify(salon));
  }
};
```

## Running the Extension

With workerd installed and configured:

```bash
# Start the worker
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-ext/skincare-config.capnp

# Query the API
curl localhost:8080/salons
curl localhost:8080/salon/salon1
curl localhost:8080/salon/salon1/procedures
curl localhost:8080/procedure/proc1
curl localhost:8080/formulation/f1
curl localhost:8080/formulations?skinType=dry
curl localhost:8080/query/salons?specialty=facials
```

## Comparison with Supply Chain

The skincare extension follows the same architectural pattern as the supply chain extension but specialized for:
- Multiple treatment salons instead of generic supply chain actors
- Product formulations with detailed ingredient breakdowns
- Treatment procedures with step-by-step workflows
- Salon-specific capabilities, specialties, and certifications
- Cooperative memberships for wellness cooperatives

Both extensions demonstrate:
- **Module encapsulation** - Internal modules hide implementation details
- **Capability-based security** - Bindings enforce resource access control
- **Separation of concerns** - Clear module responsibilities
- **Data-driven configuration** - JSON files define business entities
- **Type safety** - Structured data types with validation

See the [supply chain implementation](../workerd-ext/supply-chain.capnp) for the original pattern that inspired this extension.
