import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { sendLeadEmail } from '../lib/send-lead-email'

// DEMO ONLY: logs the handoff to a local file. In a real setup, notify the
// agent instantly (WhatsApp, email, CRM) and route the live chat to them.
export const handoffTool = createTool({
  id: 'handoff-to-agent',
  description:
    'Hand a SERIOUS buyer to a human agent. CRITICAL: Call this tool ONLY after the visitor has provided their actual name and phone/WhatsApp number and agreed to be contacted. Never call with "None" or placeholder values.',
  inputSchema: z.object({
    consent: z
      .boolean()
      .describe('true ONLY if the visitor explicitly agreed to share their contact details to be contacted by an agent'),
    name: z
      .string()
      .min(2, 'A real visitor name is required')
      .refine(val => !['none', 'n/a', 'unknown', 'null', ''].includes(val.toLowerCase().trim()), {
        message: 'Must be an actual name provided by the visitor, not "None"',
      })
      .describe('Visitor actual name provided in the conversation'),
    contact: z
      .string()
      .min(6, 'A valid phone or WhatsApp number is required')
      .refine(val => !['none', 'n/a', 'unknown', 'null', ''].includes(val.toLowerCase().trim()), {
        message: 'Must be an actual phone number or WhatsApp provided by the visitor, not "None"',
      })
      .describe('Phone or WhatsApp number provided by the visitor'),
    summary: z
      .string()
      .describe('Brief summary for the agent: needs, budget, timeline, payment plan, questions, next step'),
    urgency: z.enum(['high', 'medium']).describe('high = wants to inspect or buy within weeks/days'),
  }),
  outputSchema: z.object({ handedOff: z.boolean(), message: z.string() }),
  execute: async ({ consent, name, contact, summary, urgency }) => {
    if (!consent) {
      return { handedOff: false, message: 'No consent given. Ask the visitor first.' }
    }
    const result = await sendLeadEmail({ type: 'HANDOFF', urgency, name, contact, summary })
    if (!result.ok) {
      return {
        handedOff: false,
        message: 'The agent could not be notified automatically. Do NOT say the agent was notified. Ask the visitor to message the agent directly on WhatsApp.',
      }
    }
    return { handedOff: true, message: 'Agent emailed. Tell the visitor an agent will contact them shortly.' }
  },
})
