// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Hyperd - Computational Graph Orchestration Daemon
// Orchestrates all nn-* systems (scm, erp, crm, mrp, lms) through a unified computational graph

import { HyperGraphNeuralNetwork, HyperGraphEmbedding } from "hyperd-internal:hgnn";

export class ComputationalNode {
  #id;
  #system;
  #operation;
  #inputs;
  #outputs;
  #status;
  #result;

  constructor(id, system, operation, inputs = []) {
    this.#id = id;
    this.#system = system;
    this.#operation = operation;
    this.#inputs = inputs;
    this.#outputs = [];
    this.#status = 'pending';
    this.#result = null;
  }

  get id() { return this.#id; }
  get system() { return this.#system; }
  get operation() { return this.#operation; }
  get inputs() { return this.#inputs; }
  get outputs() { return this.#outputs; }
  get status() { return this.#status; }
  get result() { return this.#result; }

  addOutput(nodeId) {
    this.#outputs.push(nodeId);
  }

  setStatus(status) {
    this.#status = status;
  }

  setResult(result) {
    this.#result = result;
    this.#status = 'completed';
  }
}

export class ComputationalGraph {
  #nodes;
  #executionOrder;
  #systems;

  constructor() {
    this.#nodes = new Map();
    this.#executionOrder = [];
    this.#systems = new Map();
  }

  registerSystem(name, instance) {
    this.#systems.set(name, instance);
  }

  addNode(id, system, operation, inputs = []) {
    const node = new ComputationalNode(id, system, operation, inputs);
    this.#nodes.set(id, node);
    
    // Update output connections
    for (const inputId of inputs) {
      const inputNode = this.#nodes.get(inputId);
      if (inputNode) {
        inputNode.addOutput(id);
      }
    }
    
    return node;
  }

  getNode(id) {
    return this.#nodes.get(id);
  }

  /**
   * Topologically sort the graph for execution
   */
  buildExecutionOrder() {
    const visited = new Set();
    const tempMark = new Set();
    const order = [];

    const visit = (nodeId) => {
      if (tempMark.has(nodeId)) {
        throw new Error(`Cycle detected in computational graph at node: ${nodeId}`);
      }
      
      if (!visited.has(nodeId)) {
        tempMark.add(nodeId);
        
        const node = this.#nodes.get(nodeId);
        if (node) {
          for (const inputId of node.inputs) {
            visit(inputId);
          }
        }
        
        tempMark.delete(nodeId);
        visited.add(nodeId);
        order.push(nodeId);
      }
    };

    for (const nodeId of this.#nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    this.#executionOrder = order;
    return order;
  }

  /**
   * Execute the computational graph
   */
  async execute() {
    if (this.#executionOrder.length === 0) {
      this.buildExecutionOrder();
    }

    const results = new Map();

    for (const nodeId of this.#executionOrder) {
      const node = this.#nodes.get(nodeId);
      if (!node) continue;

      node.setStatus('running');

      try {
        // Collect input results
        const inputResults = node.inputs.map(inputId => results.get(inputId));
        
        // Execute operation
        const system = this.#systems.get(node.system);
        if (!system) {
          throw new Error(`System not registered: ${node.system}`);
        }

        const result = await this.#executeOperation(system, node.operation, inputResults);
        
        node.setResult(result);
        results.set(nodeId, result);
      } catch (error) {
        node.setStatus('failed');
        node.setResult({ error: error.message });
        throw error;
      }
    }

    return results;
  }

  async #executeOperation(system, operation, inputs) {
    // Parse operation format: "method:args"
    const [method, ...args] = operation.split(':');
    
    if (typeof system[method] === 'function') {
      return await system[method](...args, ...inputs);
    } else {
      throw new Error(`Method not found: ${method} in system`);
    }
  }

  getExecutionPlan() {
    if (this.#executionOrder.length === 0) {
      this.buildExecutionOrder();
    }

    return this.#executionOrder.map(nodeId => {
      const node = this.#nodes.get(nodeId);
      return {
        id: node.id,
        system: node.system,
        operation: node.operation,
        inputs: node.inputs,
        outputs: node.outputs,
        status: node.status
      };
    });
  }

  exportGraph() {
    return {
      nodes: Array.from(this.#nodes.values()).map(node => ({
        id: node.id,
        system: node.system,
        operation: node.operation,
        inputs: node.inputs,
        outputs: node.outputs,
        status: node.status
      })),
      executionOrder: this.#executionOrder
    };
  }
}

export class Hyperd {
  #hgnn;
  #computeGraph;
  #systems;
  #eventQueue;
  #initialized;

  constructor() {
    this.#hgnn = new HyperGraphNeuralNetwork(128);
    this.#computeGraph = new ComputationalGraph();
    this.#systems = {};
    this.#eventQueue = [];
    this.#initialized = false;
  }

  /**
   * Register a neural network system (scm, erp, crm, mrp, lms)
   */
  registerSystem(name, instance) {
    this.#systems[name] = instance;
    this.#computeGraph.registerSystem(name, instance);
  }

  /**
   * Initialize the unified hyper-graph from all registered systems
   */
  initializeHyperGraph() {
    // Add nodes from all systems
    for (const [systemName, system] of Object.entries(this.#systems)) {
      if (typeof system.exportEmbeddings === 'function') {
        const embeddings = system.exportEmbeddings();
        
        // Add entity nodes with their embeddings
        for (const [entityId, embedding] of Object.entries(embeddings)) {
          if (Array.isArray(embedding)) {
            this.#hgnn.addNode(
              `${systemName}:${entityId}`,
              systemName,
              'entity',
              { vector: embedding, dimension: embedding.length }
            );
          } else if (typeof embedding === 'object') {
            // Handle nested embeddings
            for (const [subId, subEmb] of Object.entries(embedding)) {
              if (Array.isArray(subEmb)) {
                this.#hgnn.addNode(
                  `${systemName}:${entityId}:${subId}`,
                  systemName,
                  'entity',
                  { vector: subEmb, dimension: subEmb.length }
                );
              }
            }
          }
        }
      }
    }

    this.#initialized = true;
  }

  /**
   * Create cross-domain hyper-edges based on relationships
   */
  createCrossDomainEdges() {
    if (!this.#initialized) {
      this.initializeHyperGraph();
    }

    // Example: Connect supply chain actors to customers and materials
    // scm actor s1 -> crm customer c1 -> mrp material m1 (B2B supply chain)
    
    const edgeConfigs = [
      {
        id: 'supply_to_customer_edge_1',
        nodes: ['scm:s1', 'crm:c1', 'mrp:m1'],
        type: 'supply_chain_integration',
        weight: 0.9,
        metadata: { relationship: 'supplier_to_enterprise_customer_material' }
      },
      {
        id: 'employee_learning_edge_1',
        nodes: ['crm:c1', 'lms:l1'],
        type: 'customer_training',
        weight: 0.8,
        metadata: { relationship: 'enterprise_customer_employee_learning' }
      },
      {
        id: 'material_demand_edge_1',
        nodes: ['mrp:m6', 'crm:c3', 'scm:d1'],
        type: 'demand_fulfillment',
        weight: 0.95,
        metadata: { relationship: 'finished_good_to_customer_via_distributor' }
      }
    ];

    for (const config of edgeConfigs) {
      try {
        this.#hgnn.addHyperEdge(
          config.id,
          config.nodes,
          config.type,
          config.weight,
          config.metadata
        );
      } catch (error) {
        console.error(`Failed to create hyper-edge ${config.id}:`, error.message);
      }
    }
  }

  /**
   * Build and execute a computational graph for cross-system analysis
   */
  async executeWorkflow(workflowName, params = {}) {
    const graph = new ComputationalGraph();
    
    // Register systems
    for (const [name, system] of Object.entries(this.#systems)) {
      graph.registerSystem(name, system);
    }

    // Define workflows
    switch (workflowName) {
      case 'full_enterprise_analysis':
        return await this.#executeFullEnterpriseAnalysis(graph);
      
      case 'supply_demand_optimization':
        return await this.#executeSupplyDemandOptimization(graph, params);
      
      case 'customer_material_learning':
        return await this.#executeCustomerMaterialLearning(graph, params);
      
      default:
        throw new Error(`Unknown workflow: ${workflowName}`);
    }
  }

  async #executeFullEnterpriseAnalysis(graph) {
    // Node 1: Get SCM analytics
    graph.addNode('n1', 'scm', 'getERPSCMAnalysis', []);
    
    // Node 2: Get CRM analytics
    graph.addNode('n2', 'crm', 'getCRMAnalytics', []);
    
    // Node 3: Get MRP analytics
    graph.addNode('n3', 'mrp', 'getMRPAnalytics', []);
    
    // Node 4: Get LMS analytics
    graph.addNode('n4', 'lms', 'getLMSAnalytics', []);

    const results = await graph.execute();
    
    return {
      workflow: 'full_enterprise_analysis',
      scm: results.get('n1'),
      crm: results.get('n2'),
      mrp: results.get('n3'),
      lms: results.get('n4'),
      timestamp: new Date().toISOString()
    };
  }

  async #executeSupplyDemandOptimization(graph, params) {
    // This would orchestrate across SCM, MRP, and CRM
    const { materialId, customerId } = params;
    
    graph.addNode('n1', 'mrp', `optimizeInventory:${materialId}`, []);
    graph.addNode('n2', 'crm', `predictChurn:${customerId}`, []);
    
    const results = await graph.execute();
    
    return {
      workflow: 'supply_demand_optimization',
      inventory: results.get('n1'),
      customer: results.get('n2')
    };
  }

