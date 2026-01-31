interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM market_signals ORDER BY updated_at DESC"
        ).all();

        return Response.json(results);
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const data = await context.request.json() as any;

        // Validate required fields
        if (!data.symbol || !data.price) {
            return Response.json({ error: "Missing symbol or price" }, { status: 400 });
        }

        // Upsert (Insert or Update if exists)
        await context.env.DB.prepare(
            `INSERT INTO market_signals (symbol, price, change, rsi, volume_state, note, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(symbol) DO UPDATE SET
       price=excluded.price,
       change=excluded.change,
       rsi=excluded.rsi,
       volume_state=excluded.volume_state,
       note=excluded.note,
       updated_at=excluded.updated_at`
        ).bind(
            data.symbol,
            data.price,
            data.change || 0,
            data.rsi || 50,
            data.volume_state || 'ACCUMULATING',
            data.note || '',
            Math.floor(Date.now() / 1000)
        ).run();

        return Response.json({ success: true, symbol: data.symbol });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
}
