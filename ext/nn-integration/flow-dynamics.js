// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Neural network-inspired flow dynamics analysis for supply chains
// Predicts flow patterns, bottlenecks, and network behavior

import { TensorEmbedding } from "nn-integration-internal:tensor-embeddings";

/**
 * Activation functions for neural layers
 */
export const Activation = {
  relu(x) {
    return Math.max(0, x);
  },

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  },

  tanh(x) {
    return Math.tanh(x);
  },

  leakyRelu(x, alpha = 0.01) {
    return x > 0 ? x : alpha * x;
  }
};

/**
 * Simple feedforward neural layer
 */
export class DenseLayer {
  constructor(inputSize, outputSize, activation = 'relu') {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.activation = activation;
    
    // Initialize weights with Xavier initialization
    this.weights = this.initializeWeights();
    this.bias = new Float32Array(outputSize);
  }

  initializeWeights() {
    const weights = [];
    const stddev = Math.sqrt(2.0 / (this.inputSize + this.outputSize));
    
    for (let i = 0; i < this.outputSize; i++) {
      const row = new Float32Array(this.inputSize);
      for (let j = 0; j < this.inputSize; j++) {
        row[j] = (Math.random() - 0.5) * 2 * stddev;
      }
      weights.push(row);
    }
    
    return weights;
  }

  forward(input) {
    const output = new Float32Array(this.outputSize);
    
    for (let i = 0; i < this.outputSize; i++) {
      let sum = this.bias[i];
      for (let j = 0; j < this.inputSize; j++) {
        sum += this.weights[i][j] * input[j];
      }
      
      // Apply activation function
      output[i] = Activation[this.activation](sum);
    }
    
    return output;
  }
}

/**
 * FlowDynamicsNetwork - Predicts supply chain flow patterns
 */
export class FlowDynamicsNetwork {
  constructor(embeddingDim = 128) {
    this.embeddingDim = embeddingDim;
    
    // Network architecture: embedding -> hidden -> flow prediction
    this.hiddenLayer1 = new DenseLayer(embeddingDim * 2, 256, 'relu');
    this.hiddenLayer2 = new DenseLayer(256, 128, 'relu');
    this.outputLayer = new DenseLayer(128, 64, 'sigmoid');
  }

  /**
   * Predict flow characteristics between two actors
   */
  predictFlow(fromEmbedding, toEmbedding) {
    // Concatenate embeddings
    const input = new Float32Array(this.embeddingDim * 2);
    input.set(fromEmbedding.vector, 0);
    input.set(toEmbedding.vector, this.embeddingDim);

    // Forward pass through network
    const hidden1 = this.hiddenLayer1.forward(input);
    const hidden2 = this.hiddenLayer2.forward(hidden1);
    const output = this.outputLayer.forward(hidden2);

    return this.interpretFlowOutput(output);
  }

  interpretFlowOutput(output) {
    // Interpret neural network output as flow characteristics
    return {
      flowStrength: output[0],        // 0-1: strength of connection
      throughput: output[1] * 1000,   // Predicted throughput capacity
      reliability: output[2],         // 0-1: connection reliability
      latency: output[3] * 10,        // Predicted latency in days
      costEfficiency: output[4],      // 0-1: cost efficiency score
      bottleneckRisk: output[5],      // 0-1: risk of bottleneck
      demandMatch: output[6],         // 0-1: supply-demand match
      flexibility: output[7],         // 0-1: adaptation capability
      
      // Additional metrics derived from output vector
      qualityScore: (output[8] + output[9] + output[10]) / 3,
      sustainabilityScore: (output[11] + output[12]) / 2,
      riskScore: (output[13] + output[14] + output[15]) / 3,
      
      // Aggregated flow health
      overallHealth: this.computeOverallHealth(output)
    };
  }

