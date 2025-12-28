# Example 2: Small Salon

A single-location salon with multiple treatment rooms and a product line.

## Overview

This example showcases:
- Single salon location with 3 treatment rooms
- 4 staff therapists serving up to 12 clients per day
- Custom formulated product line (4 formulations)
- 5 diverse treatment procedures
- Equipment and certification tracking

## Business Model

**Glow Skincare Studio** is a boutique salon in Portland, OR:
- Owner: Michelle Chen
- Capacity: 3 treatment rooms, 4 therapists, 12 clients/day
- Specialties: Facials, chemical peels, microdermabrasion, skincare consultation
- Product Line: Custom formulated in-house products
- Operating Hours: Weekdays 10 AM - 7 PM, Weekends 11 AM - 5 PM

## Data Files

- **salon.json** - Single salon with detailed capacity and equipment info
- **formulations.json** - 4 skincare product formulations with ingredients
- **procedures.json** - 5 treatment procedures with product integration

## Product Line

1. **Hydrating Day Cream** - Daily moisturizer ($8.50)
2. **Gentle Cleansing Gel** - Sulfate-free cleanser ($6.00)
3. **Brightening Serum** - Vitamin C serum ($12.00)
4. **Exfoliating Mask** - AHA/BHA treatment mask ($10.00)

## Treatment Menu

1. **Classic Facial** - 60 min, $85 (complete treatment for all skin types)
2. **Express Glow Facial** - 30 min, $55 (quick brightening)
3. **Deep Cleansing Treatment** - 75 min, $95 (for oily/acne-prone)
4. **Hydration Boost Facial** - 60 min, $90 (for dry/dehydrated)
5. **Anti-Aging Rejuvenation** - 90 min, $120 (comprehensive anti-aging)

## Modules

- **small-salon:small-salon** - Public API module
- **small-salon-internal:impl** - Internal implementation (SmallSalon class)
- **small-salon:binding** - Binding module for environment initialization

## API Endpoints

- `GET /` - API documentation
- `GET /salon` - Get salon information
- `GET /capacity` - Get salon capacity details
- `GET /equipment` - Get available equipment list
- `GET /formulations` - Get all formulations
- `GET /formulations?type={type}` - Filter formulations by type
- `GET /formulations?skinType={type}` - Filter by skin type
- `GET /formulation/{id}` - Get specific formulation with ingredients
- `GET /procedures` - Get all procedures
- `GET /procedures?minDuration={min}&maxDuration={max}` - Filter by duration
- `GET /procedures?skinType={type}` - Filter by skin type
- `GET /procedure/{id}` - Get specific procedure details
- `GET /procedure/{id}/cost` - Calculate procedure cost including products

## Running the Example

```bash
# With workerd installed
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/02-small-salon/small-salon-config.capnp

# Query the API
curl localhost:8080/
curl localhost:8080/salon
curl localhost:8080/capacity
curl localhost:8080/formulations
curl localhost:8080/formulations?skinType=dry
curl localhost:8080/procedures
curl localhost:8080/procedure/proc1
curl localhost:8080/procedure/proc1/cost
```

## Usage Example

```javascript
import { SmallSalon } from "small-salon:small-salon";

const salon = new SmallSalon({
  salon: { /* salon data */ },
  formulations: [ /* formulations */ ],
  procedures: [ /* procedures */ ]
});

// Get salon info
const info = salon.getSalon();
const capacity = salon.getCapacity();

// Query products
const moisturizers = salon.findFormulationsByType("moisturizer");
const drySkinnFormulas = salon.findFormulationsBySkinType("dry");

// Calculate procedure costs
const cost = salon.calculateProcedureCost("proc1");
// Returns: { basePrice, productCost, totalCost, duration }
```

## Key Features

- **Product Integration**: Procedures reference formulations for cost calculation
- **Capacity Management**: Track treatment rooms, staff, and daily client limits
- **Equipment Tracking**: Specialized equipment list (steamer, LED light, etc.)
- **Flexible Queries**: Filter by skin type, product type, duration, price

## Complexity Level

**Level 2 - Small Business** (1 location, product line, staff management)
- Single location operations
- Product formulation tracking
- Staff and capacity management
- Equipment inventory
- Suitable for independent salon owners
