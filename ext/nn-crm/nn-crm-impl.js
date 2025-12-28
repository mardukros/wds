// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Neural Network CRM Implementation
// Main integration combining customer embeddings with behavior prediction

import { CustomerEmbedder, TensorEmbedding } from "nn-crm-internal:crm-embeddings";
import { CustomerBehaviorNetwork, ChurnPredictor, SalesPipelineNetwork } from "nn-crm-internal:crm-network";

export class NeuralCRM {
  #customers;
  #interactions;
  #embedder;
  #behaviorNetwork;
  #churnPredictor;
  #pipelineNetwork;
  #initialized;

  constructor(data) {
    this.#customers = new Map();
    this.#interactions = new Map();
    this.#initialized = false;

    // Initialize customers
    if (data.customers) {
      for (const customer of data.customers) {
        this.#customers.set(customer.id, customer);
      }
    }

    // Initialize interactions
    if (data.interactions) {
      for (const interaction of data.interactions) {
        const key = `${interaction.id}_${interaction.customerId}`;
        this.#interactions.set(key, interaction);
      }
    }

    // Initialize neural components
    const embeddingDim = data.embeddingDimension || 128;
    this.#embedder = new CustomerEmbedder(embeddingDim);
    this.#behaviorNetwork = new CustomerBehaviorNetwork(embeddingDim);
    this.#churnPredictor = new ChurnPredictor();
    this.#pipelineNetwork = new SalesPipelineNetwork(embeddingDim);

    // Pre-compute embeddings
    this.#initialize();
  }

  #initialize() {
    if (this.#initialized) return;

    // Embed all customers
    for (const [id, customer] of this.#customers.entries()) {
      this.#embedder.embedCustomer(customer);
    }

    // Embed all interactions
    for (const [key, interaction] of this.#interactions.entries()) {
      const customer = this.#customers.get(interaction.customerId);
      if (customer) {
        this.#embedder.embedInteraction(interaction, customer);
      }
    }

    this.#initialized = true;
  }

  /**
   * Get a customer by ID
   */
  getCustomer(id) {
    const customer = this.#customers.get(id);
    if (!customer) {
      throw new Error(`Customer not found: ${id}`);
    }
    return customer;
  }

  /**
   * Get customer embedding
   */
  getCustomerEmbedding(customerId) {
    const customer = this.getCustomer(customerId);
    const embedding = this.#embedder.embedCustomer(customer);
    return {
      customerId,
      embedding: embedding.toArray(),
      dimension: embedding.dimension
    };
  }

  /**
   * Find similar customers based on embeddings
   */
  findSimilarCustomers(customerId, topK = 5) {
    const similarities = this.#embedder.findSimilarCustomers(customerId, topK);
    
    return similarities.map(sim => ({
      customerId: sim.customerId,
      customer: this.#customers.get(sim.customerId),
      similarity: sim.similarity
    }));
  }

