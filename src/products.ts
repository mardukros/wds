/**
 * Product category
 */
export type ProductCategory = 
  | 'raw_material'
  | 'intermediate'
  | 'finished_good'
  | 'service';

/**
 * Product attributes
 */
export interface ProductAttributes {
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  perishable?: boolean;
  shelfLife?: number;
  certifications?: string[];
  [key: string]: any;
}

/**
 * Product in the supply chain
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  attributes: ProductAttributes;
  producedBy: string[]; // actor IDs
  tags: string[];
}

/**
 * Service type
 */
export type ServiceType =
  | 'transportation'
  | 'warehousing'
  | 'processing'
  | 'packaging'
  | 'consulting'
  | 'marketing';

/**
 * Service level agreement
 */
export interface ServiceLevelAgreement {
  responseTime: number;
  availability: number;
  qualityMetrics: Record<string, any>;
}

/**
 * Service offered by an actor
 */
export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  providedBy: string; // actor ID
  sla: ServiceLevelAgreement;
  pricing: {
    baseRate: number;
    currency: string;
    billingCycle: 'hourly' | 'daily' | 'monthly' | 'per_unit';
  };
}

/**
 * Inventory item
 */
export interface InventoryItem {
  productId: string;
  actorId: string;
  quantity: number;
  location: string;
  lastUpdated: Date;
}
