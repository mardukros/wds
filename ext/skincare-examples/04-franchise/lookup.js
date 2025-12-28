// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal lookup service - hidden from user code

export function createLookupService(locations, relationships) {
  const locationMap = new Map(locations.map(l => [l.id, l]));

  return {
    // Find locations by city
    findByCity(city) {
      return locations.filter(l => l.location?.city === city);
    },

    // Find locations by franchise level
    findByLevel(level) {
      return locations.filter(l => l.franchiseLevel === level);
    },

    // Find locations by specialty
    findBySpecialty(specialty) {
      return locations.filter(l => 
        l.type === "franchise_location" && l.specialties?.includes(specialty)
      );
    },

    // Get all franchise locations (excluding HQ)
    getAllStores() {
      return locations.filter(l => l.type === "franchise_location");
    },

    // Get headquarters
    getHeadquarters() {
      return locations.find(l => l.type === "corporate_headquarters");
    },

    // Get referral network for a location
    getReferralNetwork(locationId) {
      return relationships.referralNetwork?.[locationId] || [];
    },

    // Get locations supported by HQ
    getHQSupportedLocations() {
      const hq = this.getHeadquarters();
      if (!hq) return [];
      return relationships.supportRelationships?.hq_to_stores?.[hq.id] || [];
    },

    // Find nearby locations (same cluster)
    findNearbyLocations(locationId) {
      const location = locationMap.get(locationId);
      if (!location) return [];

      // Find cluster containing this location
      for (const [cluster, locationIds] of Object.entries(relationships.proximityRelationships || {})) {
        if (locationIds.includes(locationId)) {
          return locationIds.filter(id => id !== locationId).map(id => locationMap.get(id));
        }
      }
      return [];
    },

    // Calculate total franchise capacity
    getTotalCapacity() {
      const stores = this.getAllStores();
      return stores.reduce((totals, store) => {
        if (store.capacities) {
          for (const cap of store.capacities) {
            if (!totals[cap.type]) {
              totals[cap.type] = { value: 0, unit: cap.unit };
            }
            totals[cap.type].value += cap.value;
          }
        }
        return totals;
      }, {});
    },

    // Get franchise statistics
    getStatistics() {
      const stores = this.getAllStores();
      return {
        totalLocations: stores.length,
        totalStaff: stores.reduce((sum, s) => {
          const staff = s.capacities?.find(c => c.type === "staff");
          return sum + (staff?.value || 0);
        }, 0),
        totalDailyCapacity: stores.reduce((sum, s) => {
          const capacity = s.capacities?.find(c => c.type === "clients_per_day");
          return sum + (capacity?.value || 0);
        }, 0),
        cities: [...new Set(stores.map(s => s.location?.city))],
        franchiseLevels: [...new Set(stores.map(s => s.franchiseLevel))]
      };
    }
  };
}
