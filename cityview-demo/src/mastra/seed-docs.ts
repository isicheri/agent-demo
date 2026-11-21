// src/mastra/seed-docs.ts
import { knowledge } from './knowledge'
import { readFileSync } from 'fs'

const markdown = readFileSync(new URL('./knowledge/cityview.md', import.meta.url), 'utf-8')

await knowledge.upsertPage({
    scope: 'property-docs:cityview',
    path: 'overview',
    name: 'City View Park & Resort',
    body: markdown,
    author: 'seed:docs',
})

console.log('Seeded cityview knowledge.')


// npx tsx src/mastra/seed.ts
