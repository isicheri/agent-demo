import { Mastra } from '@mastra/core/mastra';
import { cityviewAgent } from './agents/cityview-agent';





// ---------------------------------------------------------------------------
// Mastra Instance
// ---------------------------------------------------------------------------
export const mastra = new Mastra({
  /**
   * agents: All agents registered here are:
   * 1. Available via mastra.getAgent('<key>') in your API routes.
   * 2. Listed in Mastra Studio's Agents panel for manual testing.
   * 3. Discoverable by the Mastra server's /api/agents endpoints.
   *
   * Key naming convention: camelCase, matching the exported variable name.
   */
  agents: {
    cityviewAgent
  },

});
