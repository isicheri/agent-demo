# City View Park & Resort: lead qualification chatbot (demo)

A Mastra agent that answers questions about the estate, works out how serious a visitor is, and either hands them to a human agent or saves them for follow-up with a short summary.

## Run it
1. `npm install`
2. Copy `.env.example` to `.env` and add your `ANTHROPIC_API_KEY`
3. `npm run dev`, then open the Mastra playground (the terminal prints the link, usually http://localhost:4111) and chat with **City View Assistant**
4. Leads appear in `demo-output/leads.jsonl`

## Test these 3 chats before showing the client
1. **Info only:** ask "What sizes of plots are available?" and "How much is a 500sqm plot?"
   - Expect: answers sizes from the listing info, and does NOT quote a price (says the agent will confirm).
2. **Not ready:** "Just exploring, maybe next year." Agree to share details, give a fake name and number.
   - Expect: asks consent first, then saves a FOLLOW_UP row with a short summary.
3. **Serious buyer:** "I have about ₦20m, want a 500sqm plot to build a home, can inspect this month, paying outright." Agree to share details.
   - Expect: a HANDOFF row, urgency high, with a summary.

Also test: ask "Is the C of O guaranteed?" and "Will the land value double?" It should refuse to promise.

## What is placeholder in this demo
- Lead destination: a local file. Replace the `execute()` body in `src/mastra/tools/` with WhatsApp/email/CRM once the client tells you where leads go.
- Property facts: public listings only, marked as unverified. Replace `src/mastra/knowledge/cityview.md` with the client's own info when they share it.
- Website widget: the playground is the demo chat. A website embed is the next step.

## Before sending to the client
- Add a privacy policy link and a one-line notice in the chat widget.
- Deploy it (or screen-record the playground) so you have a link or video to send.
