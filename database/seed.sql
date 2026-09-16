-- ============================================
-- SEED DATA - Dữ liệu mẫu để chạy thử
-- ============================================

USE coffee_shop;

-- Xóa dữ liệu cũ (nếu chạy lại seed)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Tài khoản Admin
-- Email: admin@coffeeshop.com
-- Mật khẩu: admin123   (đã hash bằng bcrypt)
-- ============================================
INSERT INTO users (full_name, email, password, role) VALUES
('Quản trị viên', 'admin@coffeeshop.com', 'admin123@', 'admin');

-- ============================================
-- Danh mục
-- ============================================
INSERT INTO categories (name, slug, description) VALUES
('Cà phê', 'ca-phe', 'Các loại cà phê truyền thống và hiện đại'),
('Trà', 'tra', 'Trà thảo mộc và trà truyền thống'),
('Trà sữa', 'tra-sua', 'Trà sữa các vị'),
('Nước ép', 'nuoc-ep', 'Nước ép trái cây tươi'),
('Bánh', 'banh', 'Bánh ngọt ăn kèm');

-- ============================================
-- Sản phẩm
-- ============================================
INSERT INTO products (category_id, name, slug, description, price, image_url, is_featured, is_available) VALUES
(1, 'Cà phê đen đá', 'ca-phe-den-da', 'Cà phê phin truyền thống, đậm đà, đá mát lạnh.', 25000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 1, 1),
(1, 'Cà phê sữa đá', 'ca-phe-sua-da', 'Cà phê phin hòa quyện cùng sữa đặc béo ngậy.', 29000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600', 1, 1),
(1, 'Bạc xỉu', 'bac-xiu', 'Nhiều sữa, ít cà phê, vị ngọt dịu nhẹ nhàng.', 32000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600', 0, 1),
(1, 'Espresso', 'espresso', 'Cà phê Ý nguyên chất, đậm vị.', 35000, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600', 0, 1),
(1, 'Cappuccino', 'cappuccino', 'Espresso hòa quyện cùng lớp bọt sữa mịn màng.', 45000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600', 1, 1),
(2, 'Trà đào cam sả', 'tra-dao-cam-sa', 'Trà thơm mát kết hợp đào, cam và sả.', 39000, 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600', 1, 1),
(2, 'Trà vải', 'tra-vai', 'Trà thơm hương vải ngọt thanh.', 35000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 0, 1),
(3, 'Trà sữa trân châu', 'tra-sua-tran-chau', 'Trà sữa béo thơm cùng trân châu dẻo dai.', 39000, 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600', 1, 1),
(3, 'Trà sữa matcha', 'tra-sua-matcha', 'Vị matcha Nhật Bản đậm đà, béo ngậy.', 42000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', 0, 1),
(4, 'Nước ép cam', 'nuoc-ep-cam', 'Cam tươi vắt nguyên chất, giàu vitamin C.', 35000, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600', 0, 1),
(4, 'Nước ép dưa hấu', 'nuoc-ep-dua-hau', 'Dưa hấu tươi mát, giải khát tức thì.', 32000, 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600', 0, 1),
(5, 'Bánh tiramisu', 'banh-tiramisu', 'Bánh tiramisu Ý béo mịn, hương cà phê nhẹ.', 45000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 1, 1),
(5, 'Bánh croissant', 'banh-croissant', 'Bánh sừng bò bơ Pháp giòn xốp.', 29000, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 0, 1);

-- ============================================
-- Đơn hàng mẫu
-- ============================================
INSERT INTO orders (customer_name, customer_phone, customer_address, note, payment_method, status, total_amount) VALUES
('Nguyễn Văn A', '0901234567', '123 Đường Lê Lợi, Quận 1, TP.HCM', 'Ít đá', 'cod', 'completed', 68000),
('Trần Thị B', '0912345678', '456 Đường Nguyễn Huệ, Quận 1, TP.HCM', NULL, 'momo', 'pending', 39000);

INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES
(1, 1, 'Cà phê đen đá', 25000, 1, 25000),
(1, 3, 'Bạc xỉu', 32000, 1, 32000),
(1, 13, 'Bánh croissant', 29000, 1, 29000),
(2, 6, 'Trà đào cam sả', 39000, 1, 39000);

-- Cập nhật lại total_amount cho khớp order_items thực tế
UPDATE orders SET total_amount = 86000 WHERE id = 1;
UPDATE orders SET total_amount = 39000 WHERE id = 2;
