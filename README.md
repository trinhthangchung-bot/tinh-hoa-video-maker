# Tinh Hoa Video Maker

Ứng dụng web tiếng Việt để quản lý dự án và ghi ý tưởng, kịch bản video. Phiên bản nền tảng không tích hợp AI, không gọi dịch vụ tạo ảnh/video và không sử dụng tín dụng AI.

## Phát triển

Yêu cầu Node.js 22.12+ (đã xác minh trên Node.js 24) và npm.

```sh
npm ci
npm run dev
```

Chạy Vite ở cổng 5173. Nếu sử dụng môi trường có thư mục home chỉ đọc, thêm `--cache /workspace/.npm-cache` vào lệnh `npm ci`.

## Kiểm thử và build

```sh
# Chỉ cần nếu máy chưa có /usr/bin/chromium:
npx playwright install chromium
npm test
npm run test:production
npm run build
npm run preview
```

Playwright tự khởi động và dừng máy chủ kiểm thử ở cổng 5173. Không chạy máy chủ khác ở cổng này khi kiểm thử. Cấu hình ưu tiên Chromium hệ thống, nếu có; máy khác dùng Chromium do Playwright cài đặt. Bộ kiểm thử trình duyệt bao gồm tạo, đổi tên, tự động lưu, lưu thủ công, đóng/mở, tải lại ngay sau chỉnh sửa, nhiều dự án, xác nhận xóa, dữ liệu lỗi, lỗi bộ nhớ, nhiều tab, thư viện ảnh, câu lệnh, liên kết ảnh, hàng đợi video và bố cục laptop.

## Lưu dữ liệu

Dữ liệu nằm trong `localStorage`, khóa `tinh-hoa.projects.v1`. Mỗi dự án có ID độc lập, tên, kịch bản và thời điểm cập nhật. Thay đổi tự động lưu sau 400 ms; nút lưu, đóng/chuyển dự án và rời trang đều thực hiện lưu ngay. Khi ghi thất bại, ứng dụng cảnh báo và không đóng dự án. Thay đổi từ tab khác chặn ghi đè và yêu cầu tải lại. Dữ liệu hỏng không bị tự động xóa hoặc thay thế.

Dữ liệu chỉ thuộc trình duyệt/profile và địa chỉ website hiện tại, không đồng bộ giữa máy hoặc tài khoản. Xóa dữ liệu website hoặc sử dụng chế độ riêng tư có thể làm mất dự án. Dùng cùng địa chỉ/cổng để mở lại dữ liệu. Xóa dự án cần xác nhận và không thể hoàn tác.

## Phạm vi

Giao diện thích ứng với laptop và màn hình nhỏ. Có thư viện tối đa 50 ảnh tham chiếu cho mỗi dự án (file ảnh nằm trong IndexedDB thay vì `localStorage`), form sản phẩm, bản nháp câu lệnh tạo theo mẫu trên thiết bị, card cảnh có thể thu gọn và hàng đợi cảnh sẵn sàng. Tab Video hiện chỉ lưu tên file kết quả do người dùng chọn, chưa lưu nội dung file video, chưa phát hoặc ghép video. Chưa có xuất video, đăng nhập, đồng bộ đám mây hoặc AI. Không cần API key, cơ sở dữ liệu hay dịch vụ ngoài để chạy ứng dụng.

## GitHub Pages

Website: https://trinhthangchung-bot.github.io/tinh-hoa-video-maker/

Vite sử dụng base path `/tinh-hoa-video-maker/`. Trong repository trên GitHub, vào Settings → Pages → Build and deployment → Source và chọn **GitHub Actions**. Workflow `.github/workflows/deploy-pages.yml` tự chạy mỗi lần push vào `main`, hoặc có thể chạy thủ công từ Actions. Workflow cài phụ thuộc theo lockfile, chạy kiểm thử trình duyệt development và production, build rồi triển khai `dist` qua GitHub Pages.

Khi chạy local, mở đường dẫn `/tinh-hoa-video-maker/` trên máy chủ Vite. Dữ liệu local và website công khai thuộc hai origin khác nhau, nên dự án cũ trên local không tự chuyển sang GitHub Pages.


## Nâng cấp quy trình 04/10/2026

- Dán mỗi dòng thành một cảnh; chọn nhiều ảnh, xem ảnh đã gắn, gắn theo tên xuất hiện trong câu lệnh. Mẫu 40 giây tạo 5 cảnh 8 giây; bản nháp vẫn là mẫu, chưa gọi AI.
- Nhập file video thật (tối đa 250 MB/clip), lưu IndexedDB, xem, đổi thứ tự, tải lại.
- Ghép clip bằng Canvas + Web Audio + MediaRecorder; xuất WebM có âm thanh, không xuất MP4. Ghép theo thời gian thực, cần giữ tab hiển thị. Hủy hoặc lỗi giữ nguyên clip gốc.
- Sao lưu JSON gồm metadata, ảnh và video (tối đa 100 MB dữ liệu nhị phân); khôi phục thành dự án mới, không ghi đè dự án hiện có. Video lớn cần tải riêng.
- Dữ liệu vẫn nằm trên trình duyệt của thiết bị. Tải bản sao lưu trước khi xóa dữ liệu trình duyệt.
- Chưa có kết nối Flow/API, chưa có tạo video hoặc viết prompt bằng AI.
