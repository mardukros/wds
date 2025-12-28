# Example 4: Franchise of Stores

A multi-location franchise operation with coordinated management, shared product lines, and referral networks.

## Overview

This example showcases:
- 4 franchise locations plus corporate headquarters
- Coordinated operations across multiple sites
- Shared proprietary product formulations
- Location-specific and franchise-standard procedures
- Relationship management (referrals, training, inventory distribution)
- Franchise-wide analytics and capacity tracking

## Business Model

**Radiance Spa & Beauty** franchise in the Seattle/Bellevue area:
- **4 Franchise Locations**: Different levels (flagship, premium, standard, express)
- **Corporate HQ**: Central support, training, product distribution
- **Total Capacity**: 72 clients per day across all locations
- **Total Staff**: 23 therapists plus corporate team
- **Proprietary Product Line**: Exclusive "Radiance" branded formulations

## Locations

1. **Downtown (Flagship)** - Seattle
   - 5 treatment rooms, 6 therapists
   - 20 clients/day capacity
   - Full service menu

2. **Northgate (Standard)** - Seattle
   - 4 treatment rooms, 5 therapists
   - 16 clients/day capacity
   - Standard services

3. **Bellevue (Premium)** - Bellevue
   - 6 treatment rooms, 8 therapists
   - 24 clients/day capacity
   - Premium and couples services

4. **Capitol Hill (Express)** - Seattle
   - 3 treatment rooms, 4 therapists
   - 12 clients/day capacity
   - Quick services focus

5. **Corporate HQ** - Seattle
   - Central management and support
   - Training programs
   - Product distribution center

## Data Files

- **locations.json** - 5 locations (4 stores + HQ) with detailed info
- **relationships.json** - Network relationships (referrals, training, support, inventory)
- **formulations.json** - 4 proprietary branded formulations
- **procedures.json** - 5 treatment procedures (some location-specific)

## Proprietary Product Line

1. **Radiance Signature Moisturizer** - All skin types ($45 retail)
2. **Radiance Gentle Cleanser** - Signature formula ($32 retail)
3. **Radiance Brightening Serum** - Exclusive formula ($65 retail)
4. **Radiance Eye Treatment** - Specialized care ($48 retail)

## Treatment Menu

1. **Radiance Signature Facial** - 60 min, $95 (all locations)
2. **Express Radiance Facial** - 30 min, $55 (all locations)
3. **Radiance Deluxe Treatment** - 90 min, $150 (flagship & premium only)
4. **Couples Radiance Experience** - 75 min, $220 (premium only)
5. **Back Facial Treatment** - 45 min, $75 (all locations)

## Relationship Features

- **Referral Network**: All locations can refer clients to each other
- **Training Programs**: HQ provides ongoing training to all locations
- **Inventory Distribution**: Weekly product delivery from HQ
- **Proximity Clusters**: Seattle cluster (3 stores), Bellevue cluster (1 store)
- **Support Structure**: HQ provides operational support to all locations

## Modules

- **franchise:franchise** - Public API module
- **franchise-internal:impl** - Internal implementation (Franchise class)
- **franchise-internal:lookup** - Internal lookup service (hidden)
- **franchise:binding** - Binding module for environment initialization

## API Endpoints

- `GET /` - API documentation with franchise statistics
- `GET /locations` - Get all franchise locations
- `GET /location/{id}` - Get specific location details
- `GET /location/{id}/capacity` - Get location capacity
- `GET /location/{id}/procedures` - Get procedures at location
- `GET /location/{id}/nearby` - Get nearby locations in same cluster
- `GET /location/{id}/referrals` - Get referral network
- `GET /hq` - Get headquarters information
- `GET /statistics` - Get franchise-wide statistics
- `GET /capacity` - Get total franchise capacity
- `GET /query/locations?city={city}&level={level}&specialty={specialty}` - Query locations
- `GET /formulations` - Get all formulations
- `GET /formulation/{id}` - Get specific formulation
- `GET /procedures` - Get all procedures
- `GET /procedures/standard` - Get franchise standard procedures only
- `GET /procedures/common?locations={id1,id2}` - Find procedures at multiple locations
- `GET /procedure/{id}` - Get specific procedure
- `GET /procedure/{id}/cost` - Calculate procedure cost

## Running the Example

```bash
# With workerd installed
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/04-franchise/franchise-config.capnp

# Query the API
curl localhost:8080/
curl localhost:8080/statistics
curl localhost:8080/locations
curl localhost:8080/location/store1
curl localhost:8080/location/store1/nearby
curl localhost:8080/location/store1/referrals
curl localhost:8080/query/locations?city=Seattle
curl localhost:8080/query/locations?level=premium
curl localhost:8080/procedures/standard
curl localhost:8080/procedures/common?locations=store1,store2
```

## Usage Example

```javascript
import { Franchise } from "franchise:franchise";

const franchise = new Franchise({
  locations: [ /* locations */ ],
  formulations: [ /* formulations */ ],
  procedures: [ /* procedures */ ],
  relationships: { /* relationships */ }
});

// Get franchise statistics
const stats = franchise.getStatistics();
// Returns: { totalLocations, totalStaff, totalDailyCapacity, cities, levels }

// Find locations
const seattleStores = franchise.findLocationsByCity("Seattle");
const premiumStores = franchise.findLocationsByLevel("premium");

// Get network relationships
const nearby = franchise.getNearbyLocations("store1");
const referrals = franchise.getReferralNetwork("store1");

// Find common procedures
const commonProcs = franchise.findCommonProcedures(["store1", "store2"]);

// Calculate total capacity
const totalCapacity = franchise.getTotalCapacity();
```

## Key Features

- **Multi-Location Management**: Track and query multiple franchise locations
- **Franchise Levels**: Different service tiers (flagship, premium, standard, express)
- **Relationship Networks**: Referrals, training, support, and inventory relationships
- **Proximity Clustering**: Geographic grouping for operational efficiency
- **Shared Product Line**: Proprietary branded formulations exclusive to franchise
- **Location-Specific Services**: Some procedures available only at certain locations
- **Franchise Analytics**: Aggregate statistics and capacity tracking
- **Lookup Service**: Advanced querying by city, level, specialty, capacity

## Complexity Level

**Level 4 - Multi-Location Franchise** (coordinated operations, network relationships)
- Multiple franchise locations
- Central headquarters coordination
- Shared product line and branding
- Referral and support networks
- Franchise-wide analytics
- Location-specific offerings
- Geographic clustering
- Suitable for regional franchise operations
