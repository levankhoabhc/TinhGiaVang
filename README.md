# Máy Tính Giá Vàng PNJ

Ứng dụng web đơn giản để tính giá vàng dựa trên dữ liệu thời gian thực từ PNJ.

## Tính Năng

- Cập nhật giá vàng tự động từ PNJ mỗi 5 phút
- Hỗ trợ tính toán với đơn vị Chỉ hoặc Gram
- Tính toán giá thành phẩm dựa trên:
  - Loại vàng (SJC 9999, 18K, 24K, etc.)
  - Khối lượng
  - Phí gia công
- Giao diện thân thiện, dễ sử dụng
- Hiển thị thời gian cập nhật giá mới nhất

## Cách Sử Dụng

1. Mở file `index.html` trong trình duyệt web
2. Chọn loại vàng từ danh sách
3. Nhập khối lượng (có thể chuyển đổi giữa Chỉ và Gram)
4. Nhập phí gia công
5. Nhấn nút "Tính Giá" để xem kết quả

## Công Nghệ Sử Dụng

- HTML5
- CSS3 (với CSS Variables và Flexbox)
- JavaScript (ES6+)
- Fetch API để lấy dữ liệu từ PNJ

## Lưu ý

- 1 Chỉ = 3.75 Gram
- Giá vàng được cập nhật tự động mỗi 5 phút
- Dữ liệu được lấy từ [giavang.pnj.com.vn](https://giavang.pnj.com.vn/)

## Cài Đặt

1. Clone repository này
2. Mở file `index.html` trong trình duyệt web
3. Không cần cài đặt thêm phần mềm nào khác

## Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request để cải thiện ứng dụng. 