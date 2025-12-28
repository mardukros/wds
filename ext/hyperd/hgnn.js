// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Hyper-Graph Neural Network (HGNN) - Unified integration across all nn-* systems

export class HyperEdge {
  #id;
  #nodes;
  #type;
  #weight;
  #metadata;

  constructor(id, nodes, type, weight = 1.0, metadata = {}) {
    this.#id = id;
    this.#nodes = nodes; // Array of node IDs from different systems
    this.#type = type;
    this.#weight = weight;
    this.#metadata = metadata;
  }

  get id() { return this.#id; }
  get nodes() { return this.#nodes; }
  get type() { return this.#type; }
  get weight() { return this.#weight; }
  get metadata() { return this.#metadata; }
}

export class HyperGraphEmbedding {
  #vector;
  #dimension;
  #contributors; // Track which systems contributed to this embedding

  constructor(dimension) {
    this.#dimension = dimension;
    this.#vector = new Float32Array(dimension);
    this.#contributors = new Set();
  }

  get vector() { return this.#vector; }
  get dimension() { return this.#dimension; }
  get contributors() { return Array.from(this.#contributors); }

  static fromMultipleEmbeddings(embeddings, weights = null) {
    if (embeddings.length === 0) {
      throw new Error('At least one embedding required');
    }

    const dim = embeddings[0].dimension;
    const hyperEmb = new HyperGraphEmbedding(dim);
    
    // Default equal weights if not provided
    if (!weights) {
      weights = Array(embeddings.length).fill(1.0 / embeddings.length);
    }

    // Weighted sum of embeddings
    for (let i = 0; i < embeddings.length; i++) {
      const emb = embeddings[i];
      const weight = weights[i];
      
      for (let j = 0; j < dim; j++) {
        hyperEmb.#vector[j] += emb.vector[j] * weight;
      }
      
      if (emb.system) {
        hyperEmb.#contributors.add(emb.system);
      }
    }

    // Normalize
    let norm = 0;
    for (let i = 0; i < dim; i++) {
      norm += hyperEmb.#vector[i] * hyperEmb.#vector[i];
    }
    norm = Math.sqrt(norm);
    
    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        hyperEmb.#vector[i] /= norm;
      }
    }

    return hyperEmb;
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

  toArray() {
    return Array.from(this.#vector);
  }
}

export class HyperGraphAttention {
  #attentionWeights;
  #numHeads;
  #dimension;

  constructor(dimension, numHeads = 4) {
    this.#dimension = dimension;
    this.#numHeads = numHeads;
    this.#attentionWeights = this.#initializeWeights();
  }

  #initializeWeights() {
    const weights = [];
    for (let head = 0; head < this.#numHeads; head++) {
      const W = Array(this.#dimension).fill(0).map(() =>
        Array(this.#dimension).fill(0).map(() => (Math.random() - 0.5) * 0.1)
      );
      weights.push(W);
    }
    return weights;
  }

  computeAttention(queryEmb, keyEmbs) {
    const allScores = [];
    
    for (let head = 0; head < this.#numHeads; head++) {
      const W = this.#attentionWeights[head];
      const scores = [];
      
      // Transform query
      const q = this.#transform(queryEmb.vector, W);
      
      // Compute attention scores
      for (const keyEmb of keyEmbs) {
        const k = this.#transform(keyEmb.vector, W);
        const score = this.#dotProduct(q, k) / Math.sqrt(this.#dimension);
        scores.push(score);
      }
      
      allScores.push(this.#softmax(scores));
    }
    
    // Average across heads
    const finalScores = Array(keyEmbs.length).fill(0);
    for (let i = 0; i < keyEmbs.length; i++) {
      for (let head = 0; head < this.#numHeads; head++) {
        finalScores[i] += allScores[head][i];
      }
      finalScores[i] /= this.#numHeads;
    }
    
    return finalScores;
  }

  #transform(vector, W) {
    const result = Array(this.#dimension).fill(0);
    for (let i = 0; i < this.#dimension; i++) {
      for (let j = 0; j < this.#dimension; j++) {
        result[i] += W[i][j] * vector[j];
      }
    }
    return result;
  }

  #dotProduct(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  #softmax(scores) {
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - maxScore));
    const sum = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(s => s / sum);
  }
}

export class HyperGraphNeuralNetwork {
  #nodes;          // Map of node_id -> {system, type, embedding}
  #hyperEdges;     // Map of edge_id -> HyperEdge
  #attention;
  #dimension;

  constructor(dimension = 128) {
    this.#dimension = dimension;
    this.#nodes = new Map();
    this.#hyperEdges = new Map();
    this.#attention = new HyperGraphAttention(dimension, 4);
  }

  addNode(nodeId, system, type, embedding) {
    this.#nodes.set(nodeId, {
      system,
      type,
      embedding: { ...embedding, system }
    });
  }

  addHyperEdge(edgeId, nodeIds, type, weight = 1.0, metadata = {}) {
    // Validate all nodes exist
    for (const nodeId of nodeIds) {
      if (!this.#nodes.has(nodeId)) {
        throw new Error(`Node not found: ${nodeId}`);
      }
    }
    
    const hyperEdge = new HyperEdge(edgeId, nodeIds, type, weight, metadata);
    this.#hyperEdges.set(edgeId, hyperEdge);
    return hyperEdge;
  }

  getNode(nodeId) {
    return this.#nodes.get(nodeId);
  }

  getHyperEdge(edgeId) {
    return this.#hyperEdges.get(edgeId);
  }

  /**
   * Propagate information across hyper-edges using attention mechanism
   */
  propagate(targetNodeId, hops = 2) {
    const target = this.#nodes.get(targetNodeId);
    if (!target) {
      throw new Error(`Target node not found: ${targetNodeId}`);
    }

    let currentEmbedding = target.embedding;
    const visited = new Set([targetNodeId]);
    
    for (let hop = 0; hop < hops; hop++) {
      // Find all hyper-edges containing visited nodes
      const relevantEdges = Array.from(this.#hyperEdges.values())
        .filter(edge => edge.nodes.some(nodeId => visited.has(nodeId)));
      
      if (relevantEdges.length === 0) break;
      
      // Collect neighbor embeddings
      const neighborEmbeddings = [];
      for (const edge of relevantEdges) {
        for (const nodeId of edge.nodes) {
          if (!visited.has(nodeId)) {
            visited.add(nodeId);
            const node = this.#nodes.get(nodeId);
            if (node) {
              neighborEmbeddings.push(node.embedding);
            }
          }
        }
      }
      
      if (neighborEmbeddings.length === 0) continue;
      
      // Compute attention weights
      const attentionScores = this.#attention.computeAttention(
        currentEmbedding,
        neighborEmbeddings
      );
      
      // Update embedding with attention-weighted neighbors
      const updatedEmb = HyperGraphEmbedding.fromMultipleEmbeddings(
        [currentEmbedding, ...neighborEmbeddings],
        [0.5, ...attentionScores.map(s => 0.5 * s)]
      );
      
      currentEmbedding = updatedEmb;
    }
    
    return {
      nodeId: targetNodeId,
      embedding: currentEmbedding,
      hopsCompleted: hops,
      nodesVisited: visited.size
    };
  }

  /**
   * Find multi-hop paths between nodes across different systems
   */
  findCrossDomainPaths(sourceNodeId, targetNodeId, maxHops = 3) {
    const paths = [];
    const queue = [[sourceNodeId]];
    const visited = new Set();
    
    while (queue.length > 0) {
      const path = queue.shift();
      const currentNode = path[path.length - 1];
      
      if (currentNode === targetNodeId) {
        paths.push(path);
        continue;
      }
      
      if (path.length >= maxHops) continue;
      
      // Find hyper-edges containing current node
      for (const [edgeId, edge] of this.#hyperEdges.entries()) {
        if (edge.nodes.includes(currentNode)) {
          for (const neighborId of edge.nodes) {
            if (neighborId !== currentNode && !path.includes(neighborId)) {
              const newPath = [...path, neighborId];
              const pathKey = newPath.join('-');
              if (!visited.has(pathKey)) {
                visited.add(pathKey);
                queue.push(newPath);
              }
            }
          }
        }
      }
    }
    
    return paths.map(path => ({
      path,
      length: path.length - 1,
      systems: path.map(nodeId => this.#nodes.get(nodeId)?.system).filter(Boolean)
    }));
  }

  /**
   * Get aggregated insights across all systems
   */
  getNetworkInsights() {
    const systemCounts = {};
    const edgeTypeCounts = {};
    
    for (const node of this.#nodes.values()) {
      systemCounts[node.system] = (systemCounts[node.system] || 0) + 1;
    }
    
    for (const edge of this.#hyperEdges.values()) {
      edgeTypeCounts[edge.type] = (edgeTypeCounts[edge.type] || 0) + 1;
    }
    
    return {
      totalNodes: this.#nodes.size,
      totalHyperEdges: this.#hyperEdges.size,
      systemDistribution: systemCounts,
      edgeTypeDistribution: edgeTypeCounts,
      avgNodesPerEdge: Array.from(this.#hyperEdges.values())
        .reduce((sum, edge) => sum + edge.nodes.length, 0) / this.#hyperEdges.size
    };
  }

  exportGraph() {
    return {
      nodes: Array.from(this.#nodes.entries()).map(([id, node]) => ({
        id,
        system: node.system,
        type: node.type
      })),
      hyperEdges: Array.from(this.#hyperEdges.entries()).map(([id, edge]) => ({
        id,
        nodes: edge.nodes,
        type: edge.type,
        weight: edge.weight,
        metadata: edge.metadata
      }))
    };
  }
}
