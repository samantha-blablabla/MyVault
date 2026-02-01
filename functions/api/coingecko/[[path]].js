export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = context.params.path ? context.params.path.join('/') : '';
    const targetUrl = `https://api.coingecko.com/api/v3/${path}${url.search}`;

    const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FinVault/1.0)',
            'Accept': 'application/json'
        }
    });

    return new Response(response.body, {
        status: response.status,
        messages: response.statusText,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
