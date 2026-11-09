import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { healthRouter } from './routes/health';
import { tokensRouter } from './routes/tokens';
import { analyticsRouter } from './routes/analytics';
import { reservesRouter } from './routes/reserves';

const app = new Hono();

// Global middleware
app.use('*', cors());

// Mount API routes
app.route('/api/v1/health', healthRouter);
app.route('/api/v1/tokens', tokensRouter);
app.route('/api/v1/analytics', analyticsRouter);
app.route('/api/v1/reserves', reservesRouter);

// Root summary endpoint
app.get('/', (c) => {
  return c.json({
    service: 'PISO Stablecoin Hub API',
    organization: '314-hash',
    network: 'PISO Chain (Chain ID: 2026001)',
    version: '1.0.0',
    documentation: 'https://github.com/314-hash/piso-stablecoin-hub/blob/main/docs/API.md',
    endpoints: [
      '/api/v1/health',
      '/api/v1/tokens',
      '/api/v1/tokens/:address',
      '/api/v1/analytics/overview',
      '/api/v1/analytics/timeseries',
      '/api/v1/reserves',
    ],
  });
});

const port = Number(process.env.PORT || 3001);
console.log(`[PISO Stablecoin Hub API] Running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
