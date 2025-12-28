/**
 * Example implementation of the supply chain system
 */

import { SupplyChainLookup } from './lookup.js';
import { Supplier, Producer, Retailer } from './actors.js';
import { Relationship } from './relationships.js';
import { Product } from './products.js';

/**
 * Example: Create a simple supply chain with suppliers, producers, and retailers
 */
export function createExampleSupplyChain(): SupplyChainLookup {
  const lookup = new SupplyChainLookup();

  // Create suppliers
  const supplier1: Supplier = {
    id: 's1',
    name: 'Raw Materials Inc',
    type: 'supplier',
    capacities: [
      { type: 'storage', value: 10000, unit: 'kg' },
      { type: 'delivery', value: 500, unit: 'kg/day' },
    ],
    pricingRules: [
      {
        id: 'pr1',
        name: 'Bulk Pricing',
        type: 'tiered',
        tiers: [
          { minQuantity: 0, maxQuantity: 100, price: 10 },
          { minQuantity: 100, maxQuantity: 500, price: 9 },
          { minQuantity: 500, price: 8 },
        ],
      },
    ],
    cooperativeMemberships: [
      {
        cooperativeId: 'coop1',
        level: 'primary',
        joinedAt: new Date('2023-01-01'),
      },
    ],
    rawMaterialTypes: ['steel', 'aluminum', 'copper'],
  };

  const supplier2: Supplier = {
    id: 's2',
    name: 'Global Resources Ltd',
    type: 'supplier',
    capacities: [
      { type: 'storage', value: 15000, unit: 'kg' },
      { type: 'delivery', value: 800, unit: 'kg/day' },
    ],
    pricingRules: [
      {
        id: 'pr2',
        name: 'Standard Pricing',
        type: 'fixed',
        basePrice: 12,
      },
    ],
    cooperativeMemberships: [],
    rawMaterialTypes: ['plastic', 'rubber', 'glass'],
  };

  // Create producers
  const producer1: Producer = {
    id: 'p1',
    name: 'Manufacturing Co',
    type: 'producer',
    capacities: [
      { type: 'production', value: 1000, unit: 'units/day' },
      { type: 'storage', value: 5000, unit: 'units' },
    ],
    pricingRules: [
      {
        id: 'pr3',
        name: 'Production Cost',
        type: 'percentage',
        percentage: 150,
      },
    ],
    cooperativeMemberships: [
      {
        cooperativeId: 'coop1',
        level: 'secondary',
        joinedAt: new Date('2023-03-15'),
      },
    ],
    productionCapacity: 1000,
    productTypes: ['electronics', 'appliances'],
  };

  // Create retailers
  const retailer1: Retailer = {
    id: 'r1',
    name: 'TechMart',
    type: 'retailer',
    capacities: [
      { type: 'shelf_space', value: 2000, unit: 'units' },
      { type: 'daily_sales', value: 200, unit: 'units/day' },
    ],
    pricingRules: [
      {
        id: 'pr4',
        name: 'Retail Markup',
        type: 'percentage',
        percentage: 180,
      },
    ],
    cooperativeMemberships: [],
    storefront: 'both',
    serviceArea: ['North America', 'Europe'],
  };

  // Add actors to lookup
  lookup.addActor(supplier1);
  lookup.addActor(supplier2);
  lookup.addActor(producer1);
  lookup.addActor(retailer1);

  // Create relationships
  const rel1: Relationship = {
    id: 'rel1',
    fromActorId: 's1',
    toActorId: 'p1',
    type: 'supplies',
    status: 'active',
    contractTerms: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-12-31'),
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOB Origin',
    },
    metadata: {
      monthlyVolume: 10000,
      preferredDeliveryDay: 'Monday',
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const rel2: Relationship = {
    id: 'rel2',
    fromActorId: 'p1',
    toActorId: 'r1',
    type: 'sells_to',
    status: 'active',
    contractTerms: {
      startDate: new Date('2023-06-01'),
      paymentTerms: 'Net 15',
      deliveryTerms: 'Ex Works',
    },
    metadata: {
      exclusiveRegion: 'East Coast',
    },
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
  };

  lookup.addRelationship(rel1);
  lookup.addRelationship(rel2);

  // Create products
  const product1: Product = {
    id: 'prod1',
    name: 'Smart Widget',
    sku: 'SW-001',
    category: 'finished_good',
    description: 'Advanced smart widget with IoT capabilities',
    attributes: {
      weight: 0.5,
      dimensions: { length: 10, width: 8, height: 5 },
      perishable: false,
      certifications: ['CE', 'FCC', 'RoHS'],
    },
    producedBy: ['p1'],
    tags: ['electronics', 'smart-home', 'iot'],
  };

  lookup.addProduct(product1);

  return lookup;
}

/**
 * Example: Query actors by type
 */
export async function exampleQueryActorsByType() {
  const lookup = createExampleSupplyChain();
  
  const suppliers = await lookup.findActors({ type: 'supplier' });
  console.log('Found suppliers:', suppliers.items.length);
  
  const producers = await lookup.findActors({ type: 'producer' });
  console.log('Found producers:', producers.items.length);
  
  return { suppliers, producers };
}

/**
 * Example: Find supply chain path
 */
export async function exampleFindSupplyChainPath() {
  const lookup = createExampleSupplyChain();
  
  const path = await lookup.findSupplyChainPath('s1', 'r1');
  console.log('Supply chain path from s1 to r1:', path);
  
  return path;
}

/**
 * Example: Query actors by cooperative membership
 */
export async function exampleQueryByCooperative() {
  const lookup = createExampleSupplyChain();
  
  const coopMembers = await lookup.findActors({ cooperativeId: 'coop1' });
  console.log('Cooperative members:', coopMembers.items.length);
  
  return coopMembers;
}
