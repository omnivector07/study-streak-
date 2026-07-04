const buildApp = require('./server/app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Boots the Fastify server.
 */
async function start() {
  const fastify = buildApp();

  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`\n🚀 Study Streak running at http://localhost:${PORT}\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
