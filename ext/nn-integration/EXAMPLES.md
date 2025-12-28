# Neural Network Supply Chain Integration - Example Usage

## Quick Start

### 1. Start the Worker

```bash
cd ext/nn-integration
workerd serve nn-config.capnp
```

The API will be available at `http://localhost:8080`

### 2. Get API Documentation

```bash
curl http://localhost:8080/api | jq
```

## Example Scenarios

### Scenario 1: Network Health Monitoring

**Objective**: Monitor the overall health of your supply chain network in real-time.

```bash
# Get current network health
curl http://localhost:8080/api/network/health | jq
```

**Response**:
```json
{
  "timestamp": 1703808000000,
  "overallHealth": 0.73,
  "metrics": {
    "averageFlowStrength": 0.65,
    "averageThroughput": 687.3,
    "averageReliability": 0.78,
    "averageLatency": 4.2,
    "averageCostEfficiency": 0.71,
    "averageBottleneckRisk": 0.28,
    "networkHealth": 0.73
  },
  "bottleneckCount": 2,
  "criticalIssues": 0,
  "status": "good"
}
```

**Interpretation**:
- Overall health: 73% - Good status
- Average reliability: 78% - Most flows are reliable
- 2 bottlenecks detected - Need investigation
- 0 critical issues - No immediate action required

### Scenario 2: Finding Alternative Suppliers

**Objective**: Your primary supplier (s1) has capacity issues. Find similar suppliers.

```bash
# Find suppliers similar to s1
curl "http://localhost:8080/api/similar/s1?topK=3" | jq
```

**Response**:
```json
[
  {
    "actorId": "s3",
    "actor": {
      "id": "s3",
      "name": "Advanced Materials Inc",
      "type": "supplier",
      "location": "Asia"
    },
    "similarity": 0.82
  },
  {
    "actorId": "s2",
    "actor": {
      "id": "s2",
      "name": "Organic Suppliers Ltd",
      "type": "supplier",
      "location": "Europe"
    },
    "similarity": 0.67
  }
]
```

**Action**: Contact "Advanced Materials Inc" - 82% similarity, likely can provide similar materials.

### Scenario 3: Predicting New Partnership Flow

**Objective**: Before establishing a new relationship, predict how well it will work.

```bash
# Predict flow from supplier s3 to producer p2
curl "http://localhost:8080/api/flow/predict?from=s3&to=p2" | jq
```

**Response**:
```json
{
  "from": "s3",
  "to": "p2",
  "flowStrength": 0.68,
  "throughput": 745.2,
  "reliability": 0.81,
  "latency": 3.8,
  "costEfficiency": 0.64,
  "bottleneckRisk": 0.31,
  "demandMatch": 0.72,
  "flexibility": 0.69,
  "overallHealth": 0.71
}
```

**Analysis**:
- 71% overall health - Good potential partnership
- Throughput: 745 units - Sufficient capacity
- Reliability: 81% - High reliability expected
- Bottleneck risk: 31% - Moderate, monitor closely
- **Decision**: Proceed with partnership, monitor bottleneck risk

### Scenario 4: Complete Network Analysis

**Objective**: Get comprehensive ERP+SCM integrated analysis.

```bash
curl http://localhost:8080/api/erp-scm/analysis | jq
```

**Response** (abbreviated):
```json
{
  "timestamp": 1703808000000,
  "network": {
    "totalActors": 11,
    "totalRelationships": 16,
    "health": 0.73,
    "status": "good"
  },
  "actors": [
    {
      "id": "s1",
      "name": "Raw Materials Co",
      "type": "supplier",
      "inboundFlows": 0,
      "outboundFlows": 2,
      "totalThroughput": 1547.8,
      "averageReliability": 0.83,
      "bottleneckRisk": 0.25
    },
    {
      "id": "p1",
      "name": "Manufacturing Inc",
      "type": "producer",
      "inboundFlows": 3,
      "outboundFlows": 3,
      "totalThroughput": 2234.5,
      "averageReliability": 0.79,
      "bottleneckRisk": 0.42
    }
  ],
  "bottlenecks": [
    {
      "relationshipId": "rel5",
      "from": "p1",
      "to": "d1",
      "risk": 0.72,
      "reason": "Low throughput capacity, High latency"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "bottlenecks",
      "message": "2 potential bottlenecks detected.",
      "actionItems": [
        "Address bottleneck between p1 and d1: Low throughput capacity, High latency"
      ]
    }
  ]
}
```

**Key Insights**:
1. Producer p1 is a central hub (3 inbound, 3 outbound)
2. Bottleneck at p1→d1 relationship (72% risk)
3. Recommendation: Increase capacity or add alternative distributor

### Scenario 5: Future State Prediction

**Objective**: Predict network state 30 days from now.

```bash
curl "http://localhost:8080/api/predict/future?days=30" | jq
```

