# Example 3: Large Mediclinic

A comprehensive medical aesthetics and dermatology clinic with advanced treatments and medical-grade products.

## Overview

This example showcases:
- Large medical facility with 10 treatment rooms and 3 procedure suites
- Multi-disciplinary team: 8 doctors, 12 nurses, 6 estheticians
- Medical-grade and prescription-strength formulations
- Advanced laser and device-based treatments
- Comprehensive certifications and medical protocols
- Capacity for 40 patients per day

## Business Model

**Advanced Dermatology & Aesthetics Center** in Boston, MA:
- Medical Director: Dr. Elizabeth Morgan, MD
- Board-certified dermatologists and medical staff
- FDA-approved medical devices
- HIPAA compliant facility
- Insurance accepted for medical dermatology
- Operating Hours: Weekdays 7 AM - 8 PM, Weekends 9 AM - 5 PM

## Data Files

- **clinic.json** - Medical clinic with detailed staff, equipment, and certifications
- **formulations.json** - 6 medical-grade formulations (prescription and OTC)
- **procedures.json** - 8 advanced medical procedures

## Medical-Grade Product Line

1. **Medical Grade Retinol Cream** - Prescription (1% retinol, $45)
2. **TCA Chemical Peel Solution** - Prescription (20% TCA, $35)
3. **Hydroquinone Brightening Serum** - Prescription (4% hydroquinone, $40)
4. **Post-Procedure Recovery Gel** - Medical grade ($28)
5. **Clinical Vitamin C Serum** - Medical grade (20% L-Ascorbic, $35)
6. **Prescription Acne Treatment** - Prescription (10% benzoyl peroxide, $32)

## Treatment Menu

1. **Fractional CO2 Laser Resurfacing** - 90 min, $1,200 (deep wrinkles/scars)
2. **Medical Grade Chemical Peel** - 60 min, $450 (TCA peel)
3. **Microneedling with RF** - 75 min, $800 (collagen induction)
4. **Medical Consultation & Treatment Plan** - 45 min, $250
5. **IPL Photofacial** - 45 min, $400 (pigmentation/vascular)
6. **Injectable Consultation & Treatment** - 60 min, $600 (Botox/fillers)
7. **Medical Acne Treatment Program** - 30 min, $180
8. **Advanced Anti-Aging Protocol** - 120 min, $1,500 (multi-modal)

## Advanced Features

- **Medical Clearance Requirements**: Some procedures require medical assessment
- **Contraindications Tracking**: Each procedure lists medical contraindications
- **Downtime Management**: Procedures include recovery time estimates
- **Provider Specialization**: Steps specify required provider type (doctor/nurse/esthetician)
- **Follow-up Protocols**: Tracks which procedures require follow-up visits
- **Emergency Protocols**: Full medical emergency response capability

## Modules

- **mediclinic:mediclinic** - Public API module
- **mediclinic-internal:impl** - Internal implementation (Mediclinic class)
- **mediclinic:binding** - Binding module for environment initialization

## API Endpoints

- `GET /` - API documentation
- `GET /clinic` - Get complete clinic information
- `GET /capacity` - Get clinic capacity and staffing details
- `GET /equipment` - Get medical equipment list
- `GET /specialties` - Get clinic specialties
- `GET /certifications` - Get clinic certifications
- `GET /formulations` - Get all formulations
- `GET /formulations/prescription` - Get prescription-only products
- `GET /formulations/otc` - Get over-the-counter products
- `GET /formulations?type={type}` - Filter by type
- `GET /formulations?concern={concern}` - Filter by skin concern
- `GET /formulation/{id}` - Get specific formulation
- `GET /procedures` - Get all procedures
- `GET /procedures?category={category}` - Filter by category
- `GET /procedures?consultation=true` - Get consultation-required
- `GET /procedures?maxDowntime={days}` - Filter by downtime
- `GET /procedures?minPrice={min}&maxPrice={max}` - Filter by price
- `GET /procedures?provider={type}` - Filter by provider type
- `GET /procedure/{id}` - Get specific procedure
- `GET /procedure/{id}/cost` - Calculate total procedure cost

## Running the Example

```bash
# With workerd installed
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skincare-examples/03-mediclinic/mediclinic-config.capnp

# Query the API
curl localhost:8080/
curl localhost:8080/clinic
curl localhost:8080/capacity
curl localhost:8080/equipment
curl localhost:8080/formulations/prescription
curl localhost:8080/procedures?category=laser_treatment
curl localhost:8080/procedure/proc1
curl localhost:8080/procedure/proc1/cost
curl localhost:8080/procedures?maxDowntime=3
```

## Usage Example

```javascript
import { Mediclinic } from "mediclinic:mediclinic";

const clinic = new Mediclinic({
  clinic: { /* clinic data */ },
  formulations: [ /* formulations */ ],
  procedures: [ /* procedures */ ]
});

// Check medical capabilities
const hasLaser = clinic.hasSpecialty("laser_therapy");
const equipment = clinic.getEquipment();

// Get prescription products
const rxProducts = clinic.getPrescriptionFormulations();

// Find minimal downtime procedures
const quickProcedures = clinic.findProceduresByDowntime(2);

// Calculate comprehensive costs
const cost = clinic.calculateProcedureCost("proc8");
// Returns: basePrice, productCost, totalCost, requiresConsultation, etc.
```

## Key Features

- **Medical-Grade Products**: Prescription and OTC formulations with detailed ingredients
- **Advanced Procedures**: Laser, RF, IPL, injectables, and combination treatments
- **Medical Protocols**: Consultation requirements, contraindications, downtime tracking
- **Multi-Provider Workflow**: Procedures specify doctor, nurse, or esthetician for each step
- **Comprehensive Equipment**: State-of-the-art medical devices and treatment systems
- **Regulatory Compliance**: FDA approval, HIPAA compliance, board certifications

## Complexity Level

**Level 3 - Medical Facility** (large operation, medical staff, advanced technology)
- Multi-disciplinary medical team
- Prescription-strength products
- Advanced medical devices
- Regulatory compliance requirements
- Medical clearance protocols
- Insurance acceptance
- Emergency protocols
- Suitable for medical aesthetic clinics and dermatology practices