  async #executeCustomerMaterialLearning(graph, params) {
    // Orchestrate CRM, MRP, and LMS
    const { customerId, materialId, learnerId } = params;
    
    graph.addNode('n1', 'crm', `getCustomer:${customerId}`, []);
    graph.addNode('n2', 'mrp', `getMaterial:${materialId}`, []);
    graph.addNode('n3', 'lms', `getLearner:${learnerId}`, []);
    
    const results = await graph.execute();
    
    return {
      workflow: 'customer_material_learning',
      customer: results.get('n1'),
      material: results.get('n2'),
      learner: results.get('n3')
    };
  }

  /**
   * Query across all systems using the hyper-graph
   */
  crossDomainQuery(sourceSystem, sourceEntity, targetSystem, maxHops = 3) {
    if (!this.#initialized) {
      this.initializeHyperGraph();
      this.createCrossDomainEdges();
    }

    const sourceNodeId = `${sourceSystem}:${sourceEntity}`;
    
    // Find all nodes in target system
    const targetNodes = Array.from(this.#hgnn.exportGraph().nodes)
      .filter(node => node.system === targetSystem)
      .map(node => node.id);

    const paths = [];
    for (const targetNodeId of targetNodes) {
      const foundPaths = this.#hgnn.findCrossDomainPaths(sourceNodeId, targetNodeId, maxHops);
      paths.push(...foundPaths);
    }

    return {
      sourceSystem,
      sourceEntity,
      targetSystem,
      pathsFound: paths.length,
      paths: paths.slice(0, 10) // Limit results
    };
  }

  /**
   * Get unified insights across all systems
   */
  getUnifiedInsights() {
    if (!this.#initialized) {
      this.initializeHyperGraph();
      this.createCrossDomainEdges();
    }

    const networkInsights = this.#hgnn.getNetworkInsights();
    
    const systemSummaries = {};
    for (const [name, system] of Object.entries(this.#systems)) {
      if (typeof system.getSummary === 'function') {
        systemSummaries[name] = system.getSummary();
      }
    }

    return {
      hyperGraph: networkInsights,
      systems: systemSummaries,
      totalSystems: Object.keys(this.#systems).length,
      initialized: this.#initialized
    };
  }

  /**
   * Export the complete state
   */
  export() {
    return {
      hyperGraph: this.#hgnn.exportGraph(),
      computationalGraph: this.#computeGraph.exportGraph(),
      systems: Object.keys(this.#systems),
      initialized: this.#initialized
    };
  }
}
