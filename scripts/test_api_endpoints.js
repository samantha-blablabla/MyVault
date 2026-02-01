import https from 'https';

const endpoints = [
    'https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/TCB/overview',
    'https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term?ticker=TCB&type=stock&resolution=D&count=1',
    'https://finfo-api.vndirect.com.vn/v4/stocks?q=code:TCB'
];

endpoints.forEach(url => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`\nURL: ${url}`);
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('Sample:', data.substring(0, 150));
            }
        });
    }).on('error', (e) => {
        console.error(`Error ${url}: ${e.message}`);
    });
});
