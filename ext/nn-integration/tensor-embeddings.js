// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Tensor embedding module for supply chain entities
// Provides neural network-inspired embeddings for actors, products, and relationships

/**
 * TensorEmbedding - Represents a multi-dimensional embedding vector
 */
export class TensorEmbedding {
  constructor(dimension = 128) {
    this.dimension = dimension;
    this.vector = new Float32Array(dimension);
  }

  // Initialize from array
  static fromArray(arr) {
    const embedding = new TensorEmbedding(arr.length);
    embedding.vector.set(arr);
    return embedding;
  }

  // Initialize with random values (Xavier initialization)
  initializeRandom() {
    const stddev = Math.sqrt(2.0 / this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      this.vector[i] = (Math.random() - 0.5) * 2 * stddev;
    }
    return this;
  }

  // Cosine similarity between two embeddings
  static cosineSimilarity(emb1, emb2) {
    if (emb1.dimension !== emb2.dimension) {
      throw new Error('Embeddings must have same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < emb1.dimension; i++) {
      dotProduct += emb1.vector[i] * emb2.vector[i];
      norm1 += emb1.vector[i] * emb1.vector[i];
      norm2 += emb2.vector[i] * emb2.vector[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Euclidean distance
  static euclideanDistance(emb1, emb2) {
    if (emb1.dimension !== emb2.dimension) {
      throw new Error('Embeddings must have same dimension');
    }

    let sumSquares = 0;
    for (let i = 0; i < emb1.dimension; i++) {
      const diff = emb1.vector[i] - emb2.vector[i];
      sumSquares += diff * diff;
    }

    return Math.sqrt(sumSquares);
  }

  // Add two embeddings (element-wise)
  add(other) {
    const result = new TensorEmbedding(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      result.vector[i] = this.vector[i] + other.vector[i];
    }
    return result;
  }

  // Scalar multiplication
  scale(scalar) {
    const result = new TensorEmbedding(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      result.vector[i] = this.vector[i] * scalar;
    }
    return result;
  }

  // Normalize to unit length
  normalize() {
    let norm = 0;
    for (let i = 0; i < this.dimension; i++) {
      norm += this.vector[i] * this.vector[i];
    }
    norm = Math.sqrt(norm);

    const result = new TensorEmbedding(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      result.vector[i] = this.vector[i] / norm;
    }
    return result;
  }

  // Convert to plain array for serialization
  toArray() {
    return Array.from(this.vector);
  }

  // Clone embedding
  clone() {
    return TensorEmbedding.fromArray(this.toArray());
  }
}

/**
 * EntityEmbedder - Creates embeddings for supply chain entities
 */
export class EntityEmbedder {
  constructor(dimension = 128) {
    this.dimension = dimension;
    this.actorEmbeddings = new Map();
    this.productEmbeddings = new Map();
    this.relationshipEmbeddings = new Map();
    
    // Type embeddings (learned representations for entity types)
    this.typeEmbeddings = new Map();
    this.initializeTypeEmbeddings();
  }

  initializeTypeEmbeddings() {
    const actorTypes = ['supplier', 'producer', 'distributor', 'wholesaler', 'retailer', 'marketplace'];
    const relationTypes = ['supplies', 'produces_for', 'distributes_to', 'sells_through'];

    for (const type of actorTypes) {
      this.typeEmbeddings.set(`actor:${type}`, new TensorEmbedding(this.dimension).initializeRandom());
    }

    for (const type of relationTypes) {
      this.typeEmbeddings.set(`relation:${type}`, new TensorEmbedding(this.dimension).initializeRandom());
    }
  }

  /**
   * Generate embedding for an actor based on its properties
   */
  embedActor(actor) {
    if (this.actorEmbeddings.has(actor.id)) {
      return this.actorEmbeddings.get(actor.id);
    }

    // Start with type embedding
    const typeKey = `actor:${actor.type}`;
    let embedding = this.typeEmbeddings.get(typeKey).clone();

    // Add capacity features
    if (actor.capacities && actor.capacities.length > 0) {
      const capacityEmbed = this.embedCapacities(actor.capacities);
      embedding = embedding.add(capacityEmbed.scale(0.3));
    }

    // Add pricing features
    if (actor.pricingRules && actor.pricingRules.length > 0) {
      const pricingEmbed = this.embedPricing(actor.pricingRules);
      embedding = embedding.add(pricingEmbed.scale(0.2));
    }

    // Add cooperative membership features
    if (actor.cooperativeMemberships && actor.cooperativeMemberships.length > 0) {
      const coopEmbed = this.embedCooperatives(actor.cooperativeMemberships);
      embedding = embedding.add(coopEmbed.scale(0.15));
    }

    // Normalize final embedding
    embedding = embedding.normalize();
    this.actorEmbeddings.set(actor.id, embedding);

    return embedding;
  }

  /**
   * Embed capacity information
   */
  embedCapacities(capacities) {
    const embedding = new TensorEmbedding(this.dimension);
    
    for (let i = 0; i < capacities.length && i < 5; i++) {
      const capacity = capacities[i];
      // Use capacity value to influence embedding dimensions
      const offset = i * 25;
      const normalizedValue = Math.log(capacity.value + 1) / 10;
      
      for (let j = 0; j < 25 && (offset + j) < this.dimension; j++) {
        embedding.vector[offset + j] = normalizedValue * Math.sin(j * 0.1);
      }
    }

    return embedding;
  }

  /**
   * Embed pricing information
   */
  embedPricing(pricingRules) {
    const embedding = new TensorEmbedding(this.dimension);
    
    for (let i = 0; i < pricingRules.length && i < 3; i++) {
      const rule = pricingRules[i];
      const offset = 50 + i * 20;
      
      if (rule.type === 'fixed' && rule.basePrice) {
        const normalizedPrice = Math.log(rule.basePrice + 1) / 5;
        for (let j = 0; j < 20 && (offset + j) < this.dimension; j++) {
          embedding.vector[offset + j] = normalizedPrice * Math.cos(j * 0.15);
        }
      } else if (rule.type === 'tiered' && rule.tiers) {
        const avgPrice = rule.tiers.reduce((sum, t) => sum + t.price, 0) / rule.tiers.length;
        const normalizedPrice = Math.log(avgPrice + 1) / 5;
        for (let j = 0; j < 20 && (offset + j) < this.dimension; j++) {
          embedding.vector[offset + j] = normalizedPrice * Math.sin(j * 0.2);
        }
      }
    }

    return embedding;
  }

  /**
   * Embed cooperative membership
   */
  embedCooperatives(memberships) {
    const embedding = new TensorEmbedding(this.dimension);
    
    for (let i = 0; i < memberships.length && i < 3; i++) {
      const membership = memberships[i];
      const offset = 100 + i * 9;
      const levelValue = membership.level === 'primary' ? 1.0 : 
                        membership.level === 'secondary' ? 0.5 : 0.25;
      
      for (let j = 0; j < 9 && (offset + j) < this.dimension; j++) {
        embedding.vector[offset + j] = levelValue * Math.sin((i + j) * 0.3);
      }
    }

    return embedding;
  }

  /**
   * Generate embedding for a relationship
   */
  embedRelationship(relationship, fromActor, toActor) {
    const key = `${relationship.fromActorId}-${relationship.toActorId}`;
    
    if (this.relationshipEmbeddings.has(key)) {
      return this.relationshipEmbeddings.get(key);
    }

    // Start with relation type embedding
    const typeKey = `relation:${relationship.type}`;
    let embedding = this.typeEmbeddings.has(typeKey) 
      ? this.typeEmbeddings.get(typeKey).clone()
      : new TensorEmbedding(this.dimension).initializeRandom();

    // Combine with actor embeddings
    if (fromActor && toActor) {
      const fromEmbed = this.embedActor(fromActor);
      const toEmbed = this.embedActor(toActor);
      
      // Relationship embedding = type + 0.3*from + 0.3*to
      embedding = embedding.add(fromEmbed.scale(0.3)).add(toEmbed.scale(0.3));
    }

    embedding = embedding.normalize();
    this.relationshipEmbeddings.set(key, embedding);

    return embedding;
  }

  /**
   * Find similar actors based on embedding similarity
   */
  findSimilarActors(actorId, topK = 5) {
    const targetEmbed = this.actorEmbeddings.get(actorId);
    if (!targetEmbed) {
      return [];
    }

    const similarities = [];
    for (const [id, embed] of this.actorEmbeddings.entries()) {
      if (id !== actorId) {
        const similarity = TensorEmbedding.cosineSimilarity(targetEmbed, embed);
        similarities.push({ actorId: id, similarity });
      }
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  /**
   * Get all embeddings for serialization
   */
  exportEmbeddings() {
    const result = {
      actors: {},
      relationships: {},
      types: {}
    };

    for (const [id, embed] of this.actorEmbeddings.entries()) {
      result.actors[id] = embed.toArray();
    }

    for (const [key, embed] of this.relationshipEmbeddings.entries()) {
      result.relationships[key] = embed.toArray();
    }

    for (const [type, embed] of this.typeEmbeddings.entries()) {
      result.types[type] = embed.toArray();
    }

    return result;
  }
}