  /**
   * Query customers with filters
   */
  queryCustomers(filters = {}) {
    let results = Array.from(this.#customers.values());

    if (filters.type) {
      results = results.filter(c => c.type === filters.type);
    }

    if (filters.industry) {
      results = results.filter(c => c.industry === filters.industry);
    }

    if (filters.segment) {
      results = results.filter(c => c.segment === filters.segment);
    }

    if (filters.minRevenue) {
      results = results.filter(c => c.revenue >= filters.minRevenue);
    }

    if (filters.maxChurnRisk) {
      results = results.filter(c => c.churnRisk <= filters.maxChurnRisk);
    }

    if (filters.engagementLevel) {
      results = results.filter(c => c.engagementLevel === filters.engagementLevel);
    }

    return results;
  }

  /**
   * Predict churn risk for a customer
   */
  predictChurn(customerId) {
    const customer = this.getCustomer(customerId);
    const customerEmbedding = this.#embedder.embedCustomer(customer);

    // Get recent interactions for this customer
    const recentInteractions = [];
    for (const [key, interaction] of this.#interactions.entries()) {
      if (interaction.customerId === customerId) {
        const interactionEmbedding = this.#embedder.embedInteraction(interaction, customer);
        recentInteractions.push({ ...interaction, embedding: interactionEmbedding });
      }
    }

    if (recentInteractions.length === 0) {
      return {
        churnRisk: customer.churnRisk,
        satisfaction: customer.satisfactionScore,
        engagement: customer.engagementLevel === 'very_high' ? 0.9 : customer.engagementLevel === 'high' ? 0.7 : 0.5,
        riskLevel: customer.churnRisk > 0.5 ? 'high' : customer.churnRisk > 0.3 ? 'medium' : 'low',
        riskFactors: [],
        recommendations: ['Increase customer engagement - no recent interactions found']
      };
    }

    return this.#churnPredictor.predictChurn(customerEmbedding, recentInteractions);
  }

  /**
   * Analyze customer lifecycle
   */
  analyzeLifecycle(customerId) {
    const customer = this.getCustomer(customerId);
    const interactions = Array.from(this.#interactions.values()).filter(
      i => i.customerId === customerId
    );

    return this.#churnPredictor.analyzeCustomerLifecycle(customer, interactions);
  }

  /**
   * Predict sales pipeline metrics
   */
  predictSalesPipeline(customerId) {
    const customer = this.getCustomer(customerId);
    const customerEmbedding = this.#embedder.embedCustomer(customer);

    return this.#pipelineNetwork.predictPipelineMetrics(customerEmbedding);
  }

  /**
   * Segment customers using clustering
   */
  segmentCustomers() {
    const segments = {
      'high_value_low_risk': [],
      'high_value_high_risk': [],
      'growth_potential': [],
      'at_risk': [],
      'low_engagement': []
    };

    for (const customer of this.#customers.values()) {
      if (customer.lifetimeValue > 1000000 && customer.churnRisk < 0.2) {
        segments.high_value_low_risk.push(customer);
      } else if (customer.lifetimeValue > 1000000 && customer.churnRisk >= 0.2) {
        segments.high_value_high_risk.push(customer);
      } else if (customer.engagementLevel === 'high' || customer.engagementLevel === 'very_high') {
        segments.growth_potential.push(customer);
      } else if (customer.churnRisk > 0.4) {
        segments.at_risk.push(customer);
      } else {
        segments.low_engagement.push(customer);
      }
    }

    return segments;
  }

  /**
   * Get CRM analytics summary
   */
  getCRMAnalytics() {
    const customers = Array.from(this.#customers.values());
    const interactions = Array.from(this.#interactions.values());

    const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
    const totalLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
    const avgChurnRisk = customers.reduce((sum, c) => sum + c.churnRisk, 0) / customers.length;
    const avgSatisfaction = customers.reduce((sum, c) => sum + c.satisfactionScore, 0) / customers.length;

    const highRiskCustomers = customers.filter(c => c.churnRisk > 0.4);
    const highValueCustomers = customers.filter(c => c.lifetimeValue > 1000000);

    const segments = this.segmentCustomers();

    return {
      summary: {
        totalCustomers: customers.length,
        totalRevenue,
        totalLifetimeValue: totalLTV,
        avgChurnRisk,
        avgSatisfaction,
        totalInteractions: interactions.length
      },
      segments: {
        highValueLowRisk: segments.high_value_low_risk.length,
        highValueHighRisk: segments.high_value_high_risk.length,
        growthPotential: segments.growth_potential.length,
        atRisk: segments.at_risk.length,
        lowEngagement: segments.low_engagement.length
      },
      alerts: {
        highRiskCount: highRiskCustomers.length,
        highRiskCustomers: highRiskCustomers.map(c => ({
          id: c.id,
          name: c.name,
          churnRisk: c.churnRisk,
          lifetimeValue: c.lifetimeValue
        }))
      },
      topCustomers: highValueCustomers
        .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          lifetimeValue: c.lifetimeValue,
          satisfactionScore: c.satisfactionScore
        }))
    };
  }

  /**
   * Export embeddings for external ML pipelines
   */
  exportEmbeddings() {
    return this.#embedder.exportEmbeddings();
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return {
      customers: this.#customers.size,
      interactions: this.#interactions.size,
      initialized: this.#initialized
    };
  }
}
