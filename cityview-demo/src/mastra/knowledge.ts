import { fileURLToPath } from 'node:url'
import { Knowledge, knowledgeMemoryScopes } from '@mastra/core/knowledge'
import { LibSQLStore } from '@mastra/libsql'

const dbPath = fileURLToPath(new URL('../../knowledge.db', import.meta.url)).replace(/\\/g, '/')

export const knowledge = new Knowledge({
    id: 'cityview',
    storage: new LibSQLStore({ id: 'knowledge', url: `file:${dbPath}` }),
    scopes: {
        ...knowledgeMemoryScopes(),
        // 1. Pattern must come first
        'property-docs:$orgId': {
            description: 'Estate information for an org',
            access: [
                { principal: 'self', role: 'viewer' },
                { principal: 'org:$orgId', role: 'viewer' },
            ],
        },
        // 2. Concrete address can now be added on top
        'property-docs:cityview': {
            description: 'City View Park & Resort estate information',
            access: [
                { principal: 'self', role: 'viewer' },
                { principal: 'org:cityview', role: 'viewer' },
            ],
        },
    },
    tools: { read: true },
})
