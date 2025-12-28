# Neural Network Integration for Workerd Supply Chain

## Overview

This extension integrates PyTorch-inspired neural network tensor embeddings with the workerd generalized supply chain system to enable **real-time ERP+SCM flow dynamics analysis** across an entire network of entities.

## Features

### 🧠 Tensor Embeddings
- **Actor Embeddings**: Multi-dimensional vector representations of suppliers, producers, distributors, wholesalers, retailers, and marketplaces
- **Relationship Embeddings**: Learned representations of supply chain connections
- **Type Embeddings**: Base embeddings for entity types and relationship types
- **Similarity Search**: Find similar actors based on embedding cosine similarity

### 🔮 Neural Network Flow Dynamics
- **Flow Prediction**: Predict flow characteristics between any two actors
- **Network Analysis**: Analyze entire supply chain network health and dynamics
- **Bottleneck Detection**: Automatically identify potential bottlenecks
- **Future State Prediction**: Forecast network state days/weeks ahead

### 📊 ERP+SCM Integration
- **Real-time Monitoring**: Track flow health, throughput, reliability, latency
- **Actor-level Metrics**: Inbound/outbound flows, capacity utilization
- **Network-wide Metrics**: Aggregate statistics across entire supply chain
- **Recommendations**: AI-generated actionable insights

### 🎯 Key Metrics Analyzed
- Flow Strength (0-1)
- Throughput Capacity
- Reliability Score (0-1)
- Latency (days)
- Cost Efficiency (0-1)
- Bottleneck Risk (0-1)
- Demand Match (0-1)
- Flexibility Score (0-1)
- Overall Health (0-1)

## Architecture

### Modules

1. **tensor-embeddings.js** (Internal)
   - `TensorEmbedding` class: Core embedding operations
   - `EntityEmbedder` class: Generate embeddings for actors and relationships
   - Similarity and distance calculations

2. **flow-dynamics.js** (Internal)
   - `FlowDynamicsNetwork` class: Neural network for flow prediction
   - `FlowMonitor` class: Real-time monitoring and anomaly detection
   - Multi-layer feedforward network architecture

3. **nn-supply-chain-impl.js** (Internal)
   - `NeuralSupplyChain` class: Main integration logic
   - Combines embeddings with supply chain data
   - Provides high-level analysis APIs

4. **nn-supply-chain.js** (Public)
   - Public API exported to user code
   - Re-exports from internal implementation

5. **nn-supply-chain-binding.js** (Internal)
   - Binding module for capability-based initialization
   - Creates configured instance from environment data

## API Endpoints

### Summary & Health
- `GET /api` - API documentation
- `GET /api/summary` - Network summary statistics
- `GET /api/network/health` - Real-time health metrics

### Actor Operations
- `GET /api/actors?type={type}&name={name}` - Query actors
- `GET /api/actor/{id}` - Get actor details
- `GET /api/embedding/{actorId}` - Get actor embedding
- `GET /api/similar/{actorId}?topK=5` - Find similar actors
- `GET /api/similarity?actor1={id1}&actor2={id2}` - Compute similarity

### Flow Analysis
- `GET /api/flow/predict?from={id}&to={id}` - Predict flow between actors
- `GET /api/flow/analyze` - Analyze entire network
- `GET /api/flow/statistics` - Flow statistics from history
- `GET /api/path/optimal?from={id}&to={id}` - Find optimal paths

### ERP+SCM Integration
- `GET /api/erp-scm/analysis` - Integrated ERP+SCM analysis
- `GET /api/predict/future?days=30` - Predict future state
- `GET /api/anomalies?threshold=0.3` - Detect anomalies

### Data Export
- `GET /api/embeddings/export` - Export all embeddings

## Usage

### With Binding (Recommended)

```javascript
// worker.js
export default {
  async fetch(req, env) {
    // Access configured instance through binding
    const health = env.neuralSupplyChain.getNetworkHealth();
    
    return new Response(JSON.stringify(health));
  }
};
```

### Direct API

```javascript
import { NeuralSupplyChain } from "nn-integration:nn-supply-chain";

const nnsc = new NeuralSupplyChain({
  actors: [...],
  relationships: [...],
  embeddingDimension: 128
});

const analysis = nnsc.analyzeNetworkFlow();
```

## Configuration

### Cap'n Proto Config

```capnp
const worker :Workerd.Worker = (
  bindings = [
    ( name = "neuralSupplyChain",
      wrapped = (
        moduleName = "nn-integration:binding",
        innerBindings = [
          ( name = "actors", json = embed "actors.json" ),
          ( name = "relationships", json = embed "relationships.json" ),
          ( name = "embeddingDimension", json = "128" )
        ],
      ))
  ],
);
```

## Example Workflows

### 1. Network Health Check

```bash
curl http://localhost:8080/api/network/health
```

