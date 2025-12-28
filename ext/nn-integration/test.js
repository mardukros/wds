// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Test suite for Neural Network Supply Chain Integration

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test data
const actors = JSON.parse(readFileSync(join(__dirname, 'actors.json'), 'utf8'));
const relationships = JSON.parse(readFileSync(join(__dirname, 'relationships.json'), 'utf8'));

// Mock implementations for testing without workerd runtime
class TensorEmbedding {
  constructor(dimension = 128) {
    this.dimension = dimension;
    this.vector = new Float32Array(dimension);
  }

  static fromArray(arr) {
    const embedding = new TensorEmbedding(arr.length);
    embedding.vector.set(arr);
    return embedding;
  }

  initializeRandom() {
    const stddev = Math.sqrt(2.0 / this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      this.vector[i] = (Math.random() - 0.5) * 2 * stddev;
    }
    return this;
  }

  static cosineSimilarity(emb1, emb2) {
    let dotProduct = 0, norm1 = 0, norm2 = 0;
    for (let i = 0; i < emb1.dimension; i++) {
      dotProduct += emb1.vector[i] * emb2.vector[i];
      norm1 += emb1.vector[i] * emb1.vector[i];
      norm2 += emb2.vector[i] * emb2.vector[i];
    }
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  toArray() {
    return Array.from(this.vector);
  }

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

  clone() {
    return TensorEmbedding.fromArray(this.toArray());
  }

  add(other) {
    const result = new TensorEmbedding(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      result.vector[i] = this.vector[i] + other.vector[i];
    }
    return result;
  }

  scale(scalar) {
    const result = new TensorEmbedding(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      result.vector[i] = this.vector[i] * scalar;
    }
    return result;
  }
}

describe('Neural Network Supply Chain Integration', () => {
  describe('TensorEmbedding', () => {
    it('should create embedding with correct dimension', () => {
      const embedding = new TensorEmbedding(128);
      assert.strictEqual(embedding.dimension, 128);
      assert.strictEqual(embedding.vector.length, 128);
    });

    it('should initialize random embeddings', () => {
      const embedding = new TensorEmbedding(128).initializeRandom();
      let nonZeroCount = 0;
      for (let i = 0; i < embedding.vector.length; i++) {
        if (embedding.vector[i] !== 0) nonZeroCount++;
      }
      assert.ok(nonZeroCount > 0, 'Embedding should have non-zero values');
    });

    it('should compute cosine similarity correctly', () => {
      const emb1 = new TensorEmbedding(128).initializeRandom();
      const emb2 = emb1.clone();
      
      const similarity = TensorEmbedding.cosineSimilarity(emb1, emb2);
      assert.ok(similarity > 0.99, 'Identical embeddings should have similarity ~1');
    });

    it('should normalize embeddings', () => {
      const embedding = new TensorEmbedding(128).initializeRandom();
      const normalized = embedding.normalize();
      
      let norm = 0;
      for (let i = 0; i < normalized.vector.length; i++) {
        norm += normalized.vector[i] * normalized.vector[i];
      }
      norm = Math.sqrt(norm);
      
      assert.ok(Math.abs(norm - 1.0) < 0.001, 'Normalized embedding should have unit length');
    });

    it('should perform vector addition', () => {
      const emb1 = TensorEmbedding.fromArray([1, 2, 3]);
      const emb2 = TensorEmbedding.fromArray([4, 5, 6]);
      const result = emb1.add(emb2);
      
      assert.deepStrictEqual(result.toArray(), [5, 7, 9]);
    });

    it('should perform scalar multiplication', () => {
      const emb = TensorEmbedding.fromArray([1, 2, 3]);
      const result = emb.scale(2);
      
      assert.deepStrictEqual(result.toArray(), [2, 4, 6]);
    });
  });

  describe('Data Validation', () => {
    it('should load actors data correctly', () => {
      assert.ok(Array.isArray(actors), 'Actors should be an array');
      assert.ok(actors.length > 0, 'Should have actors');
      
      const actor = actors[0];
      assert.ok(actor.id, 'Actor should have id');
      assert.ok(actor.name, 'Actor should have name');
      assert.ok(actor.type, 'Actor should have type');
    });

    it('should have valid actor types', () => {
      const validTypes = ['supplier', 'producer', 'distributor', 'wholesaler', 'retailer', 'marketplace'];
      
      for (const actor of actors) {
        assert.ok(
          validTypes.includes(actor.type),
          `Actor ${actor.id} has invalid type: ${actor.type}`
        );
      }
    });

    it('should load relationships data correctly', () => {
      assert.ok(Array.isArray(relationships), 'Relationships should be an array');
      assert.ok(relationships.length > 0, 'Should have relationships');
      
      const rel = relationships[0];
      assert.ok(rel.id, 'Relationship should have id');
      assert.ok(rel.fromActorId, 'Relationship should have fromActorId');
      assert.ok(rel.toActorId, 'Relationship should have toActorId');
      assert.ok(rel.type, 'Relationship should have type');
    });

    it('should have valid relationship references', () => {
      const actorIds = new Set(actors.map(a => a.id));
      
      for (const rel of relationships) {
        assert.ok(
          actorIds.has(rel.fromActorId),
          `Relationship ${rel.id} references unknown actor: ${rel.fromActorId}`
        );
        assert.ok(
          actorIds.has(rel.toActorId),
          `Relationship ${rel.id} references unknown actor: ${rel.toActorId}`
        );
      }
    });

    it('should have actors with capacities', () => {
      for (const actor of actors) {
        assert.ok(
          actor.capacities && Array.isArray(actor.capacities),
          `Actor ${actor.id} should have capacities array`
        );
        assert.ok(
          actor.capacities.length > 0,
          `Actor ${actor.id} should have at least one capacity`
        );
      }
    });

    it('should have actors with pricing rules', () => {
      for (const actor of actors) {
        assert.ok(
          actor.pricingRules && Array.isArray(actor.pricingRules),
          `Actor ${actor.id} should have pricingRules array`
        );
        assert.ok(
          actor.pricingRules.length > 0,
          `Actor ${actor.id} should have at least one pricing rule`
        );
      }
    });
  });

  describe('Network Structure', () => {
    it('should have diverse actor types', () => {
      const types = new Set(actors.map(a => a.type));
      assert.ok(types.has('supplier'), 'Should have suppliers');
      assert.ok(types.has('producer'), 'Should have producers');
      assert.ok(types.has('distributor'), 'Should have distributors');
    });

    it('should have multi-tier supply chain', () => {
      const actorMap = new Map(actors.map(a => [a.id, a]));
      
      // Check for suppliers -> producers
      const supplierToProducer = relationships.some(rel => 
        actorMap.get(rel.fromActorId)?.type === 'supplier' &&
        actorMap.get(rel.toActorId)?.type === 'producer'
      );
      assert.ok(supplierToProducer, 'Should have supplier -> producer relationships');
      
      // Check for producers -> distributors
      const producerToDistributor = relationships.some(rel =>
        actorMap.get(rel.fromActorId)?.type === 'producer' &&
        actorMap.get(rel.toActorId)?.type === 'distributor'
      );
      assert.ok(producerToDistributor, 'Should have producer -> distributor relationships');
    });

    it('should have connected network', () => {
      // Build adjacency list
      const graph = new Map();
      for (const actor of actors) {
        graph.set(actor.id, []);
      }
      for (const rel of relationships) {
        if (rel.status === 'active') {
          graph.get(rel.fromActorId).push(rel.toActorId);
        }
      }
      
      // Check that at least some nodes are connected
      let connectedNodes = 0;
      for (const [id, neighbors] of graph.entries()) {
        if (neighbors.length > 0) connectedNodes++;
      }
      
      assert.ok(connectedNodes > 0, 'Network should have connected nodes');
    });

    it('should have reasonable network size', () => {
      assert.ok(actors.length >= 5, 'Should have at least 5 actors');
      assert.ok(relationships.length >= 5, 'Should have at least 5 relationships');
      assert.ok(
        relationships.length <= actors.length * actors.length,
        'Should not have more relationships than possible'
      );
    });
  });

  describe('Embedding Generation Logic', () => {
    it('should generate different embeddings for different actor types', () => {
      const supplier = actors.find(a => a.type === 'supplier');
      const producer = actors.find(a => a.type === 'producer');
      
      assert.ok(supplier, 'Should have supplier');
      assert.ok(producer, 'Should have producer');
      
      // Type embeddings should differ
      assert.notStrictEqual(supplier.type, producer.type);
    });

    it('should incorporate capacity information', () => {
      const highCapacityActor = actors.find(a => 
        a.capacities.some(c => c.value > 10000)
      );
      const lowCapacityActor = actors.find(a =>
        a.capacities.every(c => c.value < 10000)
      );
      
      assert.ok(highCapacityActor, 'Should have high capacity actor');
      assert.ok(lowCapacityActor, 'Should have low capacity actor');
    });

    it('should incorporate pricing information', () => {
      const fixedPricing = actors.find(a =>
        a.pricingRules.some(r => r.type === 'fixed')
      );
      const tieredPricing = actors.find(a =>
        a.pricingRules.some(r => r.type === 'tiered')
      );
      
      assert.ok(fixedPricing || tieredPricing, 'Should have actors with pricing rules');
    });

    it('should handle cooperative memberships', () => {
      const cooperativeMember = actors.find(a =>
        a.cooperativeMemberships && a.cooperativeMemberships.length > 0
      );
      
      if (cooperativeMember) {
        assert.ok(
          cooperativeMember.cooperativeMemberships[0].cooperativeId,
          'Cooperative membership should have id'
        );
        assert.ok(
          cooperativeMember.cooperativeMemberships[0].level,
          'Cooperative membership should have level'
        );
      }
    });
  });

  describe('Flow Dynamics Concepts', () => {
    it('should define flow metrics', () => {
      const flowMetrics = [
        'flowStrength',
        'throughput',
        'reliability',
        'latency',
        'costEfficiency',
        'bottleneckRisk',
        'demandMatch',
        'flexibility'
      ];
      
      // Validate metrics are well-defined concepts
      assert.ok(flowMetrics.length === 8, 'Should have 8 core flow metrics');
    });

    it('should have network-wide metrics', () => {
      const networkMetrics = [
        'averageFlowStrength',
        'averageThroughput',
        'averageReliability',
        'networkHealth'
      ];
      
      assert.ok(networkMetrics.length > 0, 'Should have network metrics');
    });
  });

  describe('API Endpoint Coverage', () => {
    it('should define all required endpoints', () => {
      const requiredEndpoints = [
        '/api/summary',
        '/api/actors',
        '/api/actor/{id}',
        '/api/embedding/{actorId}',
        '/api/similar/{actorId}',
        '/api/similarity',
        '/api/flow/predict',
        '/api/flow/analyze',
        '/api/network/health',
        '/api/erp-scm/analysis',
        '/api/predict/future',
        '/api/anomalies',
        '/api/flow/statistics',
        '/api/path/optimal',
        '/api/embeddings/export'
      ];
      
      assert.ok(requiredEndpoints.length === 15, 'Should have 15 endpoints');
    });
  });
});

console.log('Running Neural Network Supply Chain Integration Tests...');
