interface Env {
    DB: D1Database;
}

export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        const SYMBOLS = ['TCB', 'HPG', 'MBB', 'DFIX', 'VNDAF'];
        console.log(`[Cron] Starting update for: ${SYMBOLS.join(', ')}`);

        for (const symbol of SYMBOLS) {
            try {
                // Fetch from TCBS
                const res = await fetch(`https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/${symbol}/overview`);

                if (res.ok) {
                    const data: any = await res.json();
                    // Data shape: { ticker: 'TCB', price: 35900, change: 0.32, ... }
                    // Note: TCBS uses 'price' (or 'close'?) and 'change' (value or percent?)
                    // Usually 'price' is current price. Update logic if valid.

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
                        ).bind(price, change, Math.floor(Date.now() / 1000), symbol).run();
                    }
                } else {
                    console.error(`Failed to fetch ${symbol}: ${res.status}`);
                }
            } catch (e) {
                console.error(`Error processing ${symbol}`, e);
            }
        }
    }
}
