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
        if (!data.id || data.price === undefined) {
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
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return Response.json({ error: "Missing id" }, { status: 400 });
        }

        await context.env.DB.prepare(
            "DELETE FROM transactions WHERE id = ?"
        ).bind(id).run();

        return Response.json({ success: true, id });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const data = await context.request.json() as any;

        if (!data.id) {
            return Response.json({ error: "Missing id" }, { status: 400 });
        }

        // Update fields
        await context.env.DB.prepare(
            `UPDATE transactions 
             SET date = ?, symbol = ?, type = ?, quantity = ?, price = ?, notes = ?
             WHERE id = ?`
        ).bind(
            data.date,
            data.symbol,
            data.type,
            data.quantity || 0,
            data.price,
            data.notes,
            data.id
        ).run();

        return Response.json({ success: true, data });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
};
