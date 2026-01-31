async function main() {
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const url = "https://s.cafef.vn/Ajax/PageNew/DataHistory.ashx?Symbol=TCB&StartDate=&EndDate=&PageIndex=1&PageSize=1";
    try {
        const res = await fetch(url, { headers });
        console.log(`Status: ${res.status}`);
        const txt = await res.text();
        console.log(txt.substring(0, 500));
    } catch (e) { console.error(e); }
}
main();
