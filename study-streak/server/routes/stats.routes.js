const { getStats } = require('../controllers/stats.controller');

async function statsRoutes(fastify) {
  fastify.get('/stats', getStats);
}

module.exports = statsRoutes;
