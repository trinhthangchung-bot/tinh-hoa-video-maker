# Tinh Hoa AI — máy chủ riêng

GitHub Pages chỉ chạy giao diện. Dịch vụ này phải được triển khai trên hosting chạy Node.js 22+ có HTTPS. Chưa được triển khai hoặc cấp khóa trong phiên phát triển này. Dành cho một chủ tài khoản; chưa phải dịch vụ nhiều người dùng, chưa có tài khoản/quota/hạn mức theo người.

Đặt các biến bí mật trong cấu hình hosting, không commit vào Git:

- `GEMINI_API_KEY`: khóa từ Google AI Studio, dự án đã bật thanh toán/quyền model cần dùng.
- `AI_ACCESS_TOKEN`: chuỗi ngẫu nhiên ít nhất 32 ký tự, dùng riêng cho chủ tool. Không phải khóa Google.
- `APP_ORIGIN`: `https://trinhthangchung-bot.github.io` (không có đường dẫn).
- `PORT`: do hosting cung cấp; mặc định 8787.
- `IMAGE_MODEL`: mặc định `gemini-2.5-flash-image`, có thể đổi model tương thích generateContent.
- `VIDEO_MODEL`: mặc định `veo-3.1-generate-preview`.

Chạy `node server/ai-server.mjs`. Giới hạn body của reverse proxy tối thiểu 45 MB, timeout tối thiểu 180 giây. Cấu hình rate limiting và hạn mức thanh toán trước khi cấp thêm người truy cập. Không đưa service token lên trang công khai.

Trong tool: Cài đặt → Kết nối AI → Gemini API; nhập URL HTTPS của dịch vụ và mã truy cập máy chủ, bấm Kiểm tra kết nối. Mã truy cập chỉ giữ trong bộ nhớ tab, phải nhập lại khi tải lại. Khóa Gemini chỉ có ở máy chủ, không nằm trong browser storage hoặc file backup. URL/chế độ là cấu hình toàn tool, không theo dự án.

Kiểm tra kết nối gọi thông tin model, không tạo nội dung. Thành công không đảm bảo đủ số dư hoặc quota tạo nội dung. Không có tác vụ tính phí chạy tự động. Người dùng xác nhận từng ảnh/video.

Ảnh tạo xong lưu vào IndexedDB đúng nhóm. Veo dùng 1–3 ảnh, 8 giây, 720p, 9:16 hoặc 16:9. Tạo video trả mã tác vụ; người dùng bấm Kiểm tra / nhận video để nhận kết quả. Mã tác vụ giữ trong dự án trên trình duyệt, không mang sang bản khôi phục. Tải kết quả trong vòng 2 ngày; mã có hạn 47 giờ. Không gửi lại tác vụ nếu phản hồi bị gián đoạn trước khi nhận mã: kiểm tra Google trước để tránh tính phí lặp.

Flow là lựa chọn mở thủ công. Tài khoản Flow hoặc Google AI Pro không được chuyển thành kết nối Gemini API.

Tài liệu: https://ai.google.dev/gemini-api/docs/api-key và https://ai.google.dev/gemini-api/docs/veo
