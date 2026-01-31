// src/index.ts
var index_default = {
  async scheduled(event, env, ctx) {
    const SYMBOLS = ["TCB", "HPG", "MBB", "DFIX", "VNDAF"];
    console.log(`[Cron] Starting update for: ${SYMBOLS.join(", ")}`);
    for (const symbol of SYMBOLS) {
      try {
        const res = await fetch(`https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/${symbol}/overview`);
        if (res.ok) {
          const data = await res.json();
          const price = data.price || data.close || 0;
          const change = data.change || 0;
          if (price > 0) {
            console.log(`Updating ${symbol}: ${price}`);
            await env.DB.prepare(
              `INSERT INTO market_signals (symbol, price, change, updated_at) 
                  VALUES (?, ?, ?, ?)
                  ON CONFLICT(symbol) DO UPDATE SET
                  price=excluded.price,
                  change=excluded.change,
                  updated_at=excluded.updated_at`
            ).bind(price, change, Math.floor(Date.now() / 1e3), symbol).run();
          }
        } else {
          console.error(`Failed to fetch ${symbol}: ${res.status}`);
        }
      } catch (e) {
        console.error(`Error processing ${symbol}`, e);
      }
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
