-- =====================================================
-- SEED DATA FOR CLUB MANAGEMENT SYSTEM - PostgreSQL
-- Updated: July 18, 2025
-- Ensures data consistency across services with proper foreign keys
-- =====================================================

-- =====================================================
-- AUTH SERVICE SEED DATA (PostgreSQL)
-- Database: club_management_auth
-- =====================================================

-- Insert test users (these IDs will be referenced by other services)
INSERT INTO users (id, email, password_hash, full_name, phone, profile_picture_url, bio, date_of_birth, address, social_links, gender, email_verified, email_verified_at, role, created_at, updated_at) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440001', 'admin@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Nguyễn Văn Admin', '0901234567', 'https://via.placeholder.com/150/admin', 'Quản trị viên hệ thống quản lý câu lạc bộ', '1985-01-15', 'Hà Nội, Việt Nam', '{"facebook": "admin.university", "linkedin": "admin-university"}', 'Nam', true, '2025-01-01 10:00:00', 'admin', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),

-- Club managers
('550e8400-e29b-41d4-a716-446655440002', 'manager.tech@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Trần Thị Minh', '0912345678', 'https://via.placeholder.com/150/tech-manager', 'Trưởng câu lạc bộ Công nghệ', '1995-03-20', 'TP.HCM, Việt Nam', '{"github": "minh-tran", "linkedin": "minh-tran-tech"}', 'Nữ', true, '2025-01-02 09:00:00', 'user', '2025-01-02 09:00:00', '2025-01-02 09:00:00'),

('550e8400-e29b-41d4-a716-446655440003', 'manager.sports@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Lê Văn Thể', '0923456789', 'https://via.placeholder.com/150/sports-manager', 'Huấn luyện viên bóng đá và quản lý CLB thể thao', '1988-07-10', 'Đà Nẵng, Việt Nam', '{"instagram": "coach_le", "facebook": "le.van.the"}', 'Nam', true, '2025-01-03 08:30:00', 'user', '2025-01-03 08:30:00', '2025-01-03 08:30:00'),

('550e8400-e29b-41d4-a716-446655440004', 'manager.arts@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Phạm Thị Hoa', '0934567890', 'https://via.placeholder.com/150/arts-manager', 'Nghệ sĩ và quản lý câu lạc bộ nghệ thuật', '1992-12-05', 'Cần Thơ, Việt Nam', '{"instagram": "artist.hoa", "facebook": "pham.thi.hoa.art"}', 'Nữ', true, '2025-01-04 14:00:00', 'user', '2025-01-04 14:00:00', '2025-01-04 14:00:00'),

-- Regular members
('550e8400-e29b-41d4-a716-446655440005', 'student1@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Nguyễn Thành Đạt', '0945678901', 'https://via.placeholder.com/150/student1', 'Sinh viên năm 3 khoa Công nghệ thông tin', '2002-08-15', 'Hà Nội, Việt Nam', '{"github": "dat-nguyen", "linkedin": "nguyen-thanh-dat"}', 'Nam', true, '2025-01-05 16:30:00', 'user', '2025-01-05 16:30:00', '2025-01-05 16:30:00'),

('550e8400-e29b-41d4-a716-446655440006', 'student2@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Võ Thị Lan', '0956789012', 'https://via.placeholder.com/150/student2', 'Sinh viên năm 2 khoa Kinh tế', '2003-04-22', 'TP.HCM, Việt Nam', '{"facebook": "vo.thi.lan", "instagram": "lan_vo_22"}', 'Nữ', true, '2025-01-06 11:15:00', 'user', '2025-01-06 11:15:00', '2025-01-06 11:15:00'),

('550e8400-e29b-41d4-a716-446655440007', 'student3@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Hoàng Minh Tú', '0967890123', 'https://via.placeholder.com/150/student3', 'Sinh viên năm 4 khoa Nghệ thuật', '2001-11-08', 'Huế, Việt Nam', '{"instagram": "tu_art", "twitter": "hoang_minh_tu"}', 'Nam', true, '2025-01-07 13:45:00', 'user', '2025-01-07 13:45:00', '2025-01-07 13:45:00'),

