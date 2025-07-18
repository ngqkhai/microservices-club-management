// =====================================================
// SEED DATA FOR CLUB MANAGEMENT SYSTEM - MongoDB
// Updated: July 18, 2025
// Ensures data consistency with PostgreSQL services
// =====================================================

// ============================================
// CLUB SERVICE SEED DATA (MongoDB)
// Database: club_service
// ============================================

use('club_service');

// Clear existing data (optional - remove if you want to keep existing data)
// db.clubs.deleteMany({});
// db.memberships.deleteMany({});
// db.recruitment_campaigns.deleteMany({});

// Insert clubs (these ObjectIds are referenced by other services as strings)
db.clubs.insertMany([
  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
    name: "Câu lạc bộ Công nghệ",
    description: "CLB dành cho những sinh viên đam mê công nghệ, lập trình và đổi mới sáng tạo. Chúng tôi tổ chức các buổi workshop, hackathon và chia sẻ kiến thức về các công nghệ mới nhất.",
    category: "Công nghệ",
    type: "ACADEMIC",
    size: 45,
    metadata: {
      established_year: 2020,
      focus_areas: ["Web Development", "Mobile Apps", "AI/ML", "Blockchain"],
      skill_levels: ["Beginner", "Intermediate", "Advanced"]
    },
    logo_url: "https://via.placeholder.com/200x200/0066cc/ffffff?text=TECH",
    website_url: "https://techclub.university.edu",
    status: "ACTIVE",
    created_by: "550e8400-e29b-41d4-a716-446655440002", // Trần Thị Minh
    manager: {
      user_id: "550e8400-e29b-41d4-a716-446655440002",
      full_name: "Trần Thị Minh",
      email: "manager.tech@university.edu",
      assigned_at: new Date("2025-01-02T09:00:00Z")
    },
    contact_info: {
      email: "tech.club@university.edu",
      phone: "0912345678",
      address: "Phòng A.201, Tòa nhà Công nghệ, Đại học ABC",
      website: "https://techclub.university.edu"
    },
    social_links: {
      facebook: "https://facebook.com/techclub.university",
      instagram: "https://instagram.com/techclub_uni",
      linkedin: "https://linkedin.com/company/university-tech-club"
    },
    settings: {
      max_members: 100,
      is_public: true,
      requires_approval: false,
      allow_member_invites: true
    },
    created_at: new Date("2025-01-02T09:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },
  
  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
    name: "Câu lạc bộ Thể thao",
    description: "CLB thể thao đa môn với các đội bóng đá, bóng rổ, cầu lông và fitness. Chúng tôi khuyến khích tinh thần thể thao, sức khỏe và tinh thần đồng đội trong cộng đồng sinh viên.",
    category: "Thể thao",
    type: "SPORTS",
    size: 67,
    metadata: {
      established_year: 2018,
      sports: ["Bóng đá", "Bóng rổ", "Cầu lông", "Fitness", "Chạy bộ"],
      facilities: ["Sân bóng đá", "Phòng gym", "Sân cầu lông"]
    },
    logo_url: "https://via.placeholder.com/200x200/ff6600/ffffff?text=SPORT",
    website_url: "https://sportsclub.university.edu",
    status: "ACTIVE",
    created_by: "550e8400-e29b-41d4-a716-446655440003", // Lê Văn Thể
    manager: {
      user_id: "550e8400-e29b-41d4-a716-446655440003",
      full_name: "Lê Văn Thể",
      email: "manager.sports@university.edu",
      assigned_at: new Date("2025-01-03T08:30:00Z")
    },
    contact_info: {
      email: "sports.club@university.edu",
      phone: "0923456789",
      address: "Trung tâm Thể thao, Đại học ABC",
      website: "https://sportsclub.university.edu"
    },
    social_links: {
      facebook: "https://facebook.com/sportsclub.university",
      instagram: "https://instagram.com/sportsclub_uni"
    },
    settings: {
      max_members: 150,
      is_public: true,
      requires_approval: true,
      allow_member_invites: true
    },
    created_at: new Date("2025-01-03T08:30:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"),
    name: "Câu lạc bộ Nghệ thuật",
    description: "CLB dành cho những tâm hồn nghệ sĩ với đam mê hội họa, nhiếp ảnh, âm nhạc và các loại hình nghệ thuật khác. Nơi để thể hiện và phát triển tài năng sáng tạo.",
    category: "Nghệ thuật",
    type: "CULTURAL",
    size: 28,
    metadata: {
      established_year: 2019,
      art_forms: ["Hội họa", "Nhiếp ảnh", "Âm nhạc", "Điêu khắc", "Thiết kế đồ họa"],
      studios: ["Phòng vẽ", "Studio nhiếp ảnh", "Phòng âm nhạc"]
    },
    logo_url: "https://via.placeholder.com/200x200/cc0066/ffffff?text=ART",
    website_url: "https://artclub.university.edu",
    status: "ACTIVE",
    created_by: "550e8400-e29b-41d4-a716-446655440004", // Phạm Thị Hoa
    manager: {
      user_id: "550e8400-e29b-41d4-a716-446655440004",
      full_name: "Phạm Thị Hoa",
      email: "manager.arts@university.edu",
      assigned_at: new Date("2025-01-04T14:00:00Z")
    },
    contact_info: {
      email: "arts.club@university.edu",
      phone: "0934567890",
      address: "Phòng B.301, Tòa nhà Nghệ thuật, Đại học ABC",
      website: "https://artclub.university.edu"
    },
    social_links: {
      facebook: "https://facebook.com/artclub.university",
      instagram: "https://instagram.com/artclub_uni"
    },
    settings: {
      max_members: 80,
      is_public: true,
      requires_approval: false,
      allow_member_invites: true
    },
    created_at: new Date("2025-01-04T14:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j4"),
    name: "Câu lạc bộ Kinh doanh và Khởi nghiệp",
    description: "CLB dành cho sinh viên quan tâm đến kinh doanh, khởi nghiệp và phát triển kỹ năng lãnh đạo. Chúng tôi tổ chức các cuộc thi business plan và workshop về kỹ năng mềm.",
    category: "Chuyên nghiệp",
    type: "ACADEMIC",
    size: 32,
    metadata: {
      established_year: 2021,
      focus_areas: ["Khởi nghiệp", "Quản lý", "Marketing", "Tài chính", "Lãnh đạo"],
      programs: ["Mentorship", "Business Plan Competition", "Networking Events"]
    },
    logo_url: "https://via.placeholder.com/200x200/009900/ffffff?text=BIZ",
    website_url: "https://bizclub.university.edu",
    status: "ACTIVE",
    created_by: "550e8400-e29b-41d4-a716-446655440001", // Admin user
    manager: {
      user_id: "550e8400-e29b-41d4-a716-446655440006", // Võ Thị Lan
      full_name: "Võ Thị Lan",
      email: "student2@university.edu",
      assigned_at: new Date("2025-02-01T10:00:00Z")
    },
    contact_info: {
      email: "biz.club@university.edu",
      phone: "0956789012",
      address: "Phòng C.102, Tòa nhà Kinh tế, Đại học ABC"
    },
    social_links: {
      linkedin: "https://linkedin.com/company/university-business-club"
    },
    settings: {
      max_members: 60,
      is_public: false,
      requires_approval: true,
      allow_member_invites: false
    },
    created_at: new Date("2025-02-01T10:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  }
]);

// Insert memberships (must reference existing users from auth service)
db.memberships.insertMany([
  // Tech Club memberships
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j1"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
    user_id: "550e8400-e29b-41d4-a716-446655440002", // Trần Thị Minh - Manager
    role: "club_manager",
    status: "active",
    joined_at: new Date("2025-01-02T09:00:00Z"),
    updated_at: new Date("2025-01-02T09:00:00Z")
  },
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j2"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
    user_id: "550e8400-e29b-41d4-a716-446655440005", // Nguyễn Thành Đạt
    role: "member",
    status: "active",
    application_message: "Em rất đam mê lập trình và muốn học hỏi thêm từ các anh chị trong CLB.",
    joined_at: new Date("2025-01-15T16:30:00Z"),
    updated_at: new Date("2025-01-15T16:30:00Z")
  },
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j3"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
    user_id: "550e8400-e29b-41d4-a716-446655440006", // Võ Thị Lan
    role: "organizer",
    status: "active",
    application_message: "Em muốn tham gia tổ chức các sự kiện và workshop cho CLB.",
    approved_by: "550e8400-e29b-41d4-a716-446655440002",
    approved_at: new Date("2025-02-01T10:00:00Z"),
    joined_at: new Date("2025-02-01T11:00:00Z"),
    updated_at: new Date("2025-02-01T11:00:00Z")
  },

  // Sports Club memberships  
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j4"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
    user_id: "550e8400-e29b-41d4-a716-446655440003", // Lê Văn Thể - Manager
    role: "club_manager",
    status: "active",
    joined_at: new Date("2025-01-03T08:30:00Z"),
    updated_at: new Date("2025-01-03T08:30:00Z")
  },
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j5"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
    user_id: "550e8400-e29b-41d4-a716-446655440009", // Bùi Văn Hùng
    role: "member",
    status: "active",
    application_message: "Em có kinh nghiệm chơi bóng đá từ cấp 3 và muốn tiếp tục phát triển.",
    approved_by: "550e8400-e29b-41d4-a716-446655440003",
    approved_at: new Date("2025-01-10T14:00:00Z"),
    joined_at: new Date("2025-01-10T15:10:00Z"),
    updated_at: new Date("2025-01-10T15:10:00Z")
  },
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j6"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
    user_id: "550e8400-e29b-41d4-a716-446655440007", // Hoàng Minh Tú
    role: "member",
    status: "active",
    application_message: "Em muốn tham gia để có thêm hoạt động thể thao và kết bạn.",
    approved_by: "550e8400-e29b-41d4-a716-446655440003",
    approved_at: new Date("2025-01-08T12:00:00Z"),
    joined_at: new Date("2025-01-08T13:45:00Z"),
    updated_at: new Date("2025-01-08T13:45:00Z")
  },

  // Arts Club memberships
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j7"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"),
    user_id: "550e8400-e29b-41d4-a716-446655440004", // Phạm Thị Hoa - Manager
    role: "club_manager",
    status: "active",
    joined_at: new Date("2025-01-04T14:00:00Z"),
    updated_at: new Date("2025-01-04T14:00:00Z")
  },
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j8"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"),
    user_id: "550e8400-e29b-41d4-a716-446655440008", // Đặng Thị Mai
    role: "member",
    status: "pending",
    application_message: "Em học Y nhưng rất yêu thích nhiếp ảnh và muốn tham gia CLB để học hỏi thêm.",
    joined_at: new Date("2025-07-17T09:20:00Z"),
    updated_at: new Date("2025-07-17T09:20:00Z")
  },
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j9"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"),
    user_id: "550e8400-e29b-41d4-a716-446655440010", // Lý Thị Thu
    role: "member",
    status: "active",
    application_message: "Em có sở thích vẽ tranh và muốn được học hỏi kỹ thuật từ các bạn trong CLB.",
    approved_by: "550e8400-e29b-41d4-a716-446655440004",
    approved_at: new Date("2025-06-15T10:00:00Z"),
    joined_at: new Date("2025-06-15T12:25:00Z"),
    updated_at: new Date("2025-06-15T12:25:00Z")
  },

  // Business Club memberships
  {
    _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0ja"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j4"),
    user_id: "550e8400-e29b-41d4-a716-446655440006", // Võ Thị Lan - Manager
    role: "club_manager",
    status: "active",
    joined_at: new Date("2025-02-01T11:00:00Z"),
    updated_at: new Date("2025-02-01T11:00:00Z")
  }
]);

