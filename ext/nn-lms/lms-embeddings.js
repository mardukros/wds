// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// LMS Tensor Embeddings for learners and courses

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

export class LearningEmbedder {
  #dimension;
  #learnerEmbeddings;
  #courseEmbeddings;
  #typeEmbeddings;

  constructor(dimension = 128) {
    this.#dimension = dimension;
    this.#learnerEmbeddings = new Map();
    this.#courseEmbeddings = new Map();
    this.#typeEmbeddings = new Map();
    this.#initializeTypeEmbeddings();
  }

  #initializeTypeEmbeddings() {
    const learnerLevels = ['beginner', 'intermediate', 'advanced'];
    for (const level of learnerLevels) {
      this.#typeEmbeddings.set(`learner_${level}`, TensorEmbedding.random(this.#dimension));
    }

    const courseCategories = ['technology', 'business', 'design', 'soft_skills'];
    for (const category of courseCategories) {
      this.#typeEmbeddings.set(`course_${category}`, TensorEmbedding.random(this.#dimension));
    }

    const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Design'];
    for (const dept of departments) {
      this.#typeEmbeddings.set(`dept_${dept}`, TensorEmbedding.random(this.#dimension));
    }
  }

  embedLearner(learner) {
    if (this.#learnerEmbeddings.has(learner.id)) {
      return this.#learnerEmbeddings.get(learner.id);
    }

    const levelKey = `learner_${learner.level}`;
    let embedding = new TensorEmbedding(this.#dimension);
    const levelEmb = this.#typeEmbeddings.get(levelKey);
    if (levelEmb) {
      for (let i = 0; i < this.#dimension; i++) {
        embedding.vector[i] = levelEmb.vector[i];
      }
    }

    const deptKey = `dept_${learner.department}`;
    const deptEmb = this.#typeEmbeddings.get(deptKey);
    if (deptEmb) {
      embedding = embedding.add(deptEmb.scale(0.25));
    }

    const completionEmb = TensorEmbedding.random(this.#dimension).scale(learner.avgCompletionRate * 0.2);
    embedding = embedding.add(completionEmb);

    const scoreEmb = TensorEmbedding.random(this.#dimension).scale(learner.avgScore * 0.2);
    embedding = embedding.add(scoreEmb);

    const skillGapEmb = TensorEmbedding.random(this.#dimension).scale(learner.skillGaps.length / 10 * 0.15);
    embedding = embedding.add(skillGapEmb);

    embedding.normalize();
    this.#learnerEmbeddings.set(learner.id, embedding);
    return embedding;
  }

  embedCourse(course) {
    if (this.#courseEmbeddings.has(course.id)) {
      return this.#courseEmbeddings.get(course.id);
    }

    const categoryKey = `course_${course.category}`;
    let embedding = new TensorEmbedding(this.#dimension);
    const categoryEmb = this.#typeEmbeddings.get(categoryKey);
    if (categoryEmb) {
      for (let i = 0; i < this.#dimension; i++) {
        embedding.vector[i] = categoryEmb.vector[i];
      }
    }

    const durationScale = Math.log(course.duration + 1) / 5;
    const durationEmb = TensorEmbedding.random(this.#dimension).scale(durationScale * 0.2);
    embedding = embedding.add(durationEmb);

    const ratingEmb = TensorEmbedding.random(this.#dimension).scale(course.rating / 5 * 0.2);
    embedding = embedding.add(ratingEmb);

    const completionEmb = TensorEmbedding.random(this.#dimension).scale(course.completionRate * 0.15);
    embedding = embedding.add(completionEmb);

    embedding.normalize();
    this.#courseEmbeddings.set(course.id, embedding);
    return embedding;
  }

  findSimilarLearners(learnerId, topK = 5) {
    const targetLearner = this.#learnerEmbeddings.get(learnerId);
    if (!targetLearner) {
      throw new Error(`Learner embedding not found: ${learnerId}`);
    }

    const similarities = [];
    for (const [id, embedding] of this.#learnerEmbeddings.entries()) {
      if (id === learnerId) continue;
      const similarity = targetLearner.cosineSimilarity(embedding);
      similarities.push({ learnerId: id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  findSimilarCourses(courseId, topK = 5) {
    const targetCourse = this.#courseEmbeddings.get(courseId);
    if (!targetCourse) {
      throw new Error(`Course embedding not found: ${courseId}`);
    }

    const similarities = [];
    for (const [id, embedding] of this.#courseEmbeddings.entries()) {
      if (id === courseId) continue;
      const similarity = targetCourse.cosineSimilarity(embedding);
      similarities.push({ courseId: id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  exportEmbeddings() {
    return {
      learners: Object.fromEntries(
        Array.from(this.#learnerEmbeddings.entries()).map(([id, emb]) => [id, emb.toArray()])
      ),
      courses: Object.fromEntries(
        Array.from(this.#courseEmbeddings.entries()).map(([id, emb]) => [id, emb.toArray()])
      )
    };
  }
}