Response:
```json
{
  "timestamp": 1703808000000,
  "overallHealth": 0.73,
  "metrics": {
    "averageFlowStrength": 0.65,
    "averageThroughput": 687.3,
    "averageReliability": 0.78,
    "networkHealth": 0.73
  },
  "bottleneckCount": 2,
  "criticalIssues": 0,
  "status": "good"
}
```

### 2. Find Similar Suppliers

```bash
curl http://localhost:8080/api/similar/s1?topK=3
```

Response:
```json
[
  {
    "actorId": "s3",
    "similarity": 0.82,
    "actor": {
      "id": "s3",
      "name": "Advanced Materials Inc",
      "type": "supplier"
    }
  },
  {
    "actorId": "s2",
    "similarity": 0.67,
    "actor": {
      "id": "s2",
      "name": "Organic Suppliers Ltd",
      "type": "supplier"
    }
  }
]
```

### 3. Predict Flow Dynamics

```bash
curl http://localhost:8080/api/flow/predict?from=s1&to=p1
```

Response:
```json
{
  "from": "s1",
  "to": "p1",
  "flowStrength": 0.72,
  "throughput": 823.4,
  "reliability": 0.85,
  "latency": 3.2,
  "costEfficiency": 0.68,
  "bottleneckRisk": 0.23,
  "overallHealth": 0.76
}
```

### 4. ERP+SCM Integrated Analysis

```bash
curl http://localhost:8080/api/erp-scm/analysis
```

Response includes:
- Network-wide health and status
- Actor-level metrics (inbound/outbound flows, throughput)
- All flow predictions
- Bottleneck identification
- AI-generated recommendations
- Embedding statistics

### 5. Future State Prediction

```bash
curl http://localhost:8080/api/predict/future?days=30
```

Response:
```json
{
  "currentState": {
    "networkHealth": 0.73,
    "averageThroughput": 687.3
  },
  "predictedState": {
    "averageFlowStrength": 0.68,
    "averageThroughput": 694.1,
    "averageReliability": 0.76
  },
  "horizon": 30,
  "confidence": 0.73
}
```

## Technical Details

### Embedding Architecture

- **Dimension**: 128 (configurable)
- **Initialization**: Xavier initialization for stability
- **Type Embeddings**: Pre-initialized for 6 actor types and 4 relationship types
- **Composition**: Type embedding + capacity features + pricing features + cooperative features
- **Normalization**: L2 normalization for consistent similarity metrics

### Neural Network Architecture

```
Input (256D) → Hidden1 (256D, ReLU) → Hidden2 (128D, ReLU) → Output (64D, Sigmoid)
```

- **Input**: Concatenated embeddings of two actors (128 + 128)
- **Hidden Layers**: Two layers with ReLU activation
- **Output**: 64-dimensional flow characteristic vector
- **Interpretation**: Maps output dimensions to business metrics

### Flow Metrics Computation

- **Flow Strength**: Direct from output[0]
- **Throughput**: output[1] * 1000 (scaled)
- **Reliability**: output[2]
- **Latency**: output[3] * 10 (days)
- **Overall Health**: Weighted combination with normalization

## Testing

Run the worker:

```bash
workerd serve nn-config.capnp
```

Test endpoints:

```bash
# Health check
curl http://localhost:8080/api/network/health

# Full analysis
curl http://localhost:8080/api/erp-scm/analysis

# Similar actors
curl http://localhost:8080/api/similar/p1

# Flow prediction
curl http://localhost:8080/api/flow/predict?from=s1&to=p1
```

## Data Format

### Actors (actors.json)

```json
{
  "id": "s1",
  "name": "Raw Materials Co",
  "type": "supplier",
  "capacities": [
    { "type": "storage", "value": 10000, "unit": "kg" }
  ],
  "pricingRules": [
    { "type": "fixed", "basePrice": 10 }
  ],
  "cooperativeMemberships": [],
  "location": "North America",
  "certifications": ["ISO9001"]
}
```

### Relationships (relationships.json)

```json
{
  "id": "rel1",
  "fromActorId": "s1",
  "toActorId": "p1",
  "type": "supplies",
  "status": "active",
  "contractTerms": {
    "startDate": "2023-01-01",
    "paymentTerms": "Net 30"
  }
}
```

## Benefits

1. **Real-time Insights**: Instant analysis of entire supply chain network
2. **Predictive Capabilities**: Forecast bottlenecks before they occur
3. **Similarity Discovery**: Find alternative suppliers/partners automatically
4. **Data-Driven Decisions**: Quantitative metrics for optimization
5. **Scalable**: Handles large networks efficiently
6. **Secure**: Capability-based access through workerd bindings

## Future Enhancements

- [ ] Training capabilities for custom embeddings
- [ ] Graph neural network architectures
- [ ] Time-series LSTM for temporal predictions
- [ ] Reinforcement learning for optimization
- [ ] Multi-modal embeddings (text + numeric)
- [ ] Federated learning across supply chain partners

## License

Copyright (c) 2024 Cloudflare, Inc.
Licensed under the Apache 2.0 license
