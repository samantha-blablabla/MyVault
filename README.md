# FINVAULT - PERSONAL WEALTH DASHBOARD

Hệ thống quản trị tài chính cá nhân 50-30-20, tích hợp theo dõi chứng khoán và tự động hóa.

## 1. CÔNG NGHỆ (TECH STACK)

*   **Frontend:** React (Vite/Next.js structure), Tailwind CSS v4, Shadcn UI.
*   **Backend & Hosting:** Cloudflare Pages (Hosting static assets).
*   **Database:** **Cloudflare D1** (SQLite on Edge) - Lưu trữ giao dịch an toàn, rẻ và nhanh.
*   **Automation:** **n8n** (Self-hosted hoặc Cloud) - Crawler dữ liệu giá & đẩy vào D1 qua API.

---

## 2. QUY TRÌNH DEPLOY CLOUDFLARE D1

Để hệ thống hoạt động với Database thật, hãy làm theo các bước sau:

1.  **Cài đặt Wrangler:**
    ```bash
    npm install -g wrangler
    wrangler login
    ```

2.  **Tạo Database:**
    ```bash
    wrangler d1 create finvault-db
    ```

3.  **Cấu hình `wrangler.toml`:**
    Tạo file `wrangler.toml` ở root project:
    ```toml
    name = "finvault-dashboard"
    pages_build_output_dir = "dist"
    
    [[d1_databases]]
    binding = "DB" # Tên biến dùng trong Code (Functions)
    database_name = "finvault-db"
    database_id = "<PASTE_YOUR_ID_HERE>"
    ```

4.  **Chạy Schema (Tạo bảng):**
    ```bash
    wrangler d1 execute finvault-db --file=./db/schema.sql
    ```

---

## 3. TÍNH NĂNG MOBILE SCAN & AI

*   **Native Camera:** Ứng dụng sử dụng thẻ `capture="environment"` để kích hoạt trực tiếp camera sau trên mobile.
*   **AI Integration (Planned):**
    *   Hiện tại: Giả lập (Simulation) phân tích ảnh sau 2.5s.
    *   Tương lai: Ảnh sẽ được upload lên **Cloudflare R2** -> Trigger **Cloudflare Workers AI** (Llama-3-Vision) để trích xuất JSON -> Lưu vào D1.

---

## 4. AUTOMATION FLOW (n8n)

1.  **n8n** chạy định kỳ (Cronjob).
2.  Lấy giá cổ phiếu (TCB, MBB...) từ nguồn ngoài.
3.  Gọi API tới Cloudflare Worker: `POST /api/webhooks/update-prices`.
4.  Worker cập nhật bảng `assets` trong D1.
5.  Frontend gọi `GET /api/portfolio` để hiển thị dữ liệu mới nhất.