('550e8400-e29b-41d4-a716-446655440008', 'student4@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Đặng Thị Mai', '0978901234', 'https://via.placeholder.com/150/student4', 'Sinh viên năm 1 khoa Y học', '2004-02-14', 'Nha Trang, Việt Nam', '{"facebook": "dang.thi.mai", "linkedin": "mai-dang-medical"}', 'Nữ', true, '2025-01-08 09:20:00', 'user', '2025-01-08 09:20:00', '2025-01-08 09:20:00'),

('550e8400-e29b-41d4-a716-446655440009', 'student5@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Bùi Văn Hùng', '0989012345', 'https://via.placeholder.com/150/student5', 'Sinh viên năm 3 khoa Thể dục thể thao', '2002-09-30', 'Vũng Tàu, Việt Nam', '{"facebook": "bui.van.hung", "instagram": "hung_fitness"}', 'Nam', true, '2025-01-09 15:10:00', 'user', '2025-01-09 15:10:00', '2025-01-09 15:10:00'),

('550e8400-e29b-41d4-a716-446655440010', 'student6@university.edu', '$2b$12$LQv3c1yqBwUdHR5qVJFzFeUKrPYf3tR3H5QT6x1mBdQJ8YrH6GfNW', 'Lý Thị Thu', '0990123456', 'https://via.placeholder.com/150/student6', 'Sinh viên năm 2 khoa Tâm lý học', '2003-06-18', 'Quy Nhon, Việt Nam', '{"linkedin": "thu-ly-psychology", "twitter": "thu_psychology"}', 'Nữ', true, '2025-01-10 12:25:00', 'user', '2025-01-10 12:25:00', '2025-01-10 12:25:00');

-- Insert refresh tokens for some users
INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, revoked) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'refresh_token_admin_123456789', '2025-08-18 10:00:00', '2025-07-18 10:00:00', false),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'refresh_token_tech_manager_987654321', '2025-08-18 09:00:00', '2025-07-18 09:00:00', false),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'refresh_token_student1_456789123', '2025-08-18 16:30:00', '2025-07-18 16:30:00', false);

-- =====================================================
-- FINANCE SERVICE SEED DATA (PostgreSQL)
-- Database: club_management_finance
-- =====================================================

-- Insert financial transactions (club_id references MongoDB club ObjectIds as strings)
INSERT INTO financial_transactions (id, club_id, user_id, event_id, transaction_type, amount, currency, description, payment_method, payment_gateway_transaction_id, status, transaction_date, created_at, updated_at) VALUES
-- Tech Club contributions
('770e8400-e29b-41d4-a716-446655440001', '64f1a2b3c4d5e6f7g8h9i0j1', '550e8400-e29b-41d4-a716-446655440005', null, 'contribution', 100000.00, 'VND', 'Đóng phí thành viên CLB Công nghệ Q3/2025', 'bank_transfer', 'PAY_TECH_001_20250715', 'completed', '2025-07-15 14:30:00', '2025-07-15 14:30:00', '2025-07-15 14:30:00'),

('770e8400-e29b-41d4-a716-446655440002', '64f1a2b3c4d5e6f7g8h9i0j1', '550e8400-e29b-41d4-a716-446655440006', null, 'contribution', 100000.00, 'VND', 'Đóng phí thành viên CLB Công nghệ Q3/2025', 'momo', 'PAY_TECH_002_20250716', 'completed', '2025-07-16 09:15:00', '2025-07-16 09:15:00', '2025-07-16 09:15:00'),

-- Sports Club event fees
('770e8400-e29b-41d4-a716-446655440003', '64f1a2b3c4d5e6f7g8h9i0j2', '550e8400-e29b-41d4-a716-446655440009', '64f1a2b3c4d5e6f7g8h9i0k1', 'event_fee', 50000.00, 'VND', 'Phí tham gia giải bóng đá sinh viên', 'cash', null, 'completed', '2025-07-17 16:00:00', '2025-07-17 16:00:00', '2025-07-17 16:00:00'),

('770e8400-e29b-41d4-a716-446655440004', '64f1a2b3c4d5e6f7g8h9i0j2', '550e8400-e29b-41d4-a716-446655440007', '64f1a2b3c4d5e6f7g8h9i0k1', 'event_fee', 50000.00, 'VND', 'Phí tham gia giải bóng đá sinh viên', 'bank_transfer', 'PAY_SPORTS_001_20250717', 'completed', '2025-07-17 18:30:00', '2025-07-17 18:30:00', '2025-07-17 18:30:00');

