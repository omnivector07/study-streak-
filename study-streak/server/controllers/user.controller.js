const userModel = require('../models/user.model');

/**
 * GET /user
 * Returns the current user, or 404 if onboarding hasn't happened yet.
 * The frontend uses the 404 to decide whether to show the "enter your name" screen.
 */
async function getCurrentUser(request, reply) {
  const user = await userModel.getUser();
  if (!user) {
    return reply.code(404).send({ error: 'No user found yet. Create one first.' });
  }
  return reply.send(user);
}

/**
 * POST /user
 * Creates the user on first use. Idempotent: if a user already exists,
 * it is simply returned rather than throwing an error.
 */
async function createUser(request, reply) {
  const { name } = request.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return reply.code(400).send({ error: 'Name is required' });
  }

  const existing = await userModel.getUser();
  if (existing) {
    return reply.send(existing);
  }

  const user = await userModel.createUser(name.trim());
  return reply.code(201).send(user);
}

module.exports = { getCurrentUser, createUser };
