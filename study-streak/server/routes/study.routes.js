const { startSession, finishSession } = require('../controllers/study.controller');

async function studyRoutes(fastify) {
  fastify.post('/study/start', startSession);
  fastify.post('/study/finish', finishSession);
}

module.exports = studyRoutes;
