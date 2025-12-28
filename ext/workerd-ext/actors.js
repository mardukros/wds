// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal actors module - handles actor creation and management

// Actor types: supplier, producer, distributor, wholesaler, retailer, marketplace

export function createActor(data) {
  // Validate required fields
  if (!data.id || !data.name || !data.type) {
    throw new Error('Actor must have id, name, and type');
  }

  // Create base actor
  const actor = {
    id: data.id,
    name: data.name,
    type: data.type,
    capacities: data.capacities || [],
    pricingRules: data.pricingRules || [],
    cooperativeMemberships: data.cooperativeMemberships || [],
  };

  // Add type-specific properties
  switch (data.type) {
    case 'supplier':
      actor.rawMaterialTypes = data.rawMaterialTypes || [];
      break;
    case 'producer':
      actor.productionCapacity = data.productionCapacity || 0;
      actor.productTypes = data.productTypes || [];
      break;
    case 'distributor':
      actor.coverageArea = data.coverageArea || [];
      actor.transportCapacity = data.transportCapacity || 0;
      break;
    case 'wholesaler':
      actor.warehouseCapacity = data.warehouseCapacity || 0;
      actor.minimumOrderQuantity = data.minimumOrderQuantity || 0;
      break;
    case 'retailer':
      actor.storefront = data.storefront || 'physical';
      actor.serviceArea = data.serviceArea || [];
      break;
    case 'marketplace':
      actor.platform = data.platform || '';
      actor.commission = data.commission || 0;
      actor.vendorCount = data.vendorCount || 0;
      break;
    default:
      throw new Error(`Unknown actor type: ${data.type}`);
  }

  return actor;
}

// Calculate price for an actor based on quantity
export function calculatePrice(actor, quantity) {
  if (!actor.pricingRules || actor.pricingRules.length === 0) {
    return 0;
  }

  // Use the first pricing rule (simplified)
  const rule = actor.pricingRules[0];
  
  if (rule.type === 'fixed') {
    return rule.basePrice * quantity;
  } else if (rule.type === 'tiered' && rule.tiers) {
    // Find the appropriate tier
    for (const tier of rule.tiers) {
      if (quantity >= tier.minQuantity && 
          (!tier.maxQuantity || quantity <= tier.maxQuantity)) {
        return tier.price * quantity;
      }
    }
    // If no tier matches, use the last tier
    return rule.tiers[rule.tiers.length - 1].price * quantity;
  }

  return 0;
}
