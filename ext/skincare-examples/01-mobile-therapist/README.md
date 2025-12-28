# Example 1: Mobile Therapist

This is the simplest example demonstrating a single mobile beauty therapist operating independently.

## Overview

This example showcases:
- Single mobile therapist with basic information
- Limited service capacity (4 clients per day)
- 3 basic procedures: Express Facial, Relaxation Massage, and Combo treatment
- Minimal module structure suitable for independent operators

## Business Model

**Sarah's Mobile Beauty** is a solo mobile therapist operating in Downtown Manhattan:
- Owner/Operator: Sarah Johnson
- Service Area: Downtown Manhattan
- Specialties: Basic facials, massage, mobile service
- Certifications: Licensed Esthetician, Massage Therapy
- Capacity: 4 clients per day, 30 hours per week

## Data Files

- **therapist.json** - Single mobile therapist actor
- **procedures.json** - 3 basic treatment procedures

## Modules

- **mobile-therapist:mobile-therapist** - Public API module
- **mobile-therapist-internal:impl** - Internal implementation (MobileTherapist class)
- **mobile-therapist:binding** - Binding module for environment initialization

## API Endpoints

- `GET /` - API documentation
- `GET /therapist` - Get therapist information
- `GET /procedures` - Get all procedures
- `GET /procedure/{id}` - Get specific procedure details
- `GET /procedures?minDuration={min}&maxDuration={max}` - Find procedures by duration range
- `GET /procedures?minPrice={min}&maxPrice={max}` - Find procedures by price range
- `GET /capacity` - Get daily capacity information

## Running the Example

```bash
# With workerd installed
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/01-mobile-therapist/mobile-therapist-config.capnp

# Query the API
curl localhost:8080/
curl localhost:8080/therapist
curl localhost:8080/procedures
curl localhost:8080/procedure/proc1
curl localhost:8080/procedures?minDuration=30&maxDuration=60
curl localhost:8080/capacity
```

## Usage Example

```javascript
import { MobileTherapist } from "mobile-therapist:mobile-therapist";

const therapist = new MobileTherapist({
  therapist: { /* therapist data */ },
  procedures: [ /* procedures */ ]
});

// Get therapist info
const info = therapist.getTherapist();

// Get available procedures
const procedures = therapist.getProcedures();

// Check capacity
const capacity = therapist.calculateDailyCapacity();
```

## Complexity Level

**Level 1 - Simplest** (1 actor, basic services)
- Single independent operator
- No complex relationships
- Basic service catalog
- Limited capacity management
- Suitable for freelancers and independent contractors
