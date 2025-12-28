// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Neural Network Supply Chain Integration
// Main implementation combining tensor embeddings with supply chain dynamics

import { EntityEmbedder, TensorEmbedding } from "nn-integration-internal:tensor-embeddings";
import { FlowDynamicsNetwork, FlowMonitor } from "nn-integration-internal:flow-dynamics";

export class NeuralSupplyChain {
  #actors;
  #relationships;
  #embedder;
  #flowNetwork;
  #monitor;
  #initialized;

  constructor(data) {
    this.#actors = new Map();
    this.#relationships = new Map();
    this.#initialized = false;

    // Initialize actors
    if (data.actors) {
      for (const actorData of data.actors) {
        this.#actors.set(actorData.id, actorData);
      }
    }

    // Initialize relationships
    if (data.relationships) {
      for (const rel of data.relationships) {
        this.#relationships.set(rel.id, rel);
      }
    }

    // Initialize neural components
    const embeddingDim = data.embeddingDimension || 128;
    this.#embedder = new EntityEmbedder(embeddingDim);
    this.#flowNetwork = new FlowDynamicsNetwork(embeddingDim);
    this.#monitor = new FlowMonitor();

    // Pre-compute embeddings
    this.#initialize();
  }

  #initialize() {
    if (this.#initialized) return;

    // Embed all actors
    for (const [id, actor] of this.#actors.entries()) {
      this.#embedder.embedActor(actor);
    }

    // Embed all relationships
    for (const [id, rel] of this.#relationships.entries()) {
      const fromActor = this.#actors.get(rel.fromActorId);
      const toActor = this.#actors.get(rel.toActorId);
      if (fromActor && toActor) {
        this.#embedder.embedRelationship(rel, fromActor, toActor);
      }
    }

    this.#initialized = true;
  }

  /**
   * Get an actor by ID
   */
  getActor(id) {
    const actor = this.#actors.get(id);
    if (!actor) {
      throw new Error(`Actor not found: ${id}`);
    }
    return actor;
  }

  /**
   * Get actor embedding
   */
  getActorEmbedding(actorId) {
    const actor = this.getActor(actorId);
    const embedding = this.#embedder.embedActor(actor);
    return {
      actorId,
      embedding: embedding.toArray(),
      dimension: embedding.dimension
    };
  }

  /**
   * Find similar actors based on embeddings
   */
  findSimilarActors(actorId, topK = 5) {
    const similarities = this.#embedder.findSimilarActors(actorId, topK);
    
    return similarities.map(sim => ({
      actorId: sim.actorId,
      actor: this.#actors.get(sim.actorId),
      similarity: sim.similarity
    }));
  }

  /**
   * Compute similarity between two actors
   */
  computeActorSimilarity(actorId1, actorId2) {
    const actor1 = this.getActor(actorId1);
    const actor2 = this.getActor(actorId2);

    const embed1 = this.#embedder.embedActor(actor1);
    const embed2 = this.#embedder.embedActor(actor2);

    return {
      actorId1,
      actorId2,
      cosineSimilarity: TensorEmbedding.cosineSimilarity(embed1, embed2),
      euclideanDistance: TensorEmbedding.euclideanDistance(embed1, embed2)
    };
  }

  /**
   * Predict flow dynamics between two actors
   */
  predictFlow(fromActorId, toActorId) {
    const fromActor = this.getActor(fromActorId);
    const toActor = this.getActor(toActorId);

    const fromEmbed = this.#embedder.embedActor(fromActor);
    const toEmbed = this.#embedder.embedActor(toActor);

    const flowPrediction = this.#flowNetwork.predictFlow(fromEmbed, toEmbed);

    return {
      from: fromActorId,
      to: toActorId,
      ...flowPrediction
    };
  }

  /**
   * Analyze entire network flow dynamics
   */
  analyzeNetworkFlow() {
    const analysis = this.#flowNetwork.analyzeNetworkFlow(
      this.#actors,
      this.#relationships,
      this.#embedder
    );

    // Record flows in monitor
    const timestamp = Date.now();
    for (const flow of analysis.flows) {
      this.#monitor.recordFlow(timestamp, flow);
    }