-- Insert budget requests
INSERT INTO budget_requests (id, club_id, event_id, requested_by, amount, currency, description, justification, status, reviewed_by, reviewed_at, review_comments, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '64f1a2b3c4d5e6f7g8h9i0j1', '64f1a2b3c4d5e6f7g8h9i0k2', '550e8400-e29b-41d4-a716-446655440002', 2000000.00, 'VND', 'Ngân sách Hackathon 2025', 'Tổ chức cuộc thi lập trình quy mô lớn cho sinh viên toàn trường', 'approved', '550e8400-e29b-41d4-a716-446655440001', '2025-07-10 10:30:00', 'Đề xuất tốt, phù hợp với mục tiêu phát triển', '2025-07-08 14:20:00', '2025-07-10 10:30:00'),

('880e8400-e29b-41d4-a716-446655440002', '64f1a2b3c4d5e6f7g8h9i0j3', '64f1a2b3c4d5e6f7g8h9i0k3', '550e8400-e29b-41d4-a716-446655440004', 1500000.00, 'VND', 'Ngân sách Triển lãm Nghệ thuật', 'Tổ chức triển lãm tác phẩm sinh viên khoa Nghệ thuật', 'pending', null, null, null, '2025-07-16 11:45:00', '2025-07-16 11:45:00');

-- Insert budget items
INSERT INTO budget_items (id, budget_request_id, item_name, item_description, quantity, unit_price, total_price, category, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Thuê phòng hội thảo', 'Thuê phòng lớn 200 chỗ ngồi trong 2 ngày', 2, 500000.00, 1000000.00, 'venue', '2025-07-08 14:25:00'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Giải thưởng', 'Giải nhất, nhì, ba và khuyến khích', 4, 200000.00, 800000.00, 'prizes', '2025-07-08 14:26:00'),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Đồ ăn nhẹ', 'Cà phê, nước uống và bánh kẹo', 1, 200000.00, 200000.00, 'food', '2025-07-08 14:27:00'),

('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440002', 'Thuê gallery', 'Thuê không gian triển lãm 3 ngày', 3, 300000.00, 900000.00, 'venue', '2025-07-16 11:50:00'),
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Vật liệu trang trí', 'Khung tranh, đèn chiếu sáng, backdrop', 1, 600000.00, 600000.00, 'materials', '2025-07-16 11:51:00');

-- Insert expenses
INSERT INTO expenses (id, club_id, event_id, budget_request_id, spender_id, amount, currency, category, description, receipt_url, expense_date, submitted_at, reviewed_by, reviewed_at, status, reimbursement_method, reimbursed_at, notes, created_at, updated_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '64f1a2b3c4d5e6f7g8h9i0j1', null, null, '550e8400-e29b-41d4-a716-446655440002', 150000.00, 'VND', 'materials', 'Mua dây cáp HDMI và adapter cho thiết bị', 'https://drive.google.com/receipt001', '2025-07-12', '2025-07-12 20:30:00', '550e8400-e29b-41d4-a716-446655440001', '2025-07-13 09:00:00', 'approved', 'bank_transfer', '2025-07-14 14:20:00', 'Hoàn ứng đầy đủ', '2025-07-12 20:30:00', '2025-07-14 14:20:00'),

('aa0e8400-e29b-41d4-a716-446655440002', '64f1a2b3c4d5e6f7g8h9i0j2', '64f1a2b3c4d5e6f7g8h9i0k1', null, '550e8400-e29b-41d4-a716-446655440003', 80000.00, 'VND', 'food', 'Mua nước uống cho đội bóng', 'https://drive.google.com/receipt002', '2025-07-17', '2025-07-17 19:45:00', null, null, 'pending', null, null, null, '2025-07-17 19:45:00', '2025-07-17 19:45:00');

-- Insert club financial summaries
INSERT INTO club_financial_summaries (id, club_id, period_start, period_end, total_income, total_expenses, balance, contributions_count, event_fees_count, expenses_count, pending_expenses_count, last_updated) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '64f1a2b3c4d5e6f7g8h9i0j1', '2025-07-01', '2025-07-31', 200000.00, 150000.00, 50000.00, 2, 0, 1, 0, '2025-07-18 00:00:00'),
('bb0e8400-e29b-41d4-a716-446655440002', '64f1a2b3c4d5e6f7g8h9i0j2', '2025-07-01', '2025-07-31', 100000.00, 80000.00, 20000.00, 0, 2, 1, 1, '2025-07-18 00:00:00'),
('bb0e8400-e29b-41d4-a716-446655440003', '64f1a2b3c4d5e6f7g8h9i0j3', '2025-07-01', '2025-07-31', 0.00, 0.00, 0.00, 0, 0, 0, 0, '2025-07-18 00:00:00');

