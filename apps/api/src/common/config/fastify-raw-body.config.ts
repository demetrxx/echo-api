import { FastifyInstance } from 'fastify';

/**
 * Extend FastifyRequest to include rawBody property
 */
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

/**
 * Routes that require raw body access for webhook signature verification.
 *
 * These routes need the raw request body buffer before JSON parsing
 * to verify signatures from external services (e.g., Stripe, Shopify).
 *
 * Supports both exact string matches and regex patterns.
 */
const RAW_BODY_ROUTES: (string | RegExp)[] = [
  '/internal/stripe-webhook',
  // Add more webhook routes here as needed:
  // '/internal/shopify-webhook',
  // /^\/internal\/.*-webhook$/, // Pattern: any route ending with -webhook
];

/**
 * Configure Fastify to capture raw body for specific routes.
 *
 * Uses Fastify's preParsing hook to intercept the request stream
 * BEFORE the JSON body parser consumes it. This is essential for
 * webhook signature verification which requires the exact raw bytes.
 *
 * @param fastifyInstance - The Fastify instance from NestJS adapter
 *
 * @example
 * ```typescript
 * const fastifyInstance = app.getHttpAdapter().getInstance();
 * configureRawBody(fastifyInstance);
 * ```
 */

export function configureRawBody(fastifyInstance: any): void {
  (fastifyInstance as FastifyInstance).addHook(
    'preParsing',
    async (request, reply, payload) => {
      // Check if this route needs raw body capture
      const needsRawBody =
        request.method === 'POST' &&
        RAW_BODY_ROUTES.some((pattern) => {
          if (typeof pattern === 'string') {
            return request.url === pattern;
          }
          return pattern.test(request.url);
        });

      if (needsRawBody) {
        // Capture raw body chunks
        const chunks: Buffer[] = [];
        for await (const chunk of payload) {
          chunks.push(chunk as Buffer);
        }

        const rawBody = Buffer.concat(chunks);

        // Attach raw body to request for signature verification
        request.rawBody = rawBody;

        // Return new stream for Fastify's body parser
        const { Readable } = await import('stream');
        return Readable.from(rawBody);
      }

      // Pass through unchanged for other routes
      return payload;
    },
  );
}
