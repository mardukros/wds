// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Neural Network MRP Implementation

import { MaterialEmbedder, TensorEmbedding } from "nn-mrp-internal:mrp-embeddings";
import { DemandForecastNetwork, InventoryOptimizer, MaterialFlowNetwork } from "nn-mrp-internal:mrp-network";

export class NeuralMRP {
  #materials;
  #demand;
  #embedder;
  #forecastNetwork;
  #optimizer;
  #flowNetwork;
  #initialized;

  constructor(data) {
    this.#materials = new Map();
    this.#demand = new Map();
    this.#initialized = false;

    // Initialize materials
    if (data.materials) {
      for (const material of data.materials) {
        this.#materials.set(material.id, material);
      }
    }

    // Initialize demand
    if (data.demand) {
      for (const demandItem of data.demand) {
        this.#demand.set(demandItem.id, demandItem);
      }
    }

    // Initialize neural components
    const embeddingDim = data.embeddingDimension || 128;
    this.#embedder = new MaterialEmbedder(embeddingDim);
    this.#forecastNetwork = new DemandForecastNetwork(embeddingDim);
    this.#optimizer = new InventoryOptimizer();
    this.#flowNetwork = new MaterialFlowNetwork(embeddingDim);

    // Pre-compute embeddings
    this.#initialize();
  }

  #initialize() {
    if (this.#initialized) return;

    // Embed all materials
    for (const [id, material] of this.#materials.entries()) {
      this.#embedder.embedMaterial(material);
    }

    // Embed all demand
    for (const [id, demandItem] of this.#demand.entries()) {
      const material = this.#materials.get(demandItem.materialId);
      if (material) {
        this.#embedder.embedDemand(demandItem, material);
      }
    }

    this.#initialized = true;
  }

  getMaterial(id) {
    const material = this.#materials.get(id);
    if (!material) {
      throw new Error(`Material not found: ${id}`);
    }
    return material;
  }

  getMaterialEmbedding(materialId) {
    const material = this.getMaterial(materialId);
    const embedding = this.#embedder.embedMaterial(material);
    return {
      materialId,
      embedding: embedding.toArray(),
      dimension: embedding.dimension
    };
  }

  findSimilarMaterials(materialId, topK = 5) {
    const similarities = this.#embedder.findSimilarMaterials(materialId, topK);
    
    return similarities.map(sim => ({
      materialId: sim.materialId,
      material: this.#materials.get(sim.materialId),
      similarity: sim.similarity
    }));
  }

  queryMaterials(filters = {}) {
    let results = Array.from(this.#materials.values());

    if (filters.type) {
      results = results.filter(m => m.type === filters.type);
    }

    if (filters.category) {
      results = results.filter(m => m.category === filters.category);
    }

    if (filters.lowStock) {
      results = results.filter(m => m.currentStock <= m.reorderPoint);
    }

    if (filters.location) {
      results = results.filter(m => m.location === filters.location);
    }

    return results;
  }

  optimizeInventory(materialId) {
    const material = this.getMaterial(materialId);
    
    // Get demand history for this material
    const demandHistory = Array.from(this.#demand.values())
      .filter(d => d.materialId === materialId);

    if (demandHistory.length === 0) {
      return {
        error: 'No demand history available',
        currentStock: material.currentStock,
        reorderPoint: material.reorderPoint
      };
    }

    return this.#optimizer.optimizeInventory(material, demandHistory);
  }

  predictDemand(materialId, demandId) {
    const material = this.getMaterial(materialId);
    const demandItem = this.#demand.get(demandId);
    
    if (!demandItem) {
      throw new Error(`Demand not found: ${demandId}`);
    }

    const materialEmb = this.#embedder.embedMaterial(material);
    const demandEmb = this.#embedder.embedDemand(demandItem, material);

    return this.#forecastNetwork.predictDemand(materialEmb, demandEmb);
  }

  predictMaterialFlow(materialId) {
    const material = this.getMaterial(materialId);
    const materialEmb = this.#embedder.embedMaterial(material);

    return this.#flowNetwork.predictMaterialFlow(materialEmb);
  }

  calculateProductionSchedule() {
    return this.#optimizer.calculateProductionSchedule(this.#materials, Array.from(this.#demand.values()));
  }

  getMRPAnalytics() {
    const materials = Array.from(this.#materials.values());
    const demandItems = Array.from(this.#demand.values());

    const totalInventoryValue = materials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0);
    const lowStockItems = materials.filter(m => m.currentStock <= m.reorderPoint);
    const criticalItems = materials.filter(m => m.currentStock <= m.reorderPoint * 0.5);

    const avgQuality = materials.reduce((sum, m) => sum + m.quality, 0) / materials.length;
    const avgLeadTime = materials.reduce((sum, m) => sum + m.leadTime, 0) / materials.length;

    // Calculate stock turnover
    const avgDemand = demandItems.reduce((sum, d) => sum + (d.actual || d.forecast), 0) / demandItems.length;
    const avgStock = materials.reduce((sum, m) => sum + m.currentStock, 0) / materials.length;
    const turnoverRate = avgDemand / avgStock;

    return {
      summary: {
        totalMaterials: materials.length,
        totalInventoryValue,
        totalDemandRecords: demandItems.length,
        avgQuality,
        avgLeadTime,
        turnoverRate
      },
      inventory: {
        lowStockCount: lowStockItems.length,
        criticalCount: criticalItems.length,
        lowStockItems: lowStockItems.map(m => ({
          id: m.id,
          name: m.name,
          currentStock: m.currentStock,
          reorderPoint: m.reorderPoint,
          urgency: m.currentStock / m.reorderPoint
        })),
        criticalItems: criticalItems.map(m => ({
          id: m.id,
          name: m.name,
          currentStock: m.currentStock,
          reorderPoint: m.reorderPoint,
          suppliers: m.suppliers
        }))
      },
      recommendations: this.#generateRecommendations(lowStockItems, criticalItems)
    };
  }

  #generateRecommendations(lowStockItems, criticalItems) {
    const recommendations = [];

    if (criticalItems.length > 0) {
      recommendations.push(`URGENT: ${criticalItems.length} materials at critical stock levels - immediate action required`);
    }

    if (lowStockItems.length > 5) {
      recommendations.push(`WARNING: ${lowStockItems.length} materials need reordering`);
    }

    recommendations.push('Review supplier lead times for critical materials');
    recommendations.push('Consider increasing safety stock for high-demand items');

    return recommendations;
  }

  exportEmbeddings() {
    return this.#embedder.exportEmbeddings();
  }

  getSummary() {
    return {
      materials: this.#materials.size,
      demand: this.#demand.size,
      initialized: this.#initialized
    };
  }
}
