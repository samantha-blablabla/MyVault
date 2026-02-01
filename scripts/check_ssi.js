async function main() {
    // Use a generic User-Agent to avoid blocking
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const url = "https://iboard.ssi.com.vn/dchart/api/history?resolution=D&symbol=TCB&from=1769800000&to=1769900000";
    try {
        const res = await fetch(url, { headers });
        console.log(`Status: ${res.status}`);
        const txt = await res.text();
        console.log(txt.substring(0, 500));
    } catch (e) { console.error(e); }
}
main();
