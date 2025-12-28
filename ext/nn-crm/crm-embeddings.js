// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// CRM Tensor Embeddings
// Generate embeddings for customers and interactions

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
    // Xavier initialization
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

  euclideanDistance(other) {
    let sum = 0;
    for (let i = 0; i < this.#dimension; i++) {
      const diff = this.#vector[i] - other.vector[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
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

export class CustomerEmbedder {
  #dimension;
  #customerEmbeddings;
  #interactionEmbeddings;
  #typeEmbeddings;

  constructor(dimension = 128) {
    this.#dimension = dimension;
    this.#customerEmbeddings = new Map();
    this.#interactionEmbeddings = new Map();
    this.#typeEmbeddings = new Map();
    this.#initializeTypeEmbeddings();
  }

  #initializeTypeEmbeddings() {
    // Customer type embeddings
    const customerTypes = ['enterprise', 'smb', 'consumer'];
    for (const type of customerTypes) {
      this.#typeEmbeddings.set(`customer_${type}`, TensorEmbedding.random(this.#dimension));
    }

    // Interaction type embeddings
    const interactionTypes = ['sale', 'support', 'upsell', 'renewal', 'churn'];
    for (const type of interactionTypes) {
      this.#typeEmbeddings.set(`interaction_${type}`, TensorEmbedding.random(this.#dimension));
    }

    // Industry embeddings
    const industries = ['Technology', 'Retail', 'Healthcare', 'Education', 'Manufacturing', 'Logistics'];
    for (const industry of industries) {
      this.#typeEmbeddings.set(`industry_${industry}`, TensorEmbedding.random(this.#dimension));
    }
  }

  embedCustomer(customer) {
    if (this.#customerEmbeddings.has(customer.id)) {
      return this.#customerEmbeddings.get(customer.id);
    }

    // Start with type embedding
    const typeKey = `customer_${customer.type}`;
    let embedding = this.#typeEmbeddings.get(typeKey) || TensorEmbedding.random(this.#dimension);
    embedding = new TensorEmbedding(this.#dimension);
    const typeEmb = this.#typeEmbeddings.get(typeKey);
    if (typeEmb) {
      for (let i = 0; i < this.#dimension; i++) {
        embedding.vector[i] = typeEmb.vector[i];
      }
    }

    // Add industry embedding
    const industryKey = `industry_${customer.industry}`;
    const industryEmb = this.#typeEmbeddings.get(industryKey);
    if (industryEmb) {
      embedding = embedding.add(industryEmb.scale(0.3));
    }

    // Add revenue features (log-scaled)
    const revenueScale = Math.log(customer.revenue + 1) / 20;
    const revenueEmb = TensorEmbedding.random(this.#dimension).scale(revenueScale * 0.2);
    embedding = embedding.add(revenueEmb);

    // Add engagement features
    const engagementMap = { 'very_high': 1.0, 'high': 0.8, 'medium': 0.6, 'low': 0.4 };
    const engagementScore = engagementMap[customer.engagementLevel] || 0.5;
    const engagementEmb = TensorEmbedding.random(this.#dimension).scale(engagementScore * 0.15);
    embedding = embedding.add(engagementEmb);

    // Add satisfaction and churn risk
    const satisfactionEmb = TensorEmbedding.random(this.#dimension).scale(customer.satisfactionScore * 0.15);
    embedding = embedding.add(satisfactionEmb);

    const churnEmb = TensorEmbedding.random(this.#dimension).scale((1 - customer.churnRisk) * 0.1);
    embedding = embedding.add(churnEmb);

    embedding.normalize();
    this.#customerEmbeddings.set(customer.id, embedding);
    return embedding;
  }

  embedInteraction(interaction, customer) {
    const key = `${interaction.id}_${interaction.customerId}`;
    if (this.#interactionEmbeddings.has(key)) {
      return this.#interactionEmbeddings.get(key);
    }

    // Start with interaction type embedding
    const typeKey = `interaction_${interaction.type}`;
    let embedding = this.#typeEmbeddings.get(typeKey) || TensorEmbedding.random(this.#dimension);
    embedding = new TensorEmbedding(this.#dimension);
    const typeEmb = this.#typeEmbeddings.get(typeKey);
    if (typeEmb) {
      for (let i = 0; i < this.#dimension; i++) {
        embedding.vector[i] = typeEmb.vector[i];
      }
    }

    // Add customer embedding influence
    const customerEmb = this.embedCustomer(customer);
    embedding = embedding.add(customerEmb.scale(0.4));

    // Add value features (if applicable)
    if (interaction.value > 0) {
      const valueScale = Math.log(interaction.value + 1) / 15;
      const valueEmb = TensorEmbedding.random(this.#dimension).scale(valueScale * 0.2);
      embedding = embedding.add(valueEmb);
    }

    // Add sentiment
    const sentimentEmb = TensorEmbedding.random(this.#dimension).scale(interaction.sentiment * 0.15);
    embedding = embedding.add(sentimentEmb);

    embedding.normalize();
    this.#interactionEmbeddings.set(key, embedding);
    return embedding;
  }

  findSimilarCustomers(customerId, topK = 5) {
    const targetCustomer = this.#customerEmbeddings.get(customerId);
    if (!targetCustomer) {
      throw new Error(`Customer embedding not found: ${customerId}`);
    }

    const similarities = [];
    for (const [id, embedding] of this.#customerEmbeddings.entries()) {
      if (id === customerId) continue;
      const similarity = targetCustomer.cosineSimilarity(embedding);
      similarities.push({ customerId: id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  exportEmbeddings() {
    const result = {
      customers: {},
      interactions: {}
    };

    for (const [id, embedding] of this.#customerEmbeddings.entries()) {
      result.customers[id] = embedding.toArray();
    }

    for (const [key, embedding] of this.#interactionEmbeddings.entries()) {
      result.interactions[key] = embedding.toArray();
    }

    return result;
  }
}