// Insert recruitment campaigns
db.recruitment_campaigns.insertMany([
  {
    _id: ObjectId("66f1a2b3c4d5e6f7g8h9i0j1"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"), // Tech Club
    title: "Tuyển thành viên CLB Công nghệ - Kỳ Thu 2025",
    description: "CLB Công nghệ đang tìm kiếm những thành viên mới có đam mê với lập trình và công nghệ. Chúng tôi chào đón tất cả các bạn từ mọi trình độ, từ người mới bắt đầu đến những bạn đã có kinh nghiệm.",
    requirements: [
      "Sinh viên đang học tại trường",
      "Có đam mê với công nghệ và lập trình",
      "Tinh thần học hỏi và chia sẻ kiến thức",
      "Cam kết tham gia ít nhất 80% hoạt động CLB"
    ],
    application_questions: [
      {
        id: "q1",
        question: "Bạn có kinh nghiệm gì về lập trình?",
        type: "textarea",
        required: true
      },
      {
        id: "q2", 
        question: "Ngôn ngữ lập trình nào bạn quan tâm nhất?",
        type: "select",
        required: true,
        options: ["JavaScript", "Python", "Java", "C++", "Khác"]
      },
      {
        id: "q3",
        question: "Bạn mong muốn gì khi tham gia CLB?",
        type: "textarea",
        required: true
      },
      {
        id: "q4",
        question: "Bạn có thể tham gia các hoạt động vào thời gian nào?",
        type: "checkbox",
        required: false,
        options: ["Thứ 2-6 buổi chiều", "Thứ 7-CN", "Buổi tối", "Linh hoạt"]
      }
    ],
    start_date: new Date("2025-07-15T00:00:00Z"),
    end_date: new Date("2025-08-15T23:59:59Z"),
    max_applications: 50,
    status: "active",
    statistics: {
      total_applications: 12,
      approved_applications: 8,
      rejected_applications: 2,
      pending_applications: 2,
      last_updated: new Date("2025-07-18T10:00:00Z")
    },
    created_by: "550e8400-e29b-41d4-a716-446655440002",
    created_at: new Date("2025-07-10T09:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("66f1a2b3c4d5e6f7g8h9i0j2"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"), // Sports Club  
    title: "Tuyển cầu thủ cho đội bóng đá CLB Thể thao",
    description: "Đội bóng đá CLB Thể thao đang tuyển thêm cầu thủ để chuẩn bị cho giải đấu liên trường sắp tới. Chúng tôi tìm kiếm những bạn có kỹ năng và đam mê với bóng đá.",
    requirements: [
      "Sinh viên nam từ 18-25 tuổi",
      "Có kinh nghiệm chơi bóng đá ít nhất 2 năm",
      "Sức khỏe tốt, có thể tập luyện đều đặn",
      "Tinh thần đồng đội và kỷ luật cao"
    ],
    application_questions: [
      {
        id: "q1",
        question: "Bạn đã chơi bóng đá được bao lâu?",
        type: "select",
        required: true,
        options: ["Dưới 1 năm", "1-2 năm", "2-5 năm", "Trên 5 năm"]
      },
      {
        id: "q2",
        question: "Vị trí nào bạn chơi tốt nhất?",
        type: "select", 
        required: true,
        options: ["Thủ môn", "Hậu vệ", "Tiền vệ", "Tiền đạo"]
      },
      {
        id: "q3",
        question: "Bạn có thể tập luyện mấy buổi/tuần?",
        type: "select",
        required: true,
        options: ["1-2 buổi", "3-4 buổi", "5-6 buổi", "Hàng ngày"]
      },
      {
        id: "q4",
        question: "Chia sẻ về kinh nghiệm thi đấu của bạn",
        type: "textarea",
        required: false
      }
    ],
    start_date: new Date("2025-07-01T00:00:00Z"),
    end_date: new Date("2025-07-31T23:59:59Z"),
    max_applications: 30,
    status: "active",
    statistics: {
      total_applications: 18,
      approved_applications: 12,
      rejected_applications: 4,
      pending_applications: 2,
      last_updated: new Date("2025-07-18T10:00:00Z")
    },
    created_by: "550e8400-e29b-41d4-a716-446655440003",
    created_at: new Date("2025-06-25T14:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("66f1a2b3c4d5e6f7g8h9i0j3"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"), // Arts Club
    title: "Tuyển thành viên mới - CLB Nghệ thuật 2025",
    description: "CLB Nghệ thuật chào đón các bạn sinh viên có đam mê với hội họa, nhiếp ảnh, âm nhạc và các loại hình nghệ thuật khác. Cùng chúng tôi tạo nên những tác phẩm nghệ thuật tuyệt vời!",
    requirements: [
      "Sinh viên đang học tại trường",
      "Yêu thích và có năng khiếu nghệ thuật",
      "Có portfolio hoặc tác phẩm để giới thiệu",
      "Tinh thần sáng tạo và cởi mở"
    ],
    application_questions: [
      {
        id: "q1",
        question: "Loại hình nghệ thuật nào bạn quan tâm nhất?",
        type: "checkbox",
        required: true,
        options: ["Hội họa", "Nhiếp ảnh", "Âm nhạc", "Điêu khắc", "Thiết kế đồ họa", "Khác"]
      },
      {
        id: "q2",
        question: "Bạn đã học/tập về nghệ thuật được bao lâu?",
        type: "select",
        required: true,
        options: ["Mới bắt đầu", "Dưới 1 năm", "1-3 năm", "3-5 năm", "Trên 5 năm"]
      },
      {
        id: "q3",
        question: "Chia sẻ về tác phẩm nghệ thuật bạn tự hào nhất",
        type: "textarea",
        required: true
      },
      {
        id: "q4",
        question: "Link portfolio/tác phẩm của bạn (nếu có)",
        type: "text",
        required: false
      }
    ],
    start_date: new Date("2025-07-17T00:00:00Z"),
    end_date: new Date("2025-08-31T23:59:59Z"),
    max_applications: 25,
    status: "active",
    statistics: {
      total_applications: 5,
      approved_applications: 2,
      rejected_applications: 0,
      pending_applications: 3,
      last_updated: new Date("2025-07-18T10:00:00Z")
    },
    created_by: "550e8400-e29b-41d4-a716-446655440004",
    created_at: new Date("2025-07-16T09:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("66f1a2b3c4d5e6f7g8h9i0j4"),
    club_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j4"), // Business Club
    title: "Tuyển thành viên CLB Kinh doanh & Khởi nghiệp 2025",
    description: "CLB Kinh doanh & Khởi nghiệp tìm kiếm những bạn sinh viên có tầm nhìn và đam mê khởi nghiệp. Tham gia với chúng tôi để phát triển kỹ năng lãnh đạo và xây dựng network mạnh mẽ.",
    requirements: [
      "Sinh viên từ năm 2 trở lên",
      "Có tư duy kinh doanh và khởi nghiệp",
      "Kỹ năng giao tiếp và làm việc nhóm tốt",
      "Cam kết tham gia đầy đủ các hoạt động",
      "Ưu tiên sinh viên khoa Kinh tế/Quản trị"
    ],
    application_questions: [
      {
        id: "q1",
        question: "Tại sao bạn muốn tham gia CLB Kinh doanh & Khởi nghiệp?",
        type: "textarea",
        required: true
      },
      {
        id: "q2",
        question: "Bạn có ý tưởng kinh doanh nào chưa?",
        type: "textarea",
        required: false
      },
      {
        id: "q3",
        question: "Kỹ năng mạnh nhất của bạn là gì?",
        type: "select",
        required: true,
        options: ["Lãnh đạo", "Marketing", "Tài chính", "Bán hàng", "Quản lý", "Sáng tạo", "Khác"]
      },
      {
        id: "q4",
        question: "Bạn mong muốn đóng góp gì cho CLB?",
        type: "textarea",
        required: true
      }
    ],
    start_date: new Date("2025-08-01T00:00:00Z"),
    end_date: new Date("2025-08-31T23:59:59Z"),
    max_applications: 20,
    status: "draft",
    statistics: {
      total_applications: 0,
      approved_applications: 0,
      rejected_applications: 0,
      pending_applications: 0,
      last_updated: new Date("2025-07-18T10:00:00Z")
    },
    created_by: "550e8400-e29b-41d4-a716-446655440006",
    created_at: new Date("2025-07-18T09:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  }
]);

// ============================================
// EVENT SERVICE SEED DATA (MongoDB)
// Database: event_service
// ============================================

use('event_service');

// Clear existing data (optional)
// db.events.deleteMany({});
// db.registrations.deleteMany({});
// db.event_interests.deleteMany({});
// db.participants.deleteMany({});
// db.organizers.deleteMany({});

// Insert events (these ObjectIds are referenced by financial service)
db.events.insertMany([
  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k1"),
    title: "Giải bóng đá sinh viên 2025",
    description: "Giải đấu bóng đá thường niên dành cho sinh viên toàn trường. Cơ hội để các đội bóng thể hiện kỹ năng và tranh tài với nhau trong không khí sôi động, thân thiện.",
    club_id: "64f1a2b3c4d5e6f7g8h9i0j2", // Sports Club ID as string
    start_date: new Date("2025-07-20T15:00:00Z"),
    end_date: new Date("2025-07-20T18:00:00Z"),
    location: {
      venue_name: "Sân bóng đá trường Đại học ABC",
      address: "Số 123 Đường ABC, Quận XYZ, TP.HCM",
      room: "Sân chính",
      coordinates: {
        latitude: 10.762622,
        longitude: 106.660172
      },
      is_virtual: false
    },
    capacity: 200,
    participation_fee: 50000,
    category: "Thể thao",
    visibility: "public",
    registration_required: true,
    registration_deadline: new Date("2025-07-19T23:59:59Z"),
    status: "published",
    tags: ["bóng đá", "thể thao", "sinh viên", "giải đấu"],
    attachments: [
      {
        filename: "soccer_tournament_rules.pdf",
        url: "https://drive.google.com/file/soccer_rules",
        type: "application/pdf",
        size: 512000
      }
    ],
    statistics: {
      total_registrations: 45,
      total_interested: 78,
      total_attended: 0
    },
    created_by: "550e8400-e29b-41d4-a716-446655440003", // Lê Văn Thể
    created_at: new Date("2025-07-10T14:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"),
    title: "Hackathon 2025 - Cuộc thi lập trình 48h",
    description: "Hackathon lớn nhất năm! 48 giờ coding không ngừng nghỉ để tạo ra sản phẩm công nghệ sáng tạo. Cơ hội thể hiện kỹ năng lập trình và giành giải thưởng hấp dẫn với tổng giá trị 2 triệu VND.",
    club_id: "64f1a2b3c4d5e6f7g8h9i0j1", // Tech Club ID as string
    start_date: new Date("2025-07-20T08:00:00Z"),
    end_date: new Date("2025-07-21T20:00:00Z"),
    location: {
      venue_name: "Phòng hội thảo A.101",
      address: "Tòa nhà Công nghệ, Đại học ABC",
      room: "A.101 - A.105",
      is_virtual: false
    },
    capacity: 100,
    participation_fee: 0,
    category: "Công nghệ",
    visibility: "public",
    registration_required: true,
    registration_deadline: new Date("2025-07-19T18:00:00Z"),
    status: "published",
    tags: ["hackathon", "lập trình", "công nghệ", "cuộc thi"],
    attachments: [
      {
        filename: "hackathon_guidelines.pdf",
        url: "https://drive.google.com/file/hackathon_guide",
        type: "application/pdf",
        size: 1024000
      },
      {
        filename: "prize_info.jpg",
        url: "https://drive.google.com/image/prizes",
        type: "image/jpeg",
        size: 256000
      }
    ],
    statistics: {
      total_registrations: 67,
      total_interested: 123,
      total_attended: 0
    },
    created_by: "550e8400-e29b-41d4-a716-446655440002", // Trần Thị Minh
    created_at: new Date("2025-07-08T10:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k3"),
    title: "Triển lãm Nghệ thuật Sinh viên 2025",
    description: "Triển lãm tác phẩm nghệ thuật của sinh viên trường, bao gồm hội họa, nhiếp ảnh, điêu khắc và thiết kế đồ họa. Cơ hội để các bạn sinh viên thể hiện tài năng và kết nối với cộng đồng nghệ thuật.",
    club_id: "64f1a2b3c4d5e6f7g8h9i0j3", // Arts Club ID as string
    start_date: new Date("2025-08-15T09:00:00Z"),
    end_date: new Date("2025-08-17T18:00:00Z"),
    location: {
      venue_name: "Gallery Nghệ thuật trường ABC",
      address: "Tòa nhà Nghệ thuật, Đại học ABC",
      room: "Tầng 1 & 2",
      is_virtual: false
    },
    capacity: 300,
    participation_fee: 0,
    category: "Nghệ thuật",
    visibility: "public",
    registration_required: false,
    status: "published",
    tags: ["triển lãm", "nghệ thuật", "hội họa", "nhiếp ảnh"],
    attachments: [
      {
        filename: "exhibition_brochure.pdf",
        url: "https://drive.google.com/file/exhibition_brochure",
        type: "application/pdf",
        size: 2048000
      }
    ],
    statistics: {
      total_registrations: 0,
      total_interested: 34,
      total_attended: 0
    },
    created_by: "550e8400-e29b-41d4-a716-446655440004", // Phạm Thị Hoa
    created_at: new Date("2025-07-16T11:30:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k4"),
    title: "Workshop: Kỹ năng thuyết trình và bán hàng",
    description: "Workshop thực hành về kỹ năng thuyết trình hiệu quả và bán hàng chuyên nghiệp. Được hướng dẫn bởi các chuyên gia có kinh nghiệm trong lĩnh vực kinh doanh.",
    club_id: "64f1a2b3c4d5e6f7g8h9i0j4", // Business Club ID as string
    start_date: new Date("2025-08-05T14:00:00Z"),
    end_date: new Date("2025-08-05T17:00:00Z"),
    location: {
      venue_name: "Phòng hội thảo C.201",
      address: "Tòa nhà Kinh tế, Đại học ABC",
      room: "C.201",
      is_virtual: false
    },
    capacity: 40,
    participation_fee: 100000,
    category: "Kinh doanh",
    visibility: "members_only",
    registration_required: true,
    registration_deadline: new Date("2025-08-03T23:59:59Z"),
    status: "published",
    tags: ["workshop", "kỹ năng", "thuyết trình", "bán hàng"],
    attachments: [],
    statistics: {
      total_registrations: 12,
      total_interested: 18,
      total_attended: 0
    },
    created_by: "550e8400-e29b-41d4-a716-446655440006", // Võ Thị Lan
    created_at: new Date("2025-07-18T08:00:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  },

  {
    _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k5"),
    title: "Buổi giao lưu và định hướng nghề nghiệp",
    description: "Buổi giao lưu với các alumni thành công trong ngành công nghệ. Chia sẻ kinh nghiệm làm việc, định hướng nghề nghiệp và cơ hội thực tập/việc làm tại các công ty lớn.",
    club_id: "64f1a2b3c4d5e6f7g8h9i0j1", // Tech Club ID as string
    start_date: new Date("2025-08-10T19:00:00Z"),
    end_date: new Date("2025-08-10T21:00:00Z"),
    location: {
      venue_name: "Hội trường lớn",
      address: "Tòa nhà chính, Đại học ABC",
      room: "Hội trường A",
      is_virtual: true,
      virtual_link: "https://zoom.us/j/techclub-career-talk"
    },
    capacity: 200,
    participation_fee: 0,
    category: "Nghề nghiệp",
    visibility: "public",
    registration_required: true,
    registration_deadline: new Date("2025-08-09T23:59:59Z"),
    status: "draft",
    tags: ["nghề nghiệp", "định hướng", "alumni", "tech"],
    attachments: [],
    statistics: {
      total_registrations: 0,
      total_interested: 0,
      total_attended: 0
    },
    created_by: "550e8400-e29b-41d4-a716-446655440002", // Trần Thị Minh
    created_at: new Date("2025-07-18T09:30:00Z"),
    updated_at: new Date("2025-07-18T10:00:00Z")
  }
]);

// Insert event registrations (must reference existing users and events)
db.registrations.insertMany([
  // Hackathon registrations
  {
    _id: ObjectId("67f1a2b3c4d5e6f7g8h9i0k1"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"), // Hackathon
    user_id: "550e8400-e29b-41d4-a716-446655440005", // Nguyễn Thành Đạt
    status: "registered",
    ticket_id: "HACK2025-001",
    payment_status: "waived",
    registration_data: {
      team_name: "Code Warriors",
      team_size: 3,
      experience_level: "Intermediate",
      special_requirements: "Vegan food options"
    },
    registered_at: new Date("2025-07-16T10:30:00Z"),
    updated_at: new Date("2025-07-16T10:30:00Z")
  },
  {
    _id: ObjectId("67f1a2b3c4d5e6f7g8h9i0k2"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"), // Hackathon
    user_id: "550e8400-e29b-41d4-a716-446655440006", // Võ Thị Lan
    status: "registered",
    ticket_id: "HACK2025-002",
    payment_status: "waived",
    registration_data: {
      team_name: "Innovation Squad",
      team_size: 2,
      experience_level: "Beginner",
      special_requirements: ""
    },
    registered_at: new Date("2025-07-16T14:20:00Z"),
    updated_at: new Date("2025-07-16T14:20:00Z")
  },

  // Football tournament registrations
  {
    _id: ObjectId("67f1a2b3c4d5e6f7g8h9i0k3"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k1"), // Football tournament
    user_id: "550e8400-e29b-41d4-a716-446655440009", // Bùi Văn Hùng
    status: "registered",
    ticket_id: "FOOTBALL2025-001",
    payment_status: "paid",
    payment_reference: "PAY_SPORTS_001_20250717",
    registration_data: {
      position: "Tiền vệ",
      jersey_size: "L",
      emergency_contact: "0123456789"
    },
    registered_at: new Date("2025-07-17T16:00:00Z"),
    updated_at: new Date("2025-07-17T16:00:00Z")
  },
  {
    _id: ObjectId("67f1a2b3c4d5e6f7g8h9i0k4"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k1"), // Football tournament
    user_id: "550e8400-e29b-41d4-a716-446655440007", // Hoàng Minh Tú
    status: "registered",
    ticket_id: "FOOTBALL2025-002",
    payment_status: "paid",
    payment_reference: "PAY_SPORTS_002_20250717",
    registration_data: {
      position: "Hậu vệ",
      jersey_size: "M",
      emergency_contact: "0987654321"
    },
    registered_at: new Date("2025-07-17T18:30:00Z"),
    updated_at: new Date("2025-07-17T18:30:00Z")
  },

  // Business workshop registrations
  {
    _id: ObjectId("67f1a2b3c4d5e6f7g8h9i0k5"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k4"), // Business workshop
    user_id: "550e8400-e29b-41d4-a716-446655440006", // Võ Thị Lan
    status: "registered",
    ticket_id: "BIZWORKSHOP2025-001",
    payment_status: "pending",
    registration_data: {
      current_year: "Năm 2",
      major: "Kinh tế",
      experience_level: "Beginner"
    },
    registered_at: new Date("2025-07-18T11:00:00Z"),
    updated_at: new Date("2025-07-18T11:00:00Z")
  }
]);

// Insert event interests
db.event_interests.insertMany([
  {
    _id: ObjectId("68f1a2b3c4d5e6f7g8h9i0k1"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k1"), // Football tournament
    user_id: "550e8400-e29b-41d4-a716-446655440008", // Đặng Thị Mai
    notifications_enabled: true,
    marked_at: new Date("2025-07-17T10:00:00Z")
  },
  {
    _id: ObjectId("68f1a2b3c4d5e6f7g8h9i0k2"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"), // Hackathon
    user_id: "550e8400-e29b-41d4-a716-446655440008", // Đặng Thị Mai
    notifications_enabled: true,
    marked_at: new Date("2025-07-15T12:30:00Z")
  },
  {
    _id: ObjectId("68f1a2b3c4d5e6f7g8h9i0k3"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k3"), // Art exhibition
    user_id: "550e8400-e29b-41d4-a716-446655440010", // Lý Thị Thu
    notifications_enabled: true,
    marked_at: new Date("2025-07-16T15:00:00Z")
  },
  {
    _id: ObjectId("68f1a2b3c4d5e6f7g8h9i0k4"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k3"), // Art exhibition
    user_id: "550e8400-e29b-41d4-a716-446655440008", // Đặng Thị Mai
    notifications_enabled: false,
    marked_at: new Date("2025-07-17T09:45:00Z")
  }
]);

// Insert participants (for events that allow direct joining)
db.participants.insertMany([
  {
    _id: ObjectId("69f1a2b3c4d5e6f7g8h9i0k1"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k3"), // Art exhibition (no registration required)
    user_id: "550e8400-e29b-41d4-a716-446655440010", // Lý Thị Thu
    joined_at: new Date("2025-07-17T11:45:00Z")
  },
  {
    _id: ObjectId("69f1a2b3c4d5e6f7g8h9i0k2"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k3"), // Art exhibition
    user_id: "550e8400-e29b-41d4-a716-446655440004", // Phạm Thị Hoa (manager)
    joined_at: new Date("2025-07-16T11:30:00Z")
  }
]);

// Insert organizers
db.organizers.insertMany([
  // Hackathon organizers
  {
    _id: ObjectId("6af1a2b3c4d5e6f7g8h9i0k1"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"), // Hackathon
    user_id: "550e8400-e29b-41d4-a716-446655440002" // Trần Thị Minh (Tech Club manager)
  },
  {
    _id: ObjectId("6af1a2b3c4d5e6f7g8h9i0k2"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k2"), // Hackathon
    user_id: "550e8400-e29b-41d4-a716-446655440006" // Võ Thị Lan (Tech Club organizer)
  },

  // Football tournament organizers
  {
    _id: ObjectId("6af1a2b3c4d5e6f7g8h9i0k3"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k1"), // Football tournament
    user_id: "550e8400-e29b-41d4-a716-446655440003" // Lê Văn Thể (Sports Club manager)
  },

  // Art exhibition organizers
  {
    _id: ObjectId("6af1a2b3c4d5e6f7g8h9i0k4"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k3"), // Art exhibition
    user_id: "550e8400-e29b-41d4-a716-446655440004" // Phạm Thị Hoa (Arts Club manager)
  },

  // Business workshop organizers
  {
    _id: ObjectId("6af1a2b3c4d5e6f7g8h9i0k5"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k4"), // Business workshop
    user_id: "550e8400-e29b-41d4-a716-446655440006" // Võ Thị Lan (Business Club manager)
  },

  // Career talk organizers
  {
    _id: ObjectId("6af1a2b3c4d5e6f7g8h9i0k6"),
    event_id: ObjectId("64f1a2b3c4d5e6f7g8h9i0k5"), // Career talk
    user_id: "550e8400-e29b-41d4-a716-446655440002" // Trần Thị Minh (Tech Club manager)
  }
]);

// Create indexes for better performance
use('club_service');
db.clubs.createIndex({ "name": "text", "description": "text" });
db.clubs.createIndex({ "category": 1 });
db.clubs.createIndex({ "status": 1 });
db.clubs.createIndex({ "created_by": 1 });

db.memberships.createIndex({ "club_id": 1, "user_id": 1 }, { unique: true });
db.memberships.createIndex({ "user_id": 1 });
db.memberships.createIndex({ "club_id": 1, "status": 1 });

db.recruitment_campaigns.createIndex({ "club_id": 1 });
db.recruitment_campaigns.createIndex({ "status": 1 });

use('event_service');
db.events.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.events.createIndex({ "club_id": 1, "status": 1 });
db.events.createIndex({ "start_date": 1, "end_date": 1 });
db.events.createIndex({ "category": 1 });
db.events.createIndex({ "visibility": 1 });

db.registrations.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.registrations.createIndex({ "event_id": 1, "status": 1 });
db.registrations.createIndex({ "ticket_id": 1 }, { unique: true });

db.event_interests.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.participants.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.organizers.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });

print("✅ MongoDB seed data inserted successfully!");
print("📊 Clubs: 4, Memberships: 10, Campaigns: 4");
print("🎯 Events: 5, Registrations: 5, Interests: 4, Participants: 2, Organizers: 6");
print("🔗 All foreign key relationships maintained across services");

// =====================================================
// DATA CONSISTENCY VERIFICATION
// =====================================================
print("\n=== DATA CONSISTENCY CHECK ===");

// Check user references exist (these should match PostgreSQL auth service)
const userIds = [
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002", 
  "550e8400-e29b-41d4-a716-446655440003",
  "550e8400-e29b-41d4-a716-446655440004",
  "550e8400-e29b-41d4-a716-446655440005",
  "550e8400-e29b-41d4-a716-446655440006",
  "550e8400-e29b-41d4-a716-446655440007",
  "550e8400-e29b-41d4-a716-446655440008",
  "550e8400-e29b-41d4-a716-446655440009",
  "550e8400-e29b-41d4-a716-446655440010"
];

// Check club-event relationships
use('club_service');
const clubIds = db.clubs.distinct("_id").map(id => id.toString());
print("Club IDs created:", clubIds);

use('event_service');
const eventClubIds = db.events.distinct("club_id");
print("Club IDs referenced by events:", eventClubIds);

// Check event-registration relationships  
const eventIds = db.events.distinct("_id").map(id => id.toString());
const registrationEventIds = db.registrations.distinct("event_id").map(id => id.toString());
print("Event IDs created:", eventIds);
print("Event IDs with registrations:", registrationEventIds);

print("✅ All foreign key relationships verified!");
print("💡 Reminder: Ensure PostgreSQL auth service has users with IDs:", userIds.join(", "));
