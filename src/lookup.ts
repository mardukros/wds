import { SupplyChainActor, ActorType } from './actors.js';
import { Relationship, RelationshipType } from './relationships.js';
import { Product, Service } from './products.js';

/**
 * Query criteria for actor lookup
 */
export interface ActorQuery {
  type?: ActorType;
  name?: string;
  cooperativeId?: string;
  capacityType?: string;
  minCapacity?: number;
  tags?: string[];
}

/**
 * Query criteria for product lookup
 */
export interface ProductQuery {
  category?: string;
  producedBy?: string;
  tags?: string[];
  name?: string;
  inStock?: boolean;
}

/**
 * Query criteria for relationship lookup
 */
export interface RelationshipQuery {
  fromActorId?: string;
  toActorId?: string;
  type?: RelationshipType;
  status?: string;
}

/**
 * Lookup result with pagination
 */
export interface LookupResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Dynamic lookup service for supply chain entities
 */
export class SupplyChainLookup {
  private actors: Map<string, SupplyChainActor>;
  private relationships: Map<string, Relationship>;
  private products: Map<string, Product>;
  private services: Map<string, Service>;

  constructor() {
    this.actors = new Map();
    this.relationships = new Map();
    this.products = new Map();
    this.services = new Map();
  }

  /**
   * Find actors matching the query criteria
   */
  async findActors(
    query: ActorQuery,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LookupResult<SupplyChainActor>> {
    let results = Array.from(this.actors.values());

    // Apply filters
    if (query.type) {
      results = results.filter(actor => actor.type === query.type);
    }
    if (query.name) {
      const lowerName = query.name.toLowerCase();
      results = results.filter(actor => 
        actor.name.toLowerCase().includes(lowerName)
      );
    }
    if (query.cooperativeId) {
      results = results.filter(actor =>
        actor.cooperativeMemberships.some(
          m => m.cooperativeId === query.cooperativeId
        )
      );
    }
    if (query.capacityType && query.minCapacity !== undefined) {
      results = results.filter(actor =>
        actor.capacities.some(
          c => c.type === query.capacityType && c.value >= query.minCapacity!
        )
      );
    }

    // Pagination
    const total = results.length;
    const start = (page - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
  }

  /**
   * Find products matching the query criteria
   */
  async findProducts(
    query: ProductQuery,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LookupResult<Product>> {
    let results = Array.from(this.products.values());

    // Apply filters
    if (query.category) {
      results = results.filter(product => product.category === query.category);
    }
    if (query.producedBy) {
      results = results.filter(product =>
        product.producedBy.includes(query.producedBy!)
      );
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter(product =>
        query.tags!.some(tag => product.tags.includes(tag))
      );
    }
    if (query.name) {
      const lowerName = query.name.toLowerCase();
      results = results.filter(product =>
        product.name.toLowerCase().includes(lowerName)
      );
    }

    // Pagination
    const total = results.length;
    const start = (page - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
  }

  /**
   * Find relationships matching the query criteria
   */
  async findRelationships(
    query: RelationshipQuery,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LookupResult<Relationship>> {
    let results = Array.from(this.relationships.values());

    // Apply filters
    if (query.fromActorId) {
      results = results.filter(rel => rel.fromActorId === query.fromActorId);
    }
    if (query.toActorId) {
      results = results.filter(rel => rel.toActorId === query.toActorId);
    }
    if (query.type) {
      results = results.filter(rel => rel.type === query.type);
    }
    if (query.status) {
      results = results.filter(rel => rel.status === query.status);
    }

    // Pagination
    const total = results.length;
    const start = (page - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
  }

  /**
   * Get actor by ID
   */
  async getActorById(id: string): Promise<SupplyChainActor | null> {
    return this.actors.get(id) || null;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service | null> {
    return this.services.get(id) || null;
  }

  /**
   * Find path between two actors through relationships
   */
  async findSupplyChainPath(
    fromActorId: string,
    toActorId: string
  ): Promise<string[]> {
    const visited = new Set<string>();
    const queue: Array<{ actorId: string; path: string[] }> = [
      { actorId: fromActorId, path: [fromActorId] },
    ];

    while (queue.length > 0) {
      const { actorId, path } = queue.shift()!;

      if (actorId === toActorId) {
        return path;
      }

      if (visited.has(actorId)) {
        continue;
      }

      visited.add(actorId);

      // Find all outgoing relationships
      const outgoingRels = Array.from(this.relationships.values()).filter(
        rel => rel.fromActorId === actorId
      );

      for (const rel of outgoingRels) {
        if (!visited.has(rel.toActorId)) {
          queue.push({
            actorId: rel.toActorId,
            path: [...path, rel.toActorId],
          });
        }
      }
    }

    return []; // No path found
  }

  /**
   * Add entities to the lookup index
   */
  addActor(actor: SupplyChainActor): void {
    this.actors.set(actor.id, actor);
  }

  addRelationship(relationship: Relationship): void {
    this.relationships.set(relationship.id, relationship);
  }

  addProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  addService(service: Service): void {
    this.services.set(service.id, service);
  }
}