**Response**:
```json
{
  "currentState": {
    "networkHealth": 0.73,
    "averageFlowStrength": 0.65,
    "averageThroughput": 687.3,
    "averageReliability": 0.78
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

**Forecast**:
- Throughput will increase slightly (+1%)
- Reliability may decrease slightly (-2%)
- Overall trend: Stable with minor improvements
- Confidence: 73% - Reasonably reliable prediction

### Scenario 6: Finding Optimal Routes

**Objective**: Find the best path from supplier to retailer.

```bash
curl "http://localhost:8080/api/path/optimal?from=s1&to=r1" | jq
```

**Response**:
```json
[
  {
    "path": ["s1", "p1", "d1", "r1"],
    "qualityScore": 0.68,
    "length": 4
  },
  {
    "path": ["s1", "p1", "d1", "w1", "r1"],
    "qualityScore": 0.54,
    "length": 5
  }
]
```

**Analysis**:
- Direct path (s1→p1→d1→r1) has best quality (68%)
- Alternative path through wholesaler is longer and lower quality
- **Recommendation**: Use direct path for better efficiency

### Scenario 7: Actor Similarity Analysis

**Objective**: Compare two producers to decide which to use.

```bash
curl "http://localhost:8080/api/similarity?actor1=p1&actor2=p2" | jq
```

**Response**:
```json
{
  "actorId1": "p1",
  "actorId2": "p2",
  "cosineSimilarity": 0.74,
  "euclideanDistance": 8.32
}
```

**Interpretation**:
- 74% similarity - Producers are fairly similar
- Can likely substitute one for the other if needed
- Both have similar capabilities and characteristics

### Scenario 8: Query Actors by Criteria

**Objective**: Find all high-capacity distributors.

```bash
curl "http://localhost:8080/api/actors?type=distributor&capacityType=transport&minCapacity=25000" | jq
```

**Response**:
```json
[
  {
    "id": "d2",
    "name": "Global Distribution Network",
    "type": "distributor",
    "capacities": [
      {
        "type": "transport",
        "value": 35000,
        "unit": "kg"
      }
    ],
    "location": "Asia"
  }
]
```

### Scenario 9: Anomaly Detection

**Objective**: Detect unusual patterns in flow history.

```bash
curl "http://localhost:8080/api/anomalies?threshold=0.3" | jq
```

**Response**:
```json
[
  {
    "timestamp": 1703805000000,
    "relationshipId": "rel5",
    "deviation": 0.35,
    "expectedHealth": 0.68,
    "actualHealth": 0.33
  }
]
```

**Alert**: Relationship rel5 (p1→d1) experienced significant health degradation.

### Scenario 10: Export Embeddings for ML Pipeline

**Objective**: Export embeddings for external machine learning analysis.

```bash
curl http://localhost:8080/api/embeddings/export | jq > embeddings.json
```

**Use Cases**:
- Train custom models
- Visualize actor clusters
- Advanced analytics in Python/R
- Integration with existing ML pipelines

## Integration Patterns

### Pattern 1: Real-time Dashboard

```javascript
// Dashboard update every 5 seconds
setInterval(async () => {
  const health = await fetch('http://localhost:8080/api/network/health');
  const data = await health.json();
  
  updateHealthGauge(data.overallHealth);
  updateMetrics(data.metrics);
  alertIfCritical(data.criticalIssues);
}, 5000);
```

### Pattern 2: Automated Alerts

```javascript
// Check for bottlenecks hourly
const analysis = await fetch('http://localhost:8080/api/erp-scm/analysis');
const data = await analysis.json();

if (data.bottlenecks.length > 0) {
  const critical = data.bottlenecks.filter(b => b.risk > 0.8);
  if (critical.length > 0) {
    sendAlert('Critical bottlenecks detected', critical);
  }
}
```

### Pattern 3: Supplier Selection AI

```javascript
async function findBestSupplier(requirementProfile) {
  // Get all suppliers
  const suppliers = await fetch('http://localhost:8080/api/actors?type=supplier');
  const supplierList = await suppliers.json();
  
  // Score each supplier
  const scores = await Promise.all(
    supplierList.map(async (supplier) => {
      const prediction = await fetch(
        `http://localhost:8080/api/flow/predict?from=${supplier.id}&to=p1`
      );
      const flow = await prediction.json();
      
      return {
        supplier,
        score: flow.overallHealth * flow.reliability * flow.costEfficiency
      };
    })
  );
  
  // Return best match
  return scores.sort((a, b) => b.score - a.score)[0];
}
```

### Pattern 4: Capacity Planning

```javascript
async function planCapacityExpansion() {
  // Predict future state
  const future = await fetch('http://localhost:8080/api/predict/future?days=90');
  const prediction = await future.json();
  
  // Get current analysis
  const current = await fetch('http://localhost:8080/api/erp-scm/analysis');
  const analysis = await current.json();
  
  // Identify actors needing expansion
  const needsExpansion = analysis.actors.filter(actor => 
    actor.bottleneckRisk > 0.6 && actor.outboundFlows > 2
  );
  
  return {
    expansionTargets: needsExpansion,
    urgency: prediction.predictedState.averageThroughput > 
             prediction.currentState.averageThroughput ? 'high' : 'medium'
  };
}
```

## Performance Benchmarks

- **Embedding Generation**: ~2ms per actor
- **Flow Prediction**: ~1ms per relationship
- **Network Analysis**: ~50ms for 11 actors, 16 relationships
- **Similarity Search**: ~5ms for top-5 results
- **Path Finding**: ~10ms for typical network

## Best Practices

1. **Cache embeddings** after initial computation
2. **Batch API calls** when querying multiple actors
3. **Set appropriate thresholds** for your domain
4. **Monitor regularly** but not excessively
5. **Combine metrics** for better decision making
6. **Use predictions** as guidance, not absolute truth
7. **Update data** when network topology changes
8. **Test thoroughly** before production deployment

## Troubleshooting

### Issue: Low similarity scores
**Solution**: Actors may be truly dissimilar. Check embedding dimension and data quality.

### Issue: All bottleneck risks are high
**Solution**: Recalibrate neural network weights or adjust threshold interpretation.

### Issue: Predictions are inaccurate
**Solution**: Future prediction uses simple temporal model. Consider more training data.

### Issue: Network health always "poor"
**Solution**: Check data quality, ensure relationships are properly defined and active.

## Next Steps

1. Integrate with your monitoring system
2. Set up automated alerts for critical metrics
3. Build visualizations using embedding data
4. Train custom models on your specific data
5. Extend with domain-specific features