-- =====================================================
-- NOTIFICATION SERVICE SEED DATA (PostgreSQL)
-- Database: club_management_notify
-- =====================================================

-- Insert notifications
INSERT INTO notifications (id, user_id, type, title, message, data, read_at, sent_via_email, email_sent_at, created_at) VALUES
-- Welcome notifications
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'welcome', 'Chào mừng bạn đến với CLB Công nghệ!', 'Cảm ơn bạn đã tham gia Câu lạc bộ Công nghệ. Hãy khám phá các hoạt động thú vị đang chờ bạn!', '{"club_id": "64f1a2b3c4d5e6f7g8h9i0j1", "membership_id": "membership_001"}', '2025-07-16 10:30:00', true, '2025-07-16 10:31:00', '2025-07-16 10:30:00'),

('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', 'welcome', 'Chào mừng bạn đến với CLB Thể thao!', 'Chào mừng bạn gia nhập đội bóng đá của trường. Hãy sẵn sàng cho những trận đấu sôi động!', '{"club_id": "64f1a2b3c4d5e6f7g8h9i0j2", "membership_id": "membership_002"}', null, true, '2025-07-17 14:20:00', '2025-07-17 14:20:00'),

-- Event notifications
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'event_reminder', 'Nhắc nhở: Hackathon 2025 sắp diễn ra!', 'Sự kiện Hackathon 2025 sẽ bắt đầu vào ngày mai. Đừng quên mang theo laptop và tinh thần sáng tạo nhé!', '{"event_id": "64f1a2b3c4d5e6f7g8h9i0k2", "event_date": "2025-07-20T08:00:00Z"}', null, false, null, '2025-07-19 18:00:00'),

