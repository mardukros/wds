import { Actor, SupplyChainActor } from './actors.js';
import { Relationship } from './relationships.js';
import { Product, Service } from './products.js';

/**
 * Binding types for workerd environment
 */
export interface SupplyChainBindings {
  // KV namespaces for persistence
  ACTORS?: KVNamespace;
  RELATIONSHIPS?: KVNamespace;
  PRODUCTS?: KVNamespace;
  SERVICES?: KVNamespace;
  
  // Durable Objects for state management
  SUPPLY_CHAIN_STATE?: DurableObjectNamespace;
  
  // Environment variables
  ENVIRONMENT?: string;
  API_VERSION?: string;
}

/**
 * Configuration for the supply chain system
 */
export interface SupplyChainConfig {
  // System settings
  maxActorsPerType: number;
  maxRelationshipsPerActor: number;
  enableCaching: boolean;
  cacheTTL: number;
  
  // Feature flags
  features: {
    dynamicPricing: boolean;
    cooperativeManagement: boolean;
    inventoryTracking: boolean;
    analyticsEnabled: boolean;
  };
  
  // API settings
  api: {
    rateLimit: number;
    timeout: number;
    version: string;
  };
  
  // Validation rules
  validation: {
    requireCooperativeMembership: boolean;
    minPricingRules: number;
    enforceCapacityLimits: boolean;
  };
}

/**
 * Default configuration
 */
export const defaultConfig: SupplyChainConfig = {
  maxActorsPerType: 1000,
  maxRelationshipsPerActor: 100,
  enableCaching: true,
  cacheTTL: 3600,
  features: {
    dynamicPricing: true,
    cooperativeManagement: true,
    inventoryTracking: true,
    analyticsEnabled: false,
  },
  api: {
    rateLimit: 100,
    timeout: 30000,
    version: '1.0',
  },
  validation: {
    requireCooperativeMembership: false,
    minPricingRules: 1,
    enforceCapacityLimits: true,
  },
};

/**
 * Environment for workerd
 */
export interface Env extends SupplyChainBindings {
  config?: SupplyChainConfig;
}

// Type for Cloudflare Workers KV
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

// Type for Durable Object namespace
interface DurableObjectNamespace {
  get(id: any): any;
  idFromName(name: string): any;
  idFromString(id: string): any;
}
