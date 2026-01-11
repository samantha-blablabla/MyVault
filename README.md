# ĐẶC TẢ HỆ THỐNG AUTOMATION TÀI CHÍNH CÁ NHÂN (N8N + NEXT.JS)

## 1. TỔNG QUAN HỆ THỐNG

**Mục tiêu:** Tự động hóa việc theo dõi tài sản, phân bổ lương theo quy tắc 50-30-20 và cập nhật danh mục đầu tư theo thời gian thực.

*   **Dòng tiền đầu vào:** 13.000.000 VNĐ/tháng.
*   **Quy tắc phân bổ:**
    *   **50% (Needs):** 6.500.000 VNĐ (Tiêu dùng & Hóa đơn).
    *   **30% (Invest):** 3.900.000 VNĐ (VNDAF: 2M, DFIX: 1M, Stocks: 900k).
    *   **20% (Safety):** 2.600.000 VNĐ (Quỹ dự phòng/Tiết kiệm).

---

## 2. CẤU TRÚC DỮ LIỆU CORE (JSON)

Hệ thống sử dụng cấu trúc dữ liệu chuẩn để đồng bộ giữa Dashboard và n8n:

```json
{
  "profile": { "salary": 13000000, "day_of_salary": 7 },
  "spending": { "limit": 6500000, "actual": 0, "bills": [] },
  "portfolio": {
    "funds": [
      { "code": "VNDAF", "balance": 0, "nav": 0 },
      { "code": "DFIX", "balance": 0, "nav": 0 }
    ],
    "stocks": [
      { "symbol": "TCB", "quantity": 100, "avg_price": 0, "target": 100 },
      { "symbol": "MBB", "quantity": 40, "avg_price": 0, "target": 100 },
      { "symbol": "HPG", "quantity": 20, "avg_price": 26600, "target": 100 },
      { "symbol": "CTR", "quantity": 0, "avg_price": 0, "target": 50 }
    ]
  }
}
```

---

## 3. CÁC WORKFLOW N8N CẦN THIẾT LẬP

### Workflow 1: Cập nhật giá Chứng khoán & Quỹ (Daily - 17:00)
1.  **Trigger (Schedule):** Chạy hàng ngày sau giờ giao dịch.
2.  **HTTP Request:** Lấy giá TCB, MBB, HPG, CTR từ API (VNDirect/SSI/Fireant).
3.  **HTML Extract/Scraping:** Truy cập website quản lý quỹ để lấy NAV của VNDAF và DFIX.
4.  **Logic Node:** Tính toán tổng giá trị tài sản ròng (Net Worth) hiện tại.

### Workflow 2: Quản lý dòng tiền mùng 7 (Monthly)
1.  **Trigger:** Kích hoạt vào ngày nhận lương (mùng 7).
2.  **Code Node:** 
    *   Tự động tách 3.900.000đ vào ngân sách đầu tư.
    *   Kiểm tra Logic "Carry-over": Nếu tháng trước chi tiêu Needs < 6.5M, cộng dồn phần dư vào ngân sách mua Cổ phiếu tháng này.
3.  **Telegram Node:** Gửi thông báo nhắc nhở mua thêm cổ phiếu mục tiêu (Ưu tiên MBB cho đủ 100cp).

### Workflow 3: Đồng bộ Dashboard (Webhook)
*   Mỗi khi có thay đổi dữ liệu, n8n thực hiện lệnh `POST` đến API Route của Dashboard (`/api/update-assets`) để cập nhật UI ngay lập tức.

---

## 4. LOGIC TÍNH TOÁN CẦN XỬ LÝ TRÊN DASHBOARD

*   **MAC (Moving Average Cost):** Tự động tính lại giá vốn bình quân khi người dùng nhập giao dịch mua mới thông qua Modal "Thêm Giao dịch".
*   **Goal Tracking:** 
    *   Hiển thị Progress Bar cho MBB (ví dụ hiện tại 40%). 
    *   Logic tự động: Khi MBB đạt 100%, hệ thống tự động chuyển tiêu điểm mục tiêu sang CTR.
*   **Dividend Tax:** Tự động trừ 5% thuế TNCN khi tính toán cổ tức thực nhận.
*   **Daily Budget (Spendable):** 
    *   Công thức: `(6.5M - Tiền hóa đơn cố định chưa trả - Đã tiêu) / Số ngày còn lại`.
    *   Mục đích: Gợi ý mức chi tiêu an toàn hàng ngày để tránh lạm phát chi tiêu.

---

## 5. YÊU CẦU KỸ THUẬT (TECH STACK)

*   **Frontend:** Next.js (App Router) + React.
*   **Styling:** Tailwind CSS + Shadcn UI (Phong cách Bento Grid, Glassmorphism, Dark Mode chủ đạo).
*   **API Integration:** Sử dụng Next.js API Routes để nhận Webhook từ n8n.
*   **State Management:** React Context API để đảm bảo dữ liệu "Time-by-time" và biểu đồ được cập nhật tức thì.
*   **Security:** 
    *   Màn hình Login giả lập (hoặc NextAuth).
    *   Bảo vệ các route nhạy cảm.
