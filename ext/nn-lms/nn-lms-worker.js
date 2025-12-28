// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const path = url.pathname;

      if (path === '/api' || path === '/api/') {
        return jsonResponse({
          service: 'Neural Network LMS',
          version: '1.0.0',
          endpoints: {
            'GET /api': 'API documentation',
            'GET /api/summary': 'LMS summary statistics',
            'GET /api/analytics': 'Complete LMS analytics',
            'GET /api/learners': 'Query learners (filters: department, level, minCompletionRate)',
            'GET /api/learner/:id': 'Get learner details',
            'GET /api/learner/:id/embedding': 'Get learner embedding',
            'GET /api/learner/:id/similar': 'Find similar learners',
            'GET /api/learner/:id/recommend': 'Recommend courses',
            'GET /api/learner/:id/skills': 'Analyze skill gaps',
            'GET /api/learner/:id/competency': 'Predict competency',
            'GET /api/courses': 'Query courses (filters: category, level, minRating)',
            'GET /api/course/:id': 'Get course details',
            'GET /api/course/:id/embedding': 'Get course embedding',
            'GET /api/course/:id/similar': 'Find similar courses',
            'GET /api/embeddings/export': 'Export all embeddings'
          }
        }, corsHeaders);
      }

      if (path === '/api/summary') {
        return jsonResponse(env.neuralLMS.getSummary(), corsHeaders);
      }

      if (path === '/api/analytics') {
        return jsonResponse(env.neuralLMS.getLMSAnalytics(), corsHeaders);
      }

      if (path === '/api/learners') {
        const filters = {
          department: url.searchParams.get('department'),
          level: url.searchParams.get('level'),
          minCompletionRate: url.searchParams.get('minCompletionRate') ? parseFloat(url.searchParams.get('minCompletionRate')) : undefined
        };
        const learners = env.neuralLMS.queryLearners(filters);
        return jsonResponse({ learners, count: learners.length }, corsHeaders);
      }

      if (path === '/api/courses') {
        const filters = {
          category: url.searchParams.get('category'),
          level: url.searchParams.get('level'),
          minRating: url.searchParams.get('minRating') ? parseFloat(url.searchParams.get('minRating')) : undefined
        };
        const courses = env.neuralLMS.queryCourses(filters);
        return jsonResponse({ courses, count: courses.length }, corsHeaders);
      }

      const learnerMatch = path.match(/^\/api\/learner\/([^/]+)$/);
      if (learnerMatch) {
        return jsonResponse(env.neuralLMS.getLearner(learnerMatch[1]), corsHeaders);
      }

      const learnerEmbMatch = path.match(/^\/api\/learner\/([^/]+)\/embedding$/);
      if (learnerEmbMatch) {
        return jsonResponse(env.neuralLMS.getLearnerEmbedding(learnerEmbMatch[1]), corsHeaders);
      }

      const learnerSimilarMatch = path.match(/^\/api\/learner\/([^/]+)\/similar$/);
      if (learnerSimilarMatch) {
        const topK = parseInt(url.searchParams.get('topK') || '5');
        const similar = env.neuralLMS.findSimilarLearners(learnerSimilarMatch[1], topK);
        return jsonResponse({ learnerId: learnerSimilarMatch[1], similar }, corsHeaders);
      }

      const recommendMatch = path.match(/^\/api\/learner\/([^/]+)\/recommend$/);
      if (recommendMatch) {
        const topK = parseInt(url.searchParams.get('topK') || '5');
        const recommendations = env.neuralLMS.recommendCourses(recommendMatch[1], topK);
        return jsonResponse({ learnerId: recommendMatch[1], recommendations }, corsHeaders);
      }

      const skillsMatch = path.match(/^\/api\/learner\/([^/]+)\/skills$/);
      if (skillsMatch) {
        const analysis = env.neuralLMS.analyzeSkillGaps(skillsMatch[1]);
        return jsonResponse({ learnerId: skillsMatch[1], analysis }, corsHeaders);
      }

      const competencyMatch = path.match(/^\/api\/learner\/([^/]+)\/competency$/);
      if (competencyMatch) {
        const prediction = env.neuralLMS.predictCompetency(competencyMatch[1]);
        return jsonResponse({ learnerId: competencyMatch[1], prediction }, corsHeaders);
      }

      const courseMatch = path.match(/^\/api\/course\/([^/]+)$/);
      if (courseMatch) {
        return jsonResponse(env.neuralLMS.getCourse(courseMatch[1]), corsHeaders);
      }

      const courseEmbMatch = path.match(/^\/api\/course\/([^/]+)\/embedding$/);
      if (courseEmbMatch) {
        return jsonResponse(env.neuralLMS.getCourseEmbedding(courseEmbMatch[1]), corsHeaders);
      }

      const courseSimilarMatch = path.match(/^\/api\/course\/([^/]+)\/similar$/);
      if (courseSimilarMatch) {
        const topK = parseInt(url.searchParams.get('topK') || '5');
        const similar = env.neuralLMS.findSimilarCourses(courseSimilarMatch[1], topK);
        return jsonResponse({ courseId: courseSimilarMatch[1], similar }, corsHeaders);
      }

      if (path === '/api/embeddings/export') {
        return jsonResponse(env.neuralLMS.exportEmbeddings(), corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, corsHeaders, 404);

    } catch (error) {
      return jsonResponse({ error: error.message, stack: error.stack }, corsHeaders, 500);
    }
  }
};

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