  computeOverallHealth(output) {
    // Weighted average of key metrics
    const weights = [0.2, 0.15, 0.15, -0.1, 0.15, -0.15, 0.15, 0.1];
    let health = 0;
    
    for (let i = 0; i < Math.min(weights.length, output.length); i++) {
      health += weights[i] * output[i];
    }
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, (health + 0.5)));
  }

  /**
   * Predict network-wide flow dynamics
   */
  analyzeNetworkFlow(actors, relationships, embedder) {
    const flowAnalysis = {
      totalActors: actors.size,
      totalRelationships: relationships.size,
      flows: [],
      networkMetrics: {},
      bottlenecks: [],
      recommendations: []
    };

    // Analyze each relationship
    for (const [relId, rel] of relationships.entries()) {
      const fromActor = actors.get(rel.fromActorId);
      const toActor = actors.get(rel.toActorId);

      if (!fromActor || !toActor) continue;

      const fromEmbed = embedder.embedActor(fromActor);
      const toEmbed = embedder.embedActor(toActor);
      
      const flowPrediction = this.predictFlow(fromEmbed, toEmbed);
      
      flowAnalysis.flows.push({
        relationshipId: relId,
        from: rel.fromActorId,
        to: rel.toActorId,
        type: rel.type,
        ...flowPrediction
      });

      // Identify bottlenecks
      if (flowPrediction.bottleneckRisk > 0.7) {
        flowAnalysis.bottlenecks.push({
          relationshipId: relId,
          from: rel.fromActorId,
          to: rel.toActorId,
          risk: flowPrediction.bottleneckRisk,
          reason: this.identifyBottleneckReason(flowPrediction)
        });
      }
    }

    // Compute network-level metrics
    flowAnalysis.networkMetrics = this.computeNetworkMetrics(flowAnalysis.flows);
    
    // Generate recommendations
    flowAnalysis.recommendations = this.generateRecommendations(flowAnalysis);

    return flowAnalysis;
  }

  identifyBottleneckReason(flowPrediction) {
    const reasons = [];
    
    if (flowPrediction.throughput < 300) {
      reasons.push('Low throughput capacity');
    }
    if (flowPrediction.reliability < 0.6) {
      reasons.push('Low reliability');
    }
    if (flowPrediction.latency > 7) {
      reasons.push('High latency');
    }
    if (flowPrediction.costEfficiency < 0.5) {
      reasons.push('Poor cost efficiency');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Multiple factors';
  }

  computeNetworkMetrics(flows) {
    if (flows.length === 0) {
      return {};
    }

    const metrics = {
      averageFlowStrength: 0,
      averageThroughput: 0,
      averageReliability: 0,
      averageLatency: 0,
      averageCostEfficiency: 0,
      averageBottleneckRisk: 0,
      averageDemandMatch: 0,
      averageFlexibility: 0,
      networkHealth: 0
    };

    for (const flow of flows) {
      metrics.averageFlowStrength += flow.flowStrength;
      metrics.averageThroughput += flow.throughput;
      metrics.averageReliability += flow.reliability;
      metrics.averageLatency += flow.latency;
      metrics.averageCostEfficiency += flow.costEfficiency;
      metrics.averageBottleneckRisk += flow.bottleneckRisk;
      metrics.averageDemandMatch += flow.demandMatch;
      metrics.averageFlexibility += flow.flexibility;
      metrics.networkHealth += flow.overallHealth;
    }

    const count = flows.length;
    for (const key in metrics) {
      metrics[key] /= count;
    }

    return metrics;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Network health recommendations
    if (analysis.networkMetrics.networkHealth < 0.5) {
      recommendations.push({
        priority: 'high',
        category: 'network_health',
        message: 'Network health is below optimal. Consider reviewing overall supply chain structure.',
        actionItems: ['Review bottlenecks', 'Assess actor capabilities', 'Optimize relationships']
      });
    }

    // Bottleneck recommendations
    if (analysis.bottlenecks.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'bottlenecks',
        message: `${analysis.bottlenecks.length} potential bottlenecks detected.`,
        actionItems: analysis.bottlenecks.map(b => 
          `Address bottleneck between ${b.from} and ${b.to}: ${b.reason}`
        ).slice(0, 5)
      });
    }

    // Throughput recommendations
    if (analysis.networkMetrics.averageThroughput < 500) {
      recommendations.push({
        priority: 'medium',
        category: 'throughput',
        message: 'Average throughput is lower than optimal.',
        actionItems: ['Increase capacity at key nodes', 'Add parallel paths', 'Optimize logistics']
      });
    }

    // Reliability recommendations
    if (analysis.networkMetrics.averageReliability < 0.7) {
      recommendations.push({
        priority: 'medium',
        category: 'reliability',
        message: 'Network reliability needs improvement.',
        actionItems: ['Add redundant connections', 'Improve actor reliability', 'Implement monitoring']
      });
    }

    // Cost efficiency recommendations
    if (analysis.networkMetrics.averageCostEfficiency < 0.6) {
      recommendations.push({
        priority: 'low',
        category: 'cost',
        message: 'Cost efficiency can be improved.',
        actionItems: ['Negotiate better pricing', 'Optimize routing', 'Consolidate shipments']
      });
    }

    return recommendations;
  }

  /**
   * Predict future flow state based on current embeddings
   */
  predictFutureState(currentFlows, timeHorizon = 30) {
    // Simple temporal prediction based on current state
    const predictions = currentFlows.map(flow => {
      // Add temporal decay and trend factors
      const decayFactor = Math.exp(-0.01 * timeHorizon);
      const trendFactor = 1 + (Math.random() - 0.5) * 0.2;

      return {
        ...flow,
        predictedFlowStrength: flow.flowStrength * decayFactor * trendFactor,
        predictedThroughput: flow.throughput * (0.95 + Math.random() * 0.1),
        predictedReliability: Math.max(0, Math.min(1, flow.reliability + (Math.random() - 0.5) * 0.1)),
        confidence: 0.6 + Math.random() * 0.3,
        horizon: timeHorizon
      };
    });

    return predictions;
  }
}

