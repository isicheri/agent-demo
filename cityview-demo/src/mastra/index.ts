import { Mastra } from '@mastra/core/mastra';
import { registerApiRoute } from '@mastra/core/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cityviewAgent } from './agents/cityview-agent';

const chatHtmlPath = fileURLToPath(new URL('./public/index.html', import.meta.url));

// ---------------------------------------------------------------------------
// Mastra Instance
// ---------------------------------------------------------------------------
export const mastra = new Mastra({
  agents: {
    cityviewAgent
  },
  server: {
    apiRoutes: [
      registerApiRoute('/chat', {
        method: 'GET',
        handler: async c => {
          const html = readFileSync(chatHtmlPath, 'utf-8');
          return c.html(html);
        },
      }),
    ],
  },
});
