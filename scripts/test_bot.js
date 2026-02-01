import { execSync } from 'child_process';

// Base Prices (Reference)
const BASE_PRICES = {
    'TCB': 35900,
    'HPG': 26800,
    'MBB': 27200,
    'DFIX': 11968,
    'VNDAF': 19910
};

async function main() {
    console.log("🤖 Đang chạy thử nghiệm Bot (Simulation Mode - Weekend)...");

    for (const [symbol, basePrice] of Object.entries(BASE_PRICES)) {
        try {
            // Simulation: Randomize price slightly (+/- 2%)
            const randomFactor = 1 + (Math.random() * 0.04 - 0.02);
            const newPrice = Math.floor(basePrice * randomFactor);
            const change = (newPrice - basePrice);

            console.log(`[${symbol}] Giá giả lập: ${newPrice.toLocaleString('vi-VN')} đ (Thay đổi: ${change.toFixed(0)})`);

            // Cập nhật Database thật
            const sql = `UPDATE market_signals SET price = ${newPrice}, change = ${change.toFixed(2)}, updated_at = ${Math.floor(Date.now() / 1000)} WHERE symbol = '${symbol}'`;

            const cmd = `npx wrangler d1 execute finvault-db --remote --command "${sql}"`;
            // execSync(cmd, { stdio: 'ignore' }); 
            // We use ignore to speed up, assuming success if no throw
            execSync(cmd, { stdio: 'pipe' });

            console.log(`   -> Đã update vào Database!`);

        } catch (e) {
            console.error(`   -> Lỗi khi xử lý ${symbol}`, e);
        }
    }
    console.log("Done! Dữ liệu đã được cập nhật. Bạn hãy reload web để kiểm tra.");
}

main();
