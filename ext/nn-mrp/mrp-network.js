// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// MRP Neural Network - Demand forecasting and inventory optimization

export class DenseLayer {
  #weights;
  #bias;
  #inputSize;
  #outputSize;
  #activation;

  constructor(inputSize, outputSize, activation = 'relu') {
    this.#inputSize = inputSize;
    this.#outputSize = outputSize;
    this.#activation = activation;
    this.#initializeWeights();
  }

  #initializeWeights() {
    const stddev = Math.sqrt(2.0 / (this.#inputSize + this.#outputSize));
    this.#weights = Array(this.#outputSize).fill(0).map(() =>
      Array(this.#inputSize).fill(0).map(() => (Math.random() - 0.5) * 2 * stddev)
    );
    this.#bias = Array(this.#outputSize).fill(0);
  }

  forward(input) {
    const output = Array(this.#outputSize).fill(0);
    
    for (let i = 0; i < this.#outputSize; i++) {
      let sum = this.#bias[i];
      for (let j = 0; j < this.#inputSize; j++) {
        sum += this.#weights[i][j] * input[j];
      }
      output[i] = sum;
    }

    return this.#applyActivation(output);
  }

  #applyActivation(values) {
    switch (this.#activation) {
      case 'relu':
        return values.map(v => Math.max(0, v));
      case 'sigmoid':
        return values.map(v => 1 / (1 + Math.exp(-v)));
      case 'linear':
        return values;
      default:
        return values;
    }
  }
}

export class DemandForecastNetwork {
  #hiddenLayer1;
  #hiddenLayer2;
  #outputLayer;
  #embeddingDim;

  constructor(embeddingDim = 128) {
    this.#embeddingDim = embeddingDim;
    const inputDim = embeddingDim * 2; // material + demand embeddings

    this.#hiddenLayer1 = new DenseLayer(inputDim, 256, 'relu');
    this.#hiddenLayer2 = new DenseLayer(256, 128, 'relu');
    this.#outputLayer = new DenseLayer(128, 7, 'sigmoid'); // 7 forecast metrics
  }

  predictDemand(materialEmbedding, demandEmbedding) {
    const input = [...materialEmbedding.toArray(), ...demandEmbedding.toArray()];

    const hidden1 = this.#hiddenLayer1.forward(input);
    const hidden2 = this.#hiddenLayer2.forward(hidden1);
    const output = this.#outputLayer.forward(hidden2);

    return {
      forecastAccuracy: output[0],
      demandVolatility: output[1],
      seasonalityFactor: output[2],
      trendStrength: output[3],
      stockoutRisk: output[4],
      overstock Risk: output[5],
      optimalOrderQuantity: output[6] * 1000 // Scale to realistic quantity
    };
  }
}

export class InventoryOptimizer {
  #forecastNetwork;

  constructor() {
    this.#forecastNetwork = new DemandForecastNetwork();
  }

  optimizeInventory(material, demandHistory) {
    // Calculate reorder point and optimal order quantity
    const avgDemand = demandHistory.reduce((sum, d) => sum + (d.actual || d.forecast), 0) / demandHistory.length;
    const maxDemand = Math.max(...demandHistory.map(d => d.actual || d.forecast));
    
    const safetyStock = (maxDemand - avgDemand) * (material.leadTime / 7);
    const reorderPoint = (avgDemand * material.leadTime / 7) + safetyStock;
    
    // Economic Order Quantity (EOQ)
    const annualDemand = avgDemand * 4; // Quarterly to annual
    const orderingCost = 100; // Assumed fixed ordering cost
    const holdingCost = material.unitCost * 0.25; // 25% holding cost
    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);

    const stockoutRisk = material.currentStock < reorderPoint ? 0.8 : 0.2;
    const overstockRisk = material.currentStock > material.maxStock * 0.8 ? 0.7 : 0.3;

    return {
      currentStock: material.currentStock,
      reorderPoint: Math.round(reorderPoint),
      safetyStock: Math.round(safetyStock),
      economicOrderQuantity: Math.round(eoq),
      stockoutRisk,
      overstockRisk,
      recommendedAction: this.#getRecommendation(material, reorderPoint, stockoutRisk)
    };
  }

  #getRecommendation(material, reorderPoint, stockoutRisk) {
    if (material.currentStock <= material.reorderPoint) {
      return 'URGENT: Order immediately';
    } else if (material.currentStock <= reorderPoint) {
      return 'WARNING: Approaching reorder point';
    } else if (stockoutRisk > 0.6) {
      return 'CAUTION: High stockout risk';
    } else if (material.currentStock > material.maxStock * 0.9) {
      return 'INFO: Excess inventory';
    } else {
      return 'OK: Normal stock levels';
    }
  }

  calculateProductionSchedule(materials, demand) {
    const schedule = [];
    
    for (const demandItem of demand) {
      const material = materials.get(demandItem.materialId);
      if (!material) continue;

      const requiredQuantity = demandItem.forecast;
      const availableQuantity = material.currentStock;
      const shortfall = Math.max(0, requiredQuantity - availableQuantity);

      schedule.push({
        materialId: material.id,
        materialName: material.name,
        period: demandItem.period,
        requiredQuantity,
        availableQuantity,
        shortfall,
        productionNeeded: shortfall > 0,
        leadTime: material.leadTime,
        estimatedCost: shortfall * material.unitCost
      });
    }

    return schedule;
  }
}

export class MaterialFlowNetwork {
  #hiddenLayer;
  #outputLayer;

  constructor(embeddingDim = 128) {
    this.#hiddenLayer = new DenseLayer(embeddingDim, 64, 'relu');
    this.#outputLayer = new DenseLayer(64, 5, 'sigmoid'); // 5 flow metrics
  }

  predictMaterialFlow(materialEmbedding) {
    const input = materialEmbedding.toArray();
    
    const hidden = this.#hiddenLayer.forward(input);
    const output = this.#outputLayer.forward(hidden);

    return {
      throughput: output[0],
      utilizationRate: output[1],
      wasteRate: output[2],
      qualityScore: output[3],
      efficiency: output[4]
    };
  }
}
