const { getDashboard } = require('../controllers/dashboard.controller');

async function dashboardRoutes(fastify) {
  fastify.get('/dashboard', getDashboard);
}

module.exports = dashboardRoutes;
