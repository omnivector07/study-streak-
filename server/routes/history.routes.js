const { getHistory } = require('../controllers/history.controller');

async function historyRoutes(fastify) {
  fastify.get('/history', getHistory);
}

module.exports = historyRoutes;
