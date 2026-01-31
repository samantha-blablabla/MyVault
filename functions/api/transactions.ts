interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM transactions ORDER BY date DESC"
        ).all();

        return Response.json(results);
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const data = await context.request.json() as any;

        // Basic validation
        if (!data.id || !data.amount) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert into D1
        await context.env.DB.prepare(
            `INSERT INTO transactions (id, user_id, date, symbol, type, quantity, price, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            data.id,
            'user-default', // Placeholder for now until Auth is ready
            data.date,
            data.symbol,
            data.type,
            data.quantity || 0,
            data.price,
            data.notes
        ).run();

        return Response.json({ success: true, data });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
}
