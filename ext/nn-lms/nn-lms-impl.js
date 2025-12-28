// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Neural Network LMS Implementation

import { LearningEmbedder, TensorEmbedding } from "nn-lms-internal:lms-embeddings";
import { LearningPathNetwork, SkillGapAnalyzer, CompetencyPredictor } from "nn-lms-internal:lms-network";

export class NeuralLMS {
  #learners;
  #courses;
  #embedder;
  #pathNetwork;
  #skillAnalyzer;
  #competencyPredictor;
  #initialized;

  constructor(data) {
    this.#learners = new Map();
    this.#courses = new Map();
    this.#initialized = false;

    if (data.learners) {
      for (const learner of data.learners) {
        this.#learners.set(learner.id, learner);
      }
    }

    if (data.courses) {
      for (const course of data.courses) {
        this.#courses.set(course.id, course);
      }
    }

    const embeddingDim = data.embeddingDimension || 128;
    this.#embedder = new LearningEmbedder(embeddingDim);
    this.#pathNetwork = new LearningPathNetwork(embeddingDim);
    this.#skillAnalyzer = new SkillGapAnalyzer();
    this.#competencyPredictor = new CompetencyPredictor(embeddingDim);

    this.#initialize();
  }

  #initialize() {
    if (this.#initialized) return;

    for (const [id, learner] of this.#learners.entries()) {
      this.#embedder.embedLearner(learner);
    }

    for (const [id, course] of this.#courses.entries()) {
      this.#embedder.embedCourse(course);
    }

    this.#initialized = true;
  }

  getLearner(id) {
    const learner = this.#learners.get(id);
    if (!learner) throw new Error(`Learner not found: ${id}`);
    return learner;
  }

  getCourse(id) {
    const course = this.#courses.get(id);
    if (!course) throw new Error(`Course not found: ${id}`);
    return course;
  }

  getLearnerEmbedding(learnerId) {
    const learner = this.getLearner(learnerId);
    const embedding = this.#embedder.embedLearner(learner);
    return {
      learnerId,
      embedding: embedding.toArray(),
      dimension: embedding.dimension
    };
  }

  getCourseEmbedding(courseId) {
    const course = this.getCourse(courseId);
    const embedding = this.#embedder.embedCourse(course);
    return {
      courseId,
      embedding: embedding.toArray(),
      dimension: embedding.dimension
    };
  }

  findSimilarLearners(learnerId, topK = 5) {
    const similarities = this.#embedder.findSimilarLearners(learnerId, topK);
    return similarities.map(sim => ({
      learnerId: sim.learnerId,
      learner: this.#learners.get(sim.learnerId),
      similarity: sim.similarity
    }));
  }

  findSimilarCourses(courseId, topK = 5) {
    const similarities = this.#embedder.findSimilarCourses(courseId, topK);
    return similarities.map(sim => ({
      courseId: sim.courseId,
      course: this.#courses.get(sim.courseId),
      similarity: sim.similarity
    }));
  }

  recommendCourses(learnerId, topK = 5) {
    const learner = this.getLearner(learnerId);
    const learnerEmb = this.#embedder.embedLearner(learner);

    const recommendations = [];
    for (const [courseId, course] of this.#courses.entries()) {
      if (learner.enrolledCourses.includes(courseId) || learner.completedCourses.includes(courseId)) {
        continue;
      }

      const courseEmb = this.#embedder.embedCourse(course);
      const metrics = this.#pathNetwork.recommendCourse(learnerEmb, courseEmb);
      recommendations.push({ courseId, course, ...metrics });
    }

    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return recommendations.slice(0, topK);
  }

  analyzeSkillGaps(learnerId) {
    const learner = this.getLearner(learnerId);
    const learnerEmb = this.#embedder.embedLearner(learner);

    const allSkills = new Set();
    for (const course of this.#courses.values()) {
      course.skills.forEach(skill => allSkills.add(skill));
    }

    const currentSkills = new Set();
    for (const courseId of learner.completedCourses) {
      const course = this.#courses.get(courseId);
      if (course) {
        course.skills.forEach(skill => currentSkills.add(skill));
      }
    }

    return this.#skillAnalyzer.analyzeSkillGaps(
      learnerEmb,
      learner.skillGaps,
      Array.from(currentSkills)
    );
  }

  predictCompetency(learnerId) {
    const learner = this.getLearner(learnerId);
    const learnerEmb = this.#embedder.embedLearner(learner);
    return this.#competencyPredictor.predictCompetency(learnerEmb);
  }

  queryLearners(filters = {}) {
    let results = Array.from(this.#learners.values());

    if (filters.department) {
      results = results.filter(l => l.department === filters.department);
    }

    if (filters.level) {
      results = results.filter(l => l.level === filters.level);
    }

    if (filters.minCompletionRate) {
      results = results.filter(l => l.avgCompletionRate >= filters.minCompletionRate);
    }

    return results;
  }

  queryCourses(filters = {}) {
    let results = Array.from(this.#courses.values());

    if (filters.category) {
      results = results.filter(c => c.category === filters.category);
    }

    if (filters.level) {
      results = results.filter(c => c.level === filters.level);
    }

    if (filters.minRating) {
      results = results.filter(c => c.rating >= filters.minRating);
    }

    return results;
  }

  getLMSAnalytics() {
    const learners = Array.from(this.#learners.values());
    const courses = Array.from(this.#courses.values());

    const totalEnrollments = learners.reduce((sum, l) => sum + l.enrolledCourses.length, 0);
    const totalCompletions = learners.reduce((sum, l) => sum + l.completedCourses.length, 0);
    const avgCompletionRate = learners.reduce((sum, l) => sum + l.avgCompletionRate, 0) / learners.length;
    const avgScore = learners.reduce((sum, l) => sum + l.avgScore, 0) / learners.length;

    const atRisk = learners.filter(l => l.avgCompletionRate < 0.6);
    const highPerformers = learners.filter(l => l.avgScore > 0.85 && l.avgCompletionRate > 0.85);

    return {
      summary: {
        totalLearners: learners.length,
        totalCourses: courses.length,
        totalEnrollments,
        totalCompletions,
        avgCompletionRate,
        avgScore
      },
      learners: {
        atRiskCount: atRisk.length,
        highPerformerCount: highPerformers.length,
        atRisk: atRisk.map(l => ({ id: l.id, name: l.name, completionRate: l.avgCompletionRate })),
        highPerformers: highPerformers.map(l => ({ id: l.id, name: l.name, score: l.avgScore }))
      },
      courses: {
        topRated: courses.sort((a, b) => b.rating - a.rating).slice(0, 5).map(c => ({
          id: c.id,
          name: c.name,
          rating: c.rating
        })),
        mostPopular: courses.sort((a, b) => b.completionRate - a.completionRate).slice(0, 5).map(c => ({
          id: c.id,
          name: c.name,
          completionRate: c.completionRate
        }))
      }
    };
  }

  exportEmbeddings() {
    return this.#embedder.exportEmbeddings();
  }

  getSummary() {
    return {
      learners: this.#learners.size,
      courses: this.#courses.size,
      initialized: this.#initialized
    };
  }
}
