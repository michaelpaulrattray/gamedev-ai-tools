# data/

- `tools.json`: every listing (single source of truth). Optional `affiliateUrl` per tool: when present, the tool page's Visit button uses it with `rel="sponsored noopener"` and shows the commission note. Affiliate status never affects order or verdicts (tools are always sorted by name).
- `sponsor.json`: the current sponsor-strip booking. `{}` shows "Your tool here: Sponsor us". Filled example:
  `{"name":"Tool","url":"https://tool.example/","logo":"/assets/sponsors/tool.png","start":"2026-10-20","end":"2026-10-26"}`
  `logo` is optional (store it under `src/assets/sponsors/`). After `end` (build date, Australia/Brisbane), the strip falls back to the empty state on the next build.
- `deals.json`: array of real, vendor-sourced offers:
  `{"tool":"slug-or-name","offer":"20% off the first 3 months","code":"GAMEDEV20" or null,"source":"https://vendor.example/promo","expires":"2026-11-30" or null,"added":"2026-10-17"}`
  The build drops entries whose `expires` is before the build date. `expires: null` shows "No end date stated by the vendor".
