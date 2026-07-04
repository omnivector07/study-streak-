const path = require('path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');

const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const studyRoutes = require('./routes/study.routes');
const historyRoutes = require('./routes/history.routes');
const statsRoutes = require('./routes/stats.routes');

/**
 * Builds and configures the Fastify instance.
 * Kept as a factory function so it can be reused in tests later
 * without needing to actually start listening on a port.
 */
function buildApp() {
  const fastify = Fastify({ logger: true });

  // Serve the vanilla HTML/CSS/JS frontend from /public
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/'
  });

  // REST API routes (see server/routes for endpoint definitions)
  fastify.register(userRoutes);
  fastify.register(dashboardRoutes);
  fastify.register(studyRoutes);
  fastify.register(historyRoutes);
  fastify.register(statsRoutes);

  // Centralized error handling so controllers can just throw/return errors
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.code(error.statusCode || 500).send({
      error: error.message || 'Internal Server Error'
    });
  });

  // Friendly 404 for unmatched API routes
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: `Route ${request.method} ${request.url} not found` });
  });

  return fastify;
}

module.exports = buildApp;
