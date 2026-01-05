import 'dotenv/config';
import Fastify from 'fastify';
import plugin from '../server/plugin.js';

const fastify = Fastify({
  logger: true,
});

await fastify.register(plugin);

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

try {
  await fastify.listen({ port, host });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
