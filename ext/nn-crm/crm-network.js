// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// CRM Neural Network - Customer behavior prediction and churn analysis

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
    // Xavier initialization
    const stddev = Math.sqrt(2.0 / (this.#inputSize + this.#outputSize));
    this.#weights = Array(this.#outputSize).fill(0).map(() =>
      Array(this.#inputSize).fill(0).map(() => (Math.random() - 0.5) * 2 * stddev)
    );
    this.#bias = Array(this.#outputSize).fill(0);
  }

  forward(input) {
    const output = Array(this.#outputSize).fill(0);
    
    // Matrix multiplication + bias
    for (let i = 0; i < this.#outputSize; i++) {
      let sum = this.#bias[i];
      for (let j = 0; j < this.#inputSize; j++) {
        sum += this.#weights[i][j] * input[j];
      }
      output[i] = sum;
    }

    // Apply activation
    return this.#applyActivation(output);
  }

  #applyActivation(values) {
    switch (this.#activation) {
      case 'relu':
        return values.map(v => Math.max(0, v));
      case 'sigmoid':
        return values.map(v => 1 / (1 + Math.exp(-v)));
      case 'tanh':
        return values.map(v => Math.tanh(v));
      case 'linear':
        return values;
      default:
        return values;
    }
  }
}

export class CustomerBehaviorNetwork {
  #hiddenLayer1;
  #hiddenLayer2;
  #outputLayer;
  #embeddingDim;

  constructor(embeddingDim = 128) {
    this.#embeddingDim = embeddingDim;
    const inputDim = embeddingDim * 2; // customer + interaction embeddings

    this.#hiddenLayer1 = new DenseLayer(inputDim, 256, 'relu');
    this.#hiddenLayer2 = new DenseLayer(256, 128, 'relu');
    this.#outputLayer = new DenseLayer(128, 8, 'sigmoid'); // 8 prediction metrics
  }

  predictCustomerBehavior(customerEmbedding, interactionEmbedding) {
    // Concatenate embeddings
    const input = [...customerEmbedding.toArray(), ...interactionEmbedding.toArray()];

    // Forward pass
    const hidden1 = this.#hiddenLayer1.forward(input);
    const hidden2 = this.#hiddenLayer2.forward(hidden1);
    const output = this.#outputLayer.forward(hidden2);

    // Interpret output
    return {
      churnProbability: output[0],
      upsellPotential: output[1],
      satisfactionScore: output[2],
      engagementLevel: output[3],
      renewalLikelihood: output[4],
      responseRate: output[5],
      lifetimeValueScore: output[6],
      advocacyPotential: output[7]
    };
  }
}

export class ChurnPredictor {
  #behaviorNetwork;
  #churnHistory;

  constructor() {
    this.#behaviorNetwork = new CustomerBehaviorNetwork();
    this.#churnHistory = [];
  }

  predictChurn(customerEmbedding, recentInteractions) {
    const predictions = [];

    for (const interaction of recentInteractions) {
      const behavior = this.#behaviorNetwork.predictCustomerBehavior(
        customerEmbedding,
        interaction.embedding
      );
      predictions.push(behavior);
    }

    // Aggregate predictions
    const avgChurnProb = predictions.reduce((sum, p) => sum + p.churnProbability, 0) / predictions.length;
    const avgSatisfaction = predictions.reduce((sum, p) => sum + p.satisfactionScore, 0) / predictions.length;
    const avgEngagement = predictions.reduce((sum, p) => sum + p.engagementLevel, 0) / predictions.length;

    // Calculate risk factors
    const riskFactors = [];
    if (avgChurnProb > 0.6) riskFactors.push('high_churn_probability');
    if (avgSatisfaction < 0.5) riskFactors.push('low_satisfaction');
    if (avgEngagement < 0.4) riskFactors.push('low_engagement');

    return {
      churnRisk: avgChurnProb,
      satisfaction: avgSatisfaction,
      engagement: avgEngagement,
      riskLevel: avgChurnProb > 0.6 ? 'high' : avgChurnProb > 0.4 ? 'medium' : 'low',
      riskFactors,
      recommendations: this.#generateRecommendations(avgChurnProb, avgSatisfaction, avgEngagement)
    };
  }

  #generateRecommendations(churnProb, satisfaction, engagement) {
    const recommendations = [];

    if (churnProb > 0.5) {
      recommendations.push('Immediate outreach required - high churn risk');
      recommendations.push('Schedule executive review meeting');
    }

    if (satisfaction < 0.6) {
      recommendations.push('Conduct satisfaction survey');
      recommendations.push('Review recent support tickets');
    }

    if (engagement < 0.5) {
      recommendations.push('Increase engagement through personalized content');
      recommendations.push('Offer product training or webinars');
    }

    if (churnProb > 0.4 && satisfaction > 0.7) {
      recommendations.push('Customer may be satisfied but not seeing value - consider upsell');
    }

    return recommendations;
  }

  analyzeCustomerLifecycle(customer, interactions) {
    const stages = {
      acquisition: { start: null, duration: 0, interactions: 0 },
      onboarding: { start: null, duration: 0, interactions: 0 },
      growth: { start: null, duration: 0, interactions: 0 },
      retention: { start: null, duration: 0, interactions: 0 },
      atRisk: { start: null, duration: 0, interactions: 0 }
    };

    // Simplified lifecycle analysis
    const acquisitionDate = new Date(customer.acquisitionDate);
    const now = new Date();
    const daysSinceAcquisition = (now - acquisitionDate) / (1000 * 60 * 60 * 24);

    if (daysSinceAcquisition < 30) {
      return { currentStage: 'onboarding', stages };
    } else if (customer.churnRisk > 0.5) {
      return { currentStage: 'atRisk', stages };
    } else if (customer.engagementLevel === 'very_high' || customer.engagementLevel === 'high') {
      return { currentStage: 'growth', stages };
    } else {
      return { currentStage: 'retention', stages };
    }
  }
}

export class SalesPipelineNetwork {
  #hiddenLayer1;
  #hiddenLayer2;
  #outputLayer;

  constructor(embeddingDim = 128) {
    const inputDim = embeddingDim;
    this.#hiddenLayer1 = new DenseLayer(inputDim, 128, 'relu');
    this.#hiddenLayer2 = new DenseLayer(128, 64, 'relu');
    this.#outputLayer = new DenseLayer(64, 6, 'sigmoid'); // 6 pipeline metrics
  }

  predictPipelineMetrics(customerEmbedding) {
    const input = customerEmbedding.toArray();
    
    const hidden1 = this.#hiddenLayer1.forward(input);
    const hidden2 = this.#hiddenLayer2.forward(hidden1);
    const output = this.#outputLayer.forward(hidden2);

    return {
      winProbability: output[0],
      dealSize: output[1] * 100000, // Scale to realistic deal size
      closingSpeed: output[2] * 90, // Days to close
      competitiveThreat: output[3],
      stakeholderAlignment: output[4],
      budgetFit: output[5]
    };
  }
}
