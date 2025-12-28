// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// LMS Neural Network - Learning path recommendation and skill prediction

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
      case 'relu': return values.map(v => Math.max(0, v));
      case 'sigmoid': return values.map(v => 1 / (1 + Math.exp(-v)));
      case 'linear': return values;
      default: return values;
    }
  }
}

export class LearningPathNetwork {
  #hiddenLayer1;
  #hiddenLayer2;
  #outputLayer;

  constructor(embeddingDim = 128) {
    const inputDim = embeddingDim * 2; // learner + course embeddings
    this.#hiddenLayer1 = new DenseLayer(inputDim, 256, 'relu');
    this.#hiddenLayer2 = new DenseLayer(256, 128, 'relu');
    this.#outputLayer = new DenseLayer(128, 6, 'sigmoid'); // 6 recommendation metrics
  }

  recommendCourse(learnerEmbedding, courseEmbedding) {
    const input = [...learnerEmbedding.toArray(), ...courseEmbedding.toArray()];
    const hidden1 = this.#hiddenLayer1.forward(input);
    const hidden2 = this.#hiddenLayer2.forward(hidden1);
    const output = this.#outputLayer.forward(hidden2);

    return {
      relevanceScore: output[0],
      completionProbability: output[1],
      expectedPerformance: output[2],
      skillAlignment: output[3],
      difficultyMatch: output[4],
      engagementPotential: output[5]
    };
  }
}

export class SkillGapAnalyzer {
  #skillNetwork;

  constructor() {
    this.#skillNetwork = new DenseLayer(128, 64, 'sigmoid');
  }

  analyzeSkillGaps(learnerEmbedding, requiredSkills, currentSkills) {
    const input = learnerEmbedding.toArray();
    const predictions = this.#skillNetwork.forward(input);

    const gaps = requiredSkills.filter(skill => !currentSkills.includes(skill));
    
    return {
      identifiedGaps: gaps,
      gapCount: gaps.length,
      proficiencyScore: predictions[0],
      learningCapacity: predictions[1],
      timeToCompetency: Math.round(gaps.length * 30 * (1 - predictions[0])), // days
      recommendedPath: this.#generateLearningPath(gaps)
    };
  }

  #generateLearningPath(gaps) {
    return gaps.map((skill, index) => ({
      step: index + 1,
      skill,
      priority: gaps.length - index,
      estimatedDuration: 30 // days per skill
    }));
  }
}

export class CompetencyPredictor {
  #hiddenLayer;
  #outputLayer;

  constructor(embeddingDim = 128) {
    this.#hiddenLayer = new DenseLayer(embeddingDim, 64, 'relu');
    this.#outputLayer = new DenseLayer(64, 5, 'sigmoid');
  }

  predictCompetency(learnerEmbedding) {
    const input = learnerEmbedding.toArray();
    const hidden = this.#hiddenLayer.forward(input);
    const output = this.#outputLayer.forward(hidden);

    return {
      technicalSkills: output[0],
      softSkills: output[1],
      leadershipPotential: output[2],
      adaptability: output[3],
      overallCompetency: (output[0] + output[1] + output[2] + output[3]) / 4
    };
  }
}
