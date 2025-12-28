/**
 * Types of actors in the supply chain
 */
export type ActorType = 
  | 'supplier' 
  | 'producer' 
  | 'distributor' 
  | 'wholesaler' 
  | 'retailer' 
  | 'marketplace';

/**
 * Cooperative membership levels
 */
export type CooperativeMembershipLevel = 'primary' | 'secondary' | 'tertiary';

/**
 * Cooperative membership reference
 */
export interface CooperativeMembership {
  cooperativeId: string;
  level: CooperativeMembershipLevel;
  joinedAt: Date;
}

/**
 * Capacity constraints for an actor
 */
export interface Capacity {
  type: string;
  value: number;
  unit: string;
}

/**
 * Pricing rule for an actor
 */
export interface PricingRule {
  id: string;
  name: string;
  type: 'fixed' | 'percentage' | 'tiered' | 'dynamic';
  basePrice?: number;
  percentage?: number;
  tiers?: Array<{ minQuantity: number; maxQuantity?: number; price: number }>;
  formula?: string;
}

/**
 * Base actor interface representing any entity in the supply chain
 */
export interface Actor {
  id: string;
  name: string;
  type: ActorType;
  capacities: Capacity[];
  pricingRules: PricingRule[];
  cooperativeMemberships: CooperativeMembership[];
}

/**
 * Supplier actor (S = {s₁,…,sₙ})
 */
export interface Supplier extends Actor {
  type: 'supplier';
  rawMaterialTypes: string[];
}

/**
 * Producer actor (P = {p₁,…,pₘ})
 */
export interface Producer extends Actor {
  type: 'producer';
  productionCapacity: number;
  productTypes: string[];
}

/**
 * Distributor actor (D)
 */
export interface Distributor extends Actor {
  type: 'distributor';
  coverageArea: string[];
  transportCapacity: number;
}

/**
 * Wholesaler actor (W)
 */
export interface Wholesaler extends Actor {
  type: 'wholesaler';
  warehouseCapacity: number;
  minimumOrderQuantity: number;
}

/**
 * Retailer actor (R)
 */
export interface Retailer extends Actor {
  type: 'retailer';
  storefront: 'physical' | 'online' | 'both';
  serviceArea: string[];
}

/**
 * Marketplace actor (M)
 */
export interface Marketplace extends Actor {
  type: 'marketplace';
  platform: string;
  commission: number;
  vendorCount: number;
}

/**
 * Union type for all actor types
 */
export type SupplyChainActor = 
  | Supplier 
  | Producer 
  | Distributor 
  | Wholesaler 
  | Retailer 
  | Marketplace;
