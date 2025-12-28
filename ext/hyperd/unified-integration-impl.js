// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Unified Neural Network Integration
// Orchestrates all nn-* systems through hyperd

import { Hyperd } from "hyperd-internal:hyperd";

export class UnifiedNeuralIntegration {
  #hyperd;
  #systems;

  constructor(systems) {
    this.#hyperd = new Hyperd();
    this.#systems = systems;

    // Register all systems with hyperd
    if (systems.scm) {
      this.#hyperd.registerSystem('scm', systems.scm);
    }
    if (systems.crm) {
      this.#hyperd.registerSystem('crm', systems.crm);
    }
    if (systems.mrp) {
      this.#hyperd.registerSystem('mrp', systems.mrp);
    }
    if (systems.lms) {
      this.#hyperd.registerSystem('lms', systems.lms);
    }

    // Initialize hyper-graph
    this.#hyperd.initializeHyperGraph();
    this.#hyperd.createCrossDomainEdges();
  }

  /**
   * Get system by name
   */
  getSystem(name) {
    return this.#systems[name];
  }

  /**
   * Execute a unified workflow across systems
   */
  async executeWorkflow(workflowName, params = {}) {
    return await this.#hyperd.executeWorkflow(workflowName, params);
  }

  /**
   * Query across domains using the hyper-graph
   */
  crossDomainQuery(sourceSystem, sourceEntity, targetSystem, maxHops = 3) {
    return this.#hyperd.crossDomainQuery(sourceSystem, sourceEntity, targetSystem, maxHops);
  }

  /**
   * Get unified insights across all systems
   */
  getUnifiedInsights() {
    return this.#hyperd.getUnifiedInsights();
  }

  /**
   * Get individual system analytics
   */
  getSystemAnalytics(systemName) {
    const system = this.#systems[systemName];
    if (!system) {
      throw new Error(`System not found: ${systemName}`);
    }

    const methodMap = {
      scm: 'getERPSCMAnalysis',
      crm: 'getCRMAnalytics',
      mrp: 'getMRPAnalytics',
      lms: 'getLMSAnalytics'
    };

    const method = methodMap[systemName];
    if (method && typeof system[method] === 'function') {
      return system[method]();
    }

    throw new Error(`Analytics method not found for system: ${systemName}`);
  }

  /**
   * Get comprehensive enterprise dashboard
   */
  getEnterpriseDashboard() {
    const dashboard = {
      timestamp: new Date().toISOString(),
      systems: {},
      hyperGraph: null,
      crossDomainInsights: {}
    };

    // Collect analytics from each system
    for (const [name, system] of Object.entries(this.#systems)) {
      try {
        dashboard.systems[name] = this.getSystemAnalytics(name);
      } catch (error) {
        dashboard.systems[name] = { error: error.message };
      }
    }

    // Get hyper-graph insights
    dashboard.hyperGraph = this.#hyperd.getUnifiedInsights();

    // Add cross-domain insights
    if (this.#systems.scm && this.#systems.crm) {
      dashboard.crossDomainInsights.scmToCrm = 'Supply chain actors mapped to customers';
    }
    if (this.#systems.mrp && this.#systems.lms) {
      dashboard.crossDomainInsights.mrpToLms = 'Materials linked to learner skills';
    }

    return dashboard;
  }

  /**
   * Export complete state
   */
  export() {
    return {
      hyperd: this.#hyperd.export(),
      systems: Object.keys(this.#systems)
    };
  }
}