/**
 * Real-time flow monitor
 */
export class FlowMonitor {
  constructor() {
    this.flowHistory = [];
    this.maxHistorySize = 1000;
  }

  recordFlow(timestamp, flowData) {
    this.flowHistory.push({
      timestamp,
      ...flowData
    });

    // Maintain history size
    if (this.flowHistory.length > this.maxHistorySize) {
      this.flowHistory.shift();
    }
  }

  getRecentFlows(count = 100) {
    return this.flowHistory.slice(-count);
  }

  detectAnomalies(threshold = 0.3) {
    if (this.flowHistory.length < 10) {
      return [];
    }

    const recentFlows = this.flowHistory.slice(-50);
    const avgHealth = recentFlows.reduce((sum, f) => sum + f.overallHealth, 0) / recentFlows.length;

    const anomalies = [];
    for (const flow of recentFlows) {
      if (Math.abs(flow.overallHealth - avgHealth) > threshold) {
        anomalies.push({
          timestamp: flow.timestamp,
          relationshipId: flow.relationshipId,
          deviation: Math.abs(flow.overallHealth - avgHealth),
          expectedHealth: avgHealth,
          actualHealth: flow.overallHealth
        });
      }
    }

    return anomalies;
  }

  getFlowStatistics() {
    if (this.flowHistory.length === 0) {
      return null;
    }

    const stats = {
      totalRecords: this.flowHistory.length,
      timeRange: {
        start: this.flowHistory[0].timestamp,
        end: this.flowHistory[this.flowHistory.length - 1].timestamp
      },
      averageHealth: 0,
      healthTrend: 'stable'
    };

    // Calculate average health
    stats.averageHealth = this.flowHistory.reduce((sum, f) => sum + f.overallHealth, 0) / this.flowHistory.length;

    // Determine trend
    if (this.flowHistory.length > 10) {
      const recent = this.flowHistory.slice(-10);
      const older = this.flowHistory.slice(-20, -10);
      
      const recentAvg = recent.reduce((sum, f) => sum + f.overallHealth, 0) / recent.length;
      const olderAvg = older.reduce((sum, f) => sum + f.overallHealth, 0) / older.length;

      if (recentAvg > olderAvg + 0.05) {
        stats.healthTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.05) {
        stats.healthTrend = 'declining';
      }
    }

    return stats;
  }
}
