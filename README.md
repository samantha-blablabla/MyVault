# FINVAULT - SECURE WEALTH MANAGEMENT DASHBOARD

Dashboard quản trị tài chính cá nhân theo phong cách Swiss Style (Monotone), tối ưu cho bảo mật và tích hợp AI.

## 1. TECH STACK & ARCHITECTURE

*   **Frontend:** React (Vite/Next.js structure), Tailwind CSS v4, Shadcn UI components, Recharts.
*   **Style System:** Monotone (Zinc/Slate) + Glassmorphism.
*   **Authentication:** (Planned) NextAuth.js / Supabase Auth.
*   **Database:** Cloudflare D1 (SQLite) hoặc Supabase (PostgreSQL).
*   **Automation:** n8n (Webhook receiver & Scheduled scraping).

---

## 2. DATABASE SCHEMA (Backend Specification)

Để hệ thống hoạt động, Back-end cần triển khai các bảng sau (SQL Standard):

### Table: `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID/TEXT | Primary Key |
| `email` | TEXT | Unique |
| `income_source` | NUMERIC | Thu nhập mặc định (VD: 13,000,000) |
| `budget_rules` | JSON | Cấu hình tỷ lệ `{"needs": 50, "invest": 30, "savings": 20}` |

### Table: `transactions`
Lưu trữ toàn bộ dòng tiền (Thu/Chi & Mua/Bán cổ phiếu).

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT | Primary Key |
| `user_id` | TEXT | Foreign Key -> users.id |
| `date` | TIMESTAMP | ISO Date string |
| `type` | TEXT | Enum: `BUY`, `SELL`, `EXPENSE`, `INCOME`, `DIVIDEND` |
| `symbol` | TEXT | Mã CP (VD: TCB) hoặc `EXP` (Chi tiêu), `IN` (Thu nhập) |
| `quantity` | NUMERIC | Số lượng CP (0 nếu là Thu/Chi) |
| `price` | NUMERIC | Giá khớp lệnh hoặc Số tiền Thu/Chi |
| `notes` | TEXT | Ghi chú / Merchant Name |
| `category` | TEXT | (Optional) Phân loại chi tiêu |

### Table: `targets` (Mục tiêu tích sản)
| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | TEXT | Foreign Key |
| `symbol` | TEXT | Mã CP (VD: MBB) |
| `target_quantity` | INTEGER | Số lượng mục tiêu (VD: 1000) |

---

## 3. AI & SMART ADVISOR SPECIFICATION

Tính năng **"Mục tiêu tiếp theo" (InvestmentRoadmap)** và **"Smart Advisor"** hoạt động dựa trên logic sau. Back-end Developer (hoặc AI Agent) cần hiểu để triển khai API.

### A. Logic hiển thị hiện tại (Frontend Rule-based)
Frontend đang sử dụng hàm `getFinancialAdvice` trong `services/financeLogic.ts`:
1.  **Input:** Dữ liệu giao dịch 6 tháng gần nhất + Quy tắc ngân sách (50-30-20).
2.  **Process:** So sánh % thực tế tháng trước (T-1) với % mục tiêu.
3.  **Output:**
    *   **Good:** Chi tiêu < Hạn mức. -> Action: "Mua thêm chứng chỉ quỹ".
    *   **Warning:** Đầu tư < Mục tiêu. -> Action: "Dồn tiền mua CP đầu tháng".
    *   **Alert:** Chi tiêu > Hạn mức + 10%. -> Action: "Cắt giảm mua sắm".

### B. Nâng cấp Back-end AI (Future LLM Integration)
Khi triển khai Back-end, hãy thay thế logic `if/else` trên bằng một API call tới LLM (OpenAI/Gemini/Claude):

*   **Prompt System:**
    ```text
    Role: Financial Advisor.
    Context: User income 13M.
    Last Month Data: Spent 65% (Needs), Invested 15%, Savings 20%.
    Portfolio: TCB (Hold), MBB (Buying).
    Task: Analyze spending vs 50/30/20 rule. Give 1 short, actionable advice (max 20 words) focused on next month's stock purchase plan.
    ```
*   **Expected JSON Response:**
    ```json
    {
      "status": "warning",
      "message": "Chi phí thiết yếu tháng trước cao (65%).",
      "action": "Giảm ăn ngoài, dồn 1.5M mua thêm 50cp MBB ngay."
    }
    ```

### C. Receipt Scanning (ExpenseModal)
*   Frontend sử dụng **Google Gemini Flash 2.5** (Client-side API).
*   Đầu vào: Ảnh hóa đơn (Base64).
*   Đầu ra: JSON `{ amount, note, type }`.
*   **Lưu ý Bảo mật:** Trong môi trường Production, việc gọi Gemini nên thực hiện qua Proxy/Backend để ẩn API Key.

---

## 4. AUTOMATION & N8N INTEGRATION

### Luồng cập nhật giá cổ phiếu (Market Prices)
Hệ thống cần giá Real-time để tính NAV. Setup n8n như sau:

1.  **Trigger:** Every 1 Hour (Trading hours).
2.  **Node:** HTTP Request (Fetch price from FireAnt/VNDirect API).
3.  **Node:** Transform Data -> JSON `{ "TCB": 34500, "MBB": 21000 ... }`.
4.  **Action:** POST to FinVault API (`/api/market-prices`).
    *   Frontend sẽ nhận dữ liệu này để hiển thị tại `StockCard`.

---

## 5. DESIGN SYSTEM GUIDELINES

Dành cho AI khi generate thêm UI component:

*   **Color Palette (Monotone):**
    *   Background: `bg-zinc-950` (#09090b).
    *   Card Surface: `bg-zinc-900/60` + `backdrop-blur-md` + `border-white/5`.
    *   Primary Action: `text-white` or `bg-white` (High Contrast).
    *   Secondary Text: `text-zinc-500`.
    *   Accents (Chỉ dùng cho trạng thái):
        *   Profit/Success: `Emerald-500` (dùng tiết chế).
        *   Loss/Danger: `Rose-500`.
*   **Typography:** Plus Jakarta Sans (Main), JetBrains Mono (Numbers/Data).
*   **Interaction:** Không dùng thanh cuộn mặc định. Sử dụng "Dot Navigation" hoặc "Touch Swipe".