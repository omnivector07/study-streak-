const { getCurrentUser, createUser } = require('../controllers/user.controller');

async function userRoutes(fastify) {
  fastify.get('/user', getCurrentUser);
  fastify.post('/user', createUser);
}

module.exports = userRoutes;
