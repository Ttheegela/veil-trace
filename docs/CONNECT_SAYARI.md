# Connect to Sayari's data from your AI tool (MCP)

Sayari offers its data to AI tools through an **MCP connection** (a standard way for tools like Claude or Cursor to call a data service). You sign in once in your browser; your tool can then search companies, ownership, shipments and watchlists.

- **Address:** `https://mcp.sayari.com/mcp`
- **Sign-in:** a browser login. Use the **Sayari event login shared by the organisers at check-in**. You type it yourself on Sayari's page; your AI tool never sees it.
- Tested today: it offers 20 look-up tools (search, company profiles, owners, shipments, suppliers, buyers, watchlist checks, source records).

## Option 1: Claude Code (terminal)

1. Add the connection:
   ```
   claude mcp add --transport http sayari https://mcp.sayari.com/mcp
   ```
2. Start Claude: `claude`
3. Type `/mcp`, choose **sayari**, then **Authenticate**.
4. A browser page opens. Log in with the event login and approve access.
5. Back in Claude, ask something like: "Use Sayari to search for Aluminum Corporation of China and summarise its owners."

If `claude` itself won't start, reinstall it (`npm install -g @anthropic-ai/claude-code`) and try again.

## Option 2: Claude desktop app or claude.ai

Settings > **Connectors** > **Add custom connector** > paste `https://mcp.sayari.com/mcp` > **Connect**, then log in with the event login in the window that opens.

## Option 3: Cursor, VS Code or another MCP client

Add this to your MCP settings file (e.g. `.cursor/mcp.json` or the client's MCP config), then use the client's "connect / authenticate" button and log in:

```json
{
  "mcpServers": {
    "sayari": { "type": "http", "url": "https://mcp.sayari.com/mcp" }
  }
}
```

## Tips from this morning (save yourself time)

- **Search with the full legal name.** A short name like "Trafigura" returns hundreds of fuzzy matches; the top one can be an empty duplicate.
- **Topic counts need one word** ("cobalt", not a sentence), or they silently return zero.
- **The date filter is ignored:** read dates from the shipment rows themselves.
- **The buyer-name filter is unreliable:** put the name in the text search instead.
- **Answers can be huge** (the limit is sometimes ignored). Ask for small pages.
- **Avoid the upstream supply-chain tool with a product filter:** it has errored and hung for 10+ minutes.
- **"Sanctioned" can mean another country's sanctions** (e.g. China's counter-sanctions), and the flag can be wrong. Check any hit against the official US, UK or EU list before saying a company is listed.
- **Part numbers need the full ordering code** (e.g. `STM32F765VIT6`, not `STM32F765`).

## Rules for the day

- **Look-ups only.** Sayari's data is licensed for today: keep raw answers on your laptop, don't post them publicly or commit them to a public repo.
- **Companies only.** Don't put private individuals' names on screens or the board.
- **A match or a link is a lead, not proof.**
- Never paste the login or any key into the board, a card, a chat channel or a file.

Questions? Ask Alex, or post on the team board.
