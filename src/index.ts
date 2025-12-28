/**
 * Generic Supply Chain Implementation for workerd
 * 
 * This module provides a formal specification and implementation for managing
 * supply chain actors, relationships, products, and services in a Cloudflare
 * Workers environment.
 */

// Export actor types and interfaces
export type {
  ActorType,
  CooperativeMembershipLevel,
  CooperativeMembership,
  Capacity,
  PricingRule,
  Actor,
  Supplier,
  Producer,
  Distributor,
  Wholesaler,
  Retailer,
  Marketplace,
  SupplyChainActor,
} from './actors.js';

// Export relationship types and interfaces
export type {
  RelationshipType,
  RelationshipStatus,
  ContractTerms,
  Relationship,
  RelationshipGraph,
} from './relationships.js';

// Export product and service types
export type {
  ProductCategory,
  ProductAttributes,
  Product,
  ServiceType,
  ServiceLevelAgreement,
  Service,
  InventoryItem,
} from './products.js';

// Export configuration and bindings
export type {
  SupplyChainBindings,
  SupplyChainConfig,
  Env,
} from './config.js';

export { defaultConfig } from './config.js';

// Export lookup functionality
export {
  SupplyChainLookup,
} from './lookup.js';

export type {
  ActorQuery,
  ProductQuery,
  RelationshipQuery,
  LookupResult,
} from './lookup.js';

/**
 * Actor sets as defined in the specification:
 * - S = {s₁,…,sₙ} (suppliers)
 * - P = {p₁,…,pₘ} (producers)
 * - D (distributors)
 * - W (wholesalers)
 * - R (retailers)
 * - M (marketplaces)
 */
export interface ActorSets {
  suppliers: Map<string, import('./actors.js').Supplier>;
  producers: Map<string, import('./actors.js').Producer>;
  distributors: Map<string, import('./actors.js').Distributor>;
  wholesalers: Map<string, import('./actors.js').Wholesaler>;
  retailers: Map<string, import('./actors.js').Retailer>;
  marketplaces: Map<string, import('./actors.js').Marketplace>;
}

/**
 * Main SupplyChain class for managing all entities
 */
import { SupplyChainLookup as LookupClass } from './lookup.js';
import { defaultConfig as importedDefaultConfig, SupplyChainConfig } from './config.js';

export class SupplyChain {
  private lookup: LookupClass;
  private config: SupplyChainConfig;

  constructor(config?: Partial<SupplyChainConfig>) {
    this.lookup = new LookupClass();
    this.config = { 
      ...importedDefaultConfig, 
      ...config 
    };
  }

  /**
   * Get the lookup service
   */
  getLookup(): LookupClass {
    return this.lookup;
  }

  /**
   * Get the current configuration
   */
  getConfig(): SupplyChainConfig {
    return this.config;
  }
}
