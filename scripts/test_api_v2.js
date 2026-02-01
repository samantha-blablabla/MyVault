import https from 'https';

const now = Math.floor(Date.now() / 1000);
const start = now - (86400 * 5); // 5 days ago

// URL found in search
const url = `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term?ticker=TCB&type=stock&resolution=D&from=${start}&to=${now}`;

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://tcinvest.tcbs.com.vn/',
        'Origin': 'https://tcinvest.tcbs.com.vn',
        'Accept': 'application/json'
    }
};

console.log(`Testing: ${url}`);

https.get(url, options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                console.log('Success! Count:', json.data ? json.data.length : '0');
                console.log('Sample:', JSON.stringify(json.data[0]));
            } catch (e) {
                console.log('Not JSON:', data.substring(0, 100));
            }
        } else {
            console.log('Headers:', res.headers);
        }
    });
}).on('error', e => console.error(e));
