/**
 * Types of relationships between actors
 */
export type RelationshipType =
  | 'supplies'
  | 'produces_for'
  | 'distributes_to'
  | 'sells_to'
  | 'partners_with'
  | 'competes_with';

/**
 * Status of a relationship
 */
export type RelationshipStatus = 'active' | 'inactive' | 'pending' | 'terminated';

/**
 * Contract terms for a relationship
 */
export interface ContractTerms {
  startDate: Date;
  endDate?: Date;
  renewalTerms?: string;
  paymentTerms: string;
  deliveryTerms: string;
}

/**
 * Relationship between two actors in the supply chain
 */
export interface Relationship {
  id: string;
  fromActorId: string;
  toActorId: string;
  type: RelationshipType;
  status: RelationshipStatus;
  contractTerms?: ContractTerms;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Graph representation of relationships
 */
export interface RelationshipGraph {
  relationships: Map<string, Relationship>;
  
  /**
   * Get all relationships for a specific actor
   */
  getRelationshipsForActor(actorId: string): Relationship[];
  
  /**
   * Get relationships by type
   */
  getRelationshipsByType(type: RelationshipType): Relationship[];
  
  /**
   * Find path between two actors
   */
  findPath(fromActorId: string, toActorId: string): string[];
}
