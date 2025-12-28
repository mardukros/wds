// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// MRP Tensor Embeddings for materials and demand

export class TensorEmbedding {
  #vector;
  #dimension;

  constructor(dimension) {
    this.#dimension = dimension;
    this.#vector = new Float32Array(dimension);
  }

  get vector() { return this.#vector; }
  get dimension() { return this.#dimension; }

  static random(dimension) {
    const embedding = new TensorEmbedding(dimension);
    const stddev = Math.sqrt(2.0 / dimension);
    for (let i = 0; i < dimension; i++) {
      embedding.#vector[i] = (Math.random() - 0.5) * 2 * stddev;
    }
    return embedding;
  }

  cosineSimilarity(other) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < this.#dimension; i++) {
      dot += this.#vector[i] * other.vector[i];
      normA += this.#vector[i] * this.#vector[i];
      normB += other.vector[i] * other.vector[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  normalize() {
    let norm = 0;
    for (let i = 0; i < this.#dimension; i++) {
      norm += this.#vector[i] * this.#vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.#dimension; i++) {
        this.#vector[i] /= norm;
      }
    }
    return this;
  }

  add(other) {
    const result = new TensorEmbedding(this.#dimension);
    for (let i = 0; i < this.#dimension; i++) {
      result.#vector[i] = this.#vector[i] + other.vector[i];
    }
    return result;
  }

  scale(scalar) {
    const result = new TensorEmbedding(this.#dimension);
    for (let i = 0; i < this.#dimension; i++) {
      result.#vector[i] = this.#vector[i] * scalar;
    }
    return result;
  }

  toArray() {
    return Array.from(this.#vector);
  }
}

export class MaterialEmbedder {
  #dimension;
  #materialEmbeddings;
  #demandEmbeddings;
  #typeEmbeddings;

  constructor(dimension = 128) {
    this.#dimension = dimension;
    this.#materialEmbeddings = new Map();
    this.#demandEmbeddings = new Map();
    this.#typeEmbeddings = new Map();
    this.#initializeTypeEmbeddings();
  }

  #initializeTypeEmbeddings() {
    // Material type embeddings
    const materialTypes = ['raw_material', 'component', 'subassembly', 'finished_good'];
    for (const type of materialTypes) {
      this.#typeEmbeddings.set(`material_${type}`, TensorEmbedding.random(this.#dimension));
    }

    // Category embeddings
    const categories = ['metals', 'textiles', 'electronics', 'plastics', 'mechanical', 'products', 'packaging', 'chemicals'];
    for (const category of categories) {
      this.#typeEmbeddings.set(`category_${category}`, TensorEmbedding.random(this.#dimension));
    }
  }

  embedMaterial(material) {
    if (this.#materialEmbeddings.has(material.id)) {
      return this.#materialEmbeddings.get(material.id);
    }

    // Start with type embedding
    const typeKey = `material_${material.type}`;
    let embedding = new TensorEmbedding(this.#dimension);
    const typeEmb = this.#typeEmbeddings.get(typeKey);
    if (typeEmb) {
      for (let i = 0; i < this.#dimension; i++) {
        embedding.vector[i] = typeEmb.vector[i];
      }
    }

    // Add category embedding
    const categoryKey = `category_${material.category}`;
    const categoryEmb = this.#typeEmbeddings.get(categoryKey);
    if (categoryEmb) {
      embedding = embedding.add(categoryEmb.scale(0.3));
    }

    // Add stock level features
    const stockRatio = material.currentStock / material.maxStock;
    const stockEmb = TensorEmbedding.random(this.#dimension).scale(stockRatio * 0.2);
    embedding = embedding.add(stockEmb);

    // Add reorder urgency
    const urgency = material.currentStock <= material.reorderPoint ? 0.9 : 0.3;
    const urgencyEmb = TensorEmbedding.random(this.#dimension).scale(urgency * 0.15);
    embedding = embedding.add(urgencyEmb);

    // Add cost features (log-scaled)
    const costScale = Math.log(material.unitCost + 1) / 10;
    const costEmb = TensorEmbedding.random(this.#dimension).scale(costScale * 0.15);
    embedding = embedding.add(costEmb);

    // Add quality features
    const qualityEmb = TensorEmbedding.random(this.#dimension).scale(material.quality * 0.1);
    embedding = embedding.add(qualityEmb);

    // Add lead time features
    const leadTimeScale = Math.log(material.leadTime + 1) / 5;
    const leadTimeEmb = TensorEmbedding.random(this.#dimension).scale(leadTimeScale * 0.1);
    embedding = embedding.add(leadTimeEmb);

    embedding.normalize();
    this.#materialEmbeddings.set(material.id, embedding);
    return embedding;
  }

  embedDemand(demand, material) {
    const key = `${demand.id}_${demand.materialId}`;
    if (this.#demandEmbeddings.has(key)) {
      return this.#demandEmbeddings.get(key);
    }

    // Start with material embedding
    const materialEmb = this.embedMaterial(material);
    let embedding = new TensorEmbedding(this.#dimension);
    for (let i = 0; i < this.#dimension; i++) {
      embedding.vector[i] = materialEmb.vector[i];
    }

    // Add forecast features
    const forecastScale = Math.log(demand.forecast + 1) / 10;
    const forecastEmb = TensorEmbedding.random(this.#dimension).scale(forecastScale * 0.3);
    embedding = embedding.add(forecastEmb);

    // Add confidence
    const confidenceEmb = TensorEmbedding.random(this.#dimension).scale(demand.confidence * 0.2);
    embedding = embedding.add(confidenceEmb);

    // Add variance (if available)
    if (demand.variance !== null) {
      const varianceScale = Math.abs(demand.variance) / demand.forecast;
      const varianceEmb = TensorEmbedding.random(this.#dimension).scale(varianceScale * 0.15);
      embedding = embedding.add(varianceEmb);
    }

    embedding.normalize();
    this.#demandEmbeddings.set(key, embedding);
    return embedding;
  }

  findSimilarMaterials(materialId, topK = 5) {
    const targetMaterial = this.#materialEmbeddings.get(materialId);
    if (!targetMaterial) {
      throw new Error(`Material embedding not found: ${materialId}`);
    }

    const similarities = [];
    for (const [id, embedding] of this.#materialEmbeddings.entries()) {
      if (id === materialId) continue;
      const similarity = targetMaterial.cosineSimilarity(embedding);
      similarities.push({ materialId: id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  exportEmbeddings() {
    const result = {
      materials: {},
      demand: {}
    };

    for (const [id, embedding] of this.#materialEmbeddings.entries()) {
      result.materials[id] = embedding.toArray();
    }

    for (const [key, embedding] of this.#demandEmbeddings.entries()) {
      result.demand[key] = embedding.toArray();
    }

    return result;
  }
}