    return analysis;
  }

  /**
   * Get real-time network health
   */
  getNetworkHealth() {
    const analysis = this.analyzeNetworkFlow();
    
    return {
      timestamp: Date.now(),
      overallHealth: analysis.networkMetrics.networkHealth,
      metrics: analysis.networkMetrics,
      bottleneckCount: analysis.bottlenecks.length,
      criticalIssues: analysis.bottlenecks.filter(b => b.risk > 0.8).length,
      status: this.determineNetworkStatus(analysis.networkMetrics.networkHealth)
    };
  }

  determineNetworkStatus(health) {
    if (health >= 0.8) return 'excellent';
    if (health >= 0.6) return 'good';
    if (health >= 0.4) return 'fair';
    if (health >= 0.2) return 'poor';
    return 'critical';
  }

  /**
   * Get ERP+SCM integrated analysis
   */
  getERPSCMAnalysis() {
    const flowAnalysis = this.analyzeNetworkFlow();
    const embeddings = this.#embedder.exportEmbeddings();

    // Compute actor-level metrics
    const actorMetrics = new Map();
    for (const [id, actor] of this.#actors.entries()) {
      actorMetrics.set(id, {
        id,
        name: actor.name,
        type: actor.type,
        inboundFlows: 0,
        outboundFlows: 0,
        totalThroughput: 0,
        averageReliability: 0,
        bottleneckRisk: 0
      });
    }

    // Aggregate flow data by actor
    for (const flow of flowAnalysis.flows) {
      const fromMetrics = actorMetrics.get(flow.from);
      const toMetrics = actorMetrics.get(flow.to);

      if (fromMetrics) {
        fromMetrics.outboundFlows++;
        fromMetrics.totalThroughput += flow.throughput;
        fromMetrics.averageReliability = 
          (fromMetrics.averageReliability * (fromMetrics.outboundFlows - 1) + flow.reliability) / fromMetrics.outboundFlows;
        fromMetrics.bottleneckRisk = Math.max(fromMetrics.bottleneckRisk, flow.bottleneckRisk);
      }

      if (toMetrics) {
        toMetrics.inboundFlows++;
      }
    }

    return {
      timestamp: Date.now(),
      network: {
        totalActors: this.#actors.size,
        totalRelationships: this.#relationships.size,
        health: flowAnalysis.networkMetrics.networkHealth,
        status: this.determineNetworkStatus(flowAnalysis.networkMetrics.networkHealth)
      },
      actors: Array.from(actorMetrics.values()),
      flows: flowAnalysis.flows,
      bottlenecks: flowAnalysis.bottlenecks,
      recommendations: flowAnalysis.recommendations,
      embeddings: {
        actorCount: Object.keys(embeddings.actors).length,
        relationshipCount: Object.keys(embeddings.relationships).length,
        dimension: this.#embedder.dimension
      }
    };
  }

  /**
   * Predict future network state
   */
  predictFutureState(daysAhead = 30) {
    const currentAnalysis = this.analyzeNetworkFlow();
    const predictions = this.#flowNetwork.predictFutureState(
      currentAnalysis.flows,
      daysAhead
    );

    // Compute predicted network metrics
    const predictedMetrics = {
      averageFlowStrength: 0,
      averageThroughput: 0,
      averageReliability: 0,
      count: predictions.length
    };

    for (const pred of predictions) {
      predictedMetrics.averageFlowStrength += pred.predictedFlowStrength;
      predictedMetrics.averageThroughput += pred.predictedThroughput;
      predictedMetrics.averageReliability += pred.predictedReliability;
    }

    if (predictions.length > 0) {
      predictedMetrics.averageFlowStrength /= predictions.length;
      predictedMetrics.averageThroughput /= predictions.length;
      predictedMetrics.averageReliability /= predictions.length;
    }

    return {
      currentState: currentAnalysis.networkMetrics,
      predictedState: predictedMetrics,
      predictions,
      horizon: daysAhead,
      confidence: predictions.length > 0 
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
        : 0
    };
  }

  /**
   * Detect anomalies in flow history
   */
  detectAnomalies(threshold = 0.3) {
    return this.#monitor.detectAnomalies(threshold);
  }

  /**
   * Get flow statistics
   */
  getFlowStatistics() {
    return this.#monitor.getFlowStatistics();
  }

  /**
   * Query actors with filters
   */
  queryActors(filters) {
    let results = Array.from(this.#actors.values());

    if (filters.type) {
      results = results.filter(a => a.type === filters.type);
    }

    if (filters.name) {
      const lowerName = filters.name.toLowerCase();
      results = results.filter(a => a.name.toLowerCase().includes(lowerName));
    }

    if (filters.minCapacity && filters.capacityType) {
      results = results.filter(a =>
        a.capacities && a.capacities.some(
          c => c.type === filters.capacityType && c.value >= filters.minCapacity
        )
      );
    }

    if (filters.cooperativeId) {
      results = results.filter(a =>
        a.cooperativeMemberships && a.cooperativeMemberships.some(
          m => m.cooperativeId === filters.cooperativeId
        )
      );
    }

    return results;
  }

  /**
   * Find optimal paths considering flow dynamics
   */
  findOptimalPath(fromActorId, toActorId) {
    // BFS with flow quality scoring
    const visited = new Set();
    const queue = [{ 
      actorId: fromActorId, 
      path: [fromActorId],
      score: 1.0 
    }];
    const paths = [];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.actorId === toActorId) {
        paths.push(current);
        continue;
      }

      if (visited.has(current.actorId)) {
        continue;
      }

      visited.add(current.actorId);

      // Find outgoing relationships
      const outgoing = Array.from(this.#relationships.values()).filter(
        rel => rel.fromActorId === current.actorId && rel.status === 'active'
      );

      for (const rel of outgoing) {
        if (!visited.has(rel.toActorId)) {
          // Predict flow quality
          const flowPred = this.predictFlow(current.actorId, rel.toActorId);
          const pathScore = current.score * flowPred.overallHealth;

          queue.push({
            actorId: rel.toActorId,
            path: [...current.path, rel.toActorId],
            score: pathScore
          });
        }
      }
    }

    // Sort paths by score
    paths.sort((a, b) => b.score - a.score);

    return paths.map(p => ({
      path: p.path,
      qualityScore: p.score,
      length: p.path.length
    }));
  }

  /**
   * Export all embeddings
   */
  exportEmbeddings() {
    return this.#embedder.exportEmbeddings();
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return {
      actors: {
        total: this.#actors.size,
        byType: this.getActorCountsByType()
      },
      relationships: {
        total: this.#relationships.size,
        byType: this.getRelationshipCountsByType()
      },
      embeddings: {
        dimension: this.#embedder.dimension,
        actorsEmbedded: this.#embedder.actorEmbeddings.size,
        relationshipsEmbedded: this.#embedder.relationshipEmbeddings.size
      },
      networkHealth: this.getNetworkHealth()
    };
  }

  getActorCountsByType() {
    const counts = {};
    for (const actor of this.#actors.values()) {
      counts[actor.type] = (counts[actor.type] || 0) + 1;
    }
    return counts;
  }

  getRelationshipCountsByType() {
    const counts = {};
    for (const rel of this.#relationships.values()) {
      counts[rel.type] = (counts[rel.type] || 0) + 1;
    }
    return counts;
  }
}