('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'event_registration', 'Đăng ký thành công: Giải bóng đá sinh viên', 'Bạn đã đăng ký thành công tham gia Giải bóng đá sinh viên. Thời gian thi đấu: 20/07/2025 lúc 15:00.', '{"event_id": "64f1a2b3c4d5e6f7g8h9i0k1", "registration_id": "reg_001"}', '2025-07-18 09:15:00', true, '2025-07-18 09:16:00', '2025-07-18 09:15:00'),

-- Budget notifications
('cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'budget_approved', 'Ngân sách Hackathon 2025 đã được duyệt', 'Ngân sách 2,000,000 VND cho sự kiện Hackathon 2025 đã được phê duyệt. Bạn có thể bắt đầu thực hiện kế hoạch.', '{"budget_request_id": "880e8400-e29b-41d4-a716-446655440001", "amount": 2000000, "currency": "VND"}', '2025-07-10 11:00:00', true, '2025-07-10 11:01:00', '2025-07-10 11:00:00'),

-- System notifications
('cc0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'system', 'Báo cáo tài chính tháng 7/2025', 'Báo cáo tài chính chi tiết cho tất cả các câu lạc bộ trong tháng 7/2025 đã sẵn sàng để xem.', '{"report_type": "monthly_financial", "period": "2025-07"}', null, false, null, '2025-07-18 23:59:00');

-- Insert activity posts
INSERT INTO activity_posts (id, club_id, author_id, title, content, attachments, visibility, pinned, created_at, updated_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '64f1a2b3c4d5e6f7g8h9i0j1', '550e8400-e29b-41d4-a716-446655440002', 'Thông báo: Hackathon 2025 - Cuộc thi lập trình lớn nhất năm!', 'Các bạn thành viên thân mến,

CLB Công nghệ hân hạnh thông báo về sự kiện Hackathon 2025 - cuộc thi lập trình quy mô lớn nhất trong năm!

🗓️ Thời gian: 20-21/07/2025
📍 Địa điểm: Phòng hội thảo A.101
🏆 Tổng giải thưởng: 2,000,000 VND

Hãy đăng ký ngay để có cơ hội thể hiện tài năng và nhận giải thưởng hấp dẫn!

#Hackathon2025 #Programming #TechClub', '[{"filename": "hackathon_poster.jpg", "url": "https://drive.google.com/poster001", "type": "image", "size": 1024000}]', 'members', true, '2025-07-15 10:00:00', '2025-07-15 10:00:00'),

('dd0e8400-e29b-41d4-a716-446655440002', '64f1a2b3c4d5e6f7g8h9i0j2', '550e8400-e29b-41d4-a716-446655440003', 'Kết quả thi đấu: Giao hữu bóng đá với trường X', 'Đội bóng CLB Thể thao đã có trận giao hữu thành công với trường X hôm qua.

Kết quả: 3-2 (chiến thắng) 🏆

Đặc biệt cảm ơn các thành viên đã tham gia và cổ vũ nhiệt tình. Tiếp theo chúng ta sẽ có giải đấu chính thức vào cuối tháng.

Ai muốn tham gia đội hình chính thức hãy liên hệ ban quản lý nhé!

#Football #SportsClub #Victory', '[]', 'members', false, '2025-07-16 20:30:00', '2025-07-16 20:30:00'),

('dd0e8400-e29b-41d4-a716-446655440003', '64f1a2b3c4d5e6f7g8h9i0j3', '550e8400-e29b-41d4-a716-446655440004', 'Thông báo tuyển thành viên mới', 'CLB Nghệ thuật đang tuyển thành viên mới cho semester mới!

🎨 Chúng tôi tìm kiếm:
- Sinh viên yêu thích hội họa, nhiếp ảnh
- Có đam mê sáng tạo nghệ thuật
- Tinh thần làm việc nhóm tốt

📅 Hạn đăng ký: 31/07/2025
📋 Cách đăng ký: Điền form online và nộp portfolio

Hãy gia nhập với chúng tôi để cùng tạo nên những tác phẩm nghệ thuật tuyệt vời!', '[{"filename": "recruitment_form.pdf", "url": "https://drive.google.com/form001", "type": "pdf", "size": 256000}]', 'members', true, '2025-07-17 09:00:00', '2025-07-17 09:00:00');

-- Insert activity post interactions
INSERT INTO activity_post_interactions (id, post_id, user_id, interaction_type, comment_text, created_at) VALUES
-- Reactions to Hackathon post
('ee0e8400-e29b-41d4-a716-446655440001', 'dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'like', null, '2025-07-15 10:15:00'),
('ee0e8400-e29b-41d4-a716-446655440002', 'dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'like', null, '2025-07-15 11:30:00'),
('ee0e8400-e29b-41d4-a716-446655440003', 'dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'comment', 'Sự kiện tuyệt vời! Mình đã đăng ký rồi. Cảm ơn CLB đã tổ chức!', '2025-07-15 12:00:00'),
('ee0e8400-e29b-41d4-a716-446655440004', 'dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'comment', 'Có thể tham gia theo team không ạ? Nhóm mình 3 người.', '2025-07-15 14:20:00'),

-- Reactions to Sports post
('ee0e8400-e29b-41d4-a716-446655440005', 'dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', 'like', null, '2025-07-16 20:45:00'),
('ee0e8400-e29b-41d4-a716-446655440006', 'dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'comment', 'Chúc mừng đội! Trận đấu rất hay. Lần sau mình cũng muốn tham gia.', '2025-07-16 21:00:00'),

-- Reactions to Arts recruitment post
('ee0e8400-e29b-41d4-a716-446655440007', 'dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'like', null, '2025-07-17 09:30:00'),
('ee0e8400-e29b-41d4-a716-446655440008', 'dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'comment', 'Mình rất quan tâm! Mình học khoa Y nhưng rất yêu thích nhiếp ảnh. Có được tham gia không ạ?', '2025-07-17 10:15:00'),
('ee0e8400-e29b-41d4-a716-446655440009', 'dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', 'like', null, '2025-07-17 11:45:00');

-- =====================================================
-- DATA CONSISTENCY NOTES
-- =====================================================
-- 1. All user_id references point to existing users in auth service
-- 2. All club_id references use MongoDB ObjectId format as strings
-- 3. All event_id references use MongoDB ObjectId format as strings  
-- 4. Financial data is consistent with club memberships and events
-- 5. Notification data references actual clubs, events and users
-- 6. Activity posts reference actual club managers as authors
-- 7. All timestamps are realistic and in chronological order
-- 8. Vietnamese content reflects the localized nature of the application
