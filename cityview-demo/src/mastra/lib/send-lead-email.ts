import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export type Lead = {
    type: 'HANDOFF' | 'FOLLOW_UP'
    urgency?: 'high' | 'medium'
    name: string
    contact: string
    summary: string
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function formatWhatsAppLink(contact: string): string | null {
    const digits = contact.replace(/\D/g, '')
    if (!digits || digits.length < 7) return null
    let international = digits
    if (digits.startsWith('0') && digits.length === 11) {
        international = '234' + digits.slice(1)
    } else if (digits.startsWith('234')) {
        international = digits
    }
    return `https://wa.me/${international}`
}

import { fileURLToPath } from 'node:url'

// Backup copy on disk so a lead is never lost if email fails.
function logToFile(lead: Lead) {
    const dir = fileURLToPath(new URL('../../../demo-output', import.meta.url))
    mkdirSync(dir, { recursive: true })
    appendFileSync(
        join(dir, 'leads.jsonl'),
        JSON.stringify({ ...lead, at: new Date().toISOString() }) + '\n',
    )
}

export async function sendLeadEmail(lead: Lead): Promise<{ ok: boolean; error?: string }> {
    logToFile(lead)

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.LEAD_EMAIL_TO
    const from = process.env.LEAD_EMAIL_FROM ?? 'onboarding@resend.dev'
    if (!apiKey || !to) {
        return { ok: false, error: 'RESEND_API_KEY or LEAD_EMAIL_TO is not set' }
    }

    const isHandoff = lead.type === 'HANDOFF'
    const urgency = lead.urgency ?? (isHandoff ? 'high' : 'medium')
    const waLink = formatWhatsAppLink(lead.contact)

    const subject = isHandoff
        ? `🔥 [${urgency.toUpperCase()}] Verified Buyer: ${lead.name} • City View Abuja`
        : `📋 [FOLLOW-UP] Prospect Lead: ${lead.name} • City View Abuja`

    const formattedSummary = escapeHtml(lead.summary).replace(/\n/g, '<br/>')

    // Premium HTML briefing card
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <!-- Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #091e2f 0%, #102a45 100%); padding: 32px 28px; text-align: center;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 8px;">
          CITY VIEW PARK & RESORT • ABUJA
        </div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 12px 0;">
          ${isHandoff ? 'New Qualified Buyer Handoff' : 'New Follow-Up Prospect'}
        </h1>
        <div>
          <span style="background-color: ${urgency === 'high' ? '#ef4444' : '#3b82f6'}; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 5px 14px; border-radius: 9999px; display: inline-block;">
            ${isHandoff ? '⚡ HIGH URGENCY / READY TO BUY' : '📋 PROSPECT / FOLLOW-UP'}
          </span>
        </div>
      </td>
    </tr>

    <!-- Lead Info Grid -->
    <tr>
      <td style="padding: 28px 28px 12px 28px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px 20px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Buyer Name:</span>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${escapeHtml(lead.name)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Contact Number:</span>
              <div style="font-size: 16px; font-weight: 700; color: #2563eb; margin-top: 2px;">
                ${escapeHtml(lead.contact)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0 0;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Captured At:</span>
              <div style="font-size: 14px; color: #475569; margin-top: 2px;">
                ${new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- WhatsApp One-Click Action Button -->
    ${
      waLink
        ? `
    <tr>
      <td style="padding: 8px 28px 20px 28px;">
        <a href="${waLink}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 15px 20px; border-radius: 10px; font-size: 16px; font-weight: 800; text-align: center; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);">
          💬 Open WhatsApp Chat with ${escapeHtml(lead.name)}
        </a>
      </td>
    </tr>
    `
        : ''
    }

    <!-- Executive Briefing Card -->
    <tr>
      <td style="padding: 0 28px 28px 28px;">
        <div style="border-left: 4px solid #0284c7; background-color: #f0f9ff; border-radius: 0 10px 10px 0; padding: 18px 20px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0369a1; margin-bottom: 8px;">
            Executive Agent Briefing
          </div>
          <div style="font-size: 14px; line-height: 1.6; color: #0f172a;">
            ${formattedSummary}
          </div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        Sent in real-time by <strong>City View Intelligent Lead Qualification System</strong>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Fallback plain text
    const text = [
        isHandoff ? '🔥 SERIOUS BUYER HANDOFF: Contact immediately.' : '📋 PROSPECT FOLLOW-UP: Follow up later.',
        '-------------------------------------------------------',
        `Buyer Name:   ${lead.name}`,
        `Contact:      ${lead.contact}`,
        waLink ? `WhatsApp:     ${waLink}` : '',
        `Urgency:      ${urgency.toUpperCase()}`,
        '-------------------------------------------------------',
        'Executive Briefing:',
        lead.summary,
        '-------------------------------------------------------',
        'Sent by City View Intelligent Lead Qualification System',
    ]
        .filter(Boolean)
        .join('\n')

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: [to], subject, text, html }),
        })
        if (!res.ok) {
            const errBody = await res.text()
            return { ok: false, error: `Email provider returned ${res.status}: ${errBody}` }
        }
        return { ok: true }
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Email request failed' }
    }
}