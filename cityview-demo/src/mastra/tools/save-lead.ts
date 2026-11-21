import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { sendLeadEmail } from '../lib/send-lead-email'

export const saveLeadTool = createTool({
  id: 'save-lead',
  description:
    'Save a visitor who is NOT ready to buy yet so the agent can follow up later. Call ONLY after the visitor has provided their real name and phone/WhatsApp and agreed to follow-up. Never call with "None" or placeholders.',
  inputSchema: z.object({
    consent: z
      .boolean()
      .describe('true ONLY if the visitor explicitly agreed to share their contact details for follow up'),
    name: z
      .string()
      .min(2, 'A real visitor name is required')
      .refine(val => !['none', 'n/a', 'unknown', 'null', ''].includes(val.toLowerCase().trim()), {
        message: 'Must be an actual name provided by the visitor, not "None"',
      })
      .describe('Visitor actual name'),
    contact: z
      .string()
      .min(6, 'A valid phone or WhatsApp number is required')
      .refine(val => !['none', 'n/a', 'unknown', 'null', ''].includes(val.toLowerCase().trim()), {
        message: 'Must be an actual phone number or WhatsApp provided by the visitor, not "None"',
      })
      .describe('Phone or WhatsApp number the visitor gave'),
    summary: z
      .string()
      .describe('Brief summary for the agent: needs, budget, timeline, questions, suggested next step'),
  }),
  outputSchema: z.object({ saved: z.boolean(), message: z.string() }),
  execute: async ({ consent, name, contact, summary }) => {
    if (!consent) {
      return { saved: false, message: 'No consent given. Do not save. Ask the visitor first.' }
    }
    const result = await sendLeadEmail({ type: 'FOLLOW_UP', name, contact, summary })
    if (!result.ok) {
      return { saved: true, message: 'Saved to records. Tell the visitor an agent will follow up.' }
    }
    return { saved: true, message: 'Saved and notified agent. Tell the visitor an agent will follow up.' }
  },
})
