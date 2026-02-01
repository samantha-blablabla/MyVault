async function testSSI() {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://iboard.ssi.com.vn/'
    };

    // 1. Try to get Market Foreign Flow (VN-INDEX)
    const urlFlow = "https://apipubaws.tcbs.com.vn/stock-insight/v1/intraday/VNINDEX/investor/his?limit=5";
    // TCBS is often easier to hit provided we simulate headers.

    // OR try FireAnt (often requires token suitable for simple GET?)
    // Let's try a known open simplified API from rapidapi or similar? No.
    // Let's try the SSI one referenced in many public repos.
    const urlSSI = "https://iboard.ssi.com.vn/dchart/api/1.1/default/stock/foreign-trading?symbol=VN30";

    console.log("Testing TCBS Flow API...");
    try {
        const res = await fetch(urlFlow, { headers });
        console.log("TCBS Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("TCBS Data:", JSON.stringify(data).substring(0, 200));
        }
    } catch (e) { console.log("TCBS Failed:", e.message); }

    console.log("\nTesting SSI Top Foreign API (Hypothetical)...");
    const urlSSITop = "https://fiin-market.ssi.com.vn/Market/GetTopForeignTrading?language=vi&ComGroupCode=HOSE&Take=5";
    try {
        const res2 = await fetch(urlSSITop, { headers });
        console.log("SSI Status:", res2.status);
        if (res2.ok) {
            const data2 = await res2.json();
            console.log("SSI Data:", JSON.stringify(data2).substring(0, 200));
        }
    } catch (e) { console.log("SSI Failed:", e.message); }
}

testSSI();
