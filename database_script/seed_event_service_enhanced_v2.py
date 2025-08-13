#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Event Service Database Seeding Script - Version 2
✅ Ensures proper club-event thematic relationships
✅ Uses thematic image generation for realistic, contextual images
✅ Environment-based configuration
✅ Improved event-club category matching
"""

import logging
import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, BulkWriteError
from bson import ObjectId
import psycopg2
import random

# Add utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))

from database_config import db_config
from thematic_image_generator import (
    generate_thematic_event_image_url, 
    generate_thematic_event_logo_url,
    generate_thematic_event_gallery_urls
)

# Logging setup
logging.basicConfig(
    level=getattr(logging, db_config.seeding_config['log_level']),
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def fetch_users():
    """Fetch actual users from PostgreSQL authentication service"""
    try:
        conn = psycopg2.connect(db_config.supabase_url)
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE deleted_at IS NULL")
        users = [{"id": row[0]} for row in cur.fetchall()]
        cur.close()
        conn.close()
        logger.info(f"✅ Retrieved {len(users)} users from PostgreSQL")
        return users
    except Exception as e:
        logger.error(f"❌ Failed to fetch users: {e}")
        return []

def fetch_clubs():
    """Fetch actual clubs from MongoDB club service with full details"""
    try:
        client = MongoClient(db_config.club_db_uri)
        db = client.club_service_db
        clubs_collection = db['clubs']
        
        # Get clubs with all needed information
        clubs = list(clubs_collection.find({}, {
            "_id": 1, 
            "name": 1,
            "category": 1,
            "manager": 1,
            "description": 1
        }))
        
        client.close()
        logger.info(f"✅ Retrieved {len(clubs)} clubs from MongoDB")
        return clubs
    except Exception as e:
        logger.error(f"❌ Failed to fetch clubs: {e}")
        return []

def generate_thematic_events_data():
    """Generate events with proper club-category relationships"""
    
    # Define event templates by club category for perfect matching
    category_event_templates = {
        'Công nghệ': [
            {
                'title': 'Workshop Phát triển Web với React',
                'category': 'Workshop',
                'description': 'Workshop thực hành xây dựng ứng dụng web hiện đại với React, Hook và Context API.',
                'short_description': 'Học React từ cơ bản đến nâng cao qua thực hành',
                'requirements': ['Có kiến thức JavaScript cơ bản', 'Mang laptop cá nhân', 'Cài đặt Node.js và VS Code'],
                'tags': ['React', 'JavaScript', 'Web Development', 'Frontend'],
                'max_participants': 30,
                'participation_fee': 50000
            },
            {
                'title': 'Hackathon AI Challenge',
                'category': 'Competition',
                'description': 'Cuộc thi lập trình 48 giờ với chủ đề Artificial Intelligence và Machine Learning.',
                'short_description': 'Thử thách lập trình AI trong 48 giờ',
                'requirements': ['Kinh nghiệm lập trình Python', 'Hiểu biết cơ bản về AI/ML', 'Làm việc nhóm 2-4 người'],
                'tags': ['AI', 'Machine Learning', 'Python', 'Competition'],
                'max_participants': 100,
                'participation_fee': 200000
            },
            {
                'title': 'Seminar Blockchain và Cryptocurrency',
                'category': 'Seminar',
                'description': 'Tìm hiểu công nghệ Blockchain, DeFi, NFT và tương lai của tiền điện tử.',
                'short_description': 'Khám phá thế giới Blockchain và Crypto',
                'requirements': ['Quan tâm đến công nghệ', 'Không yêu cầu kiến thức trước'],
                'tags': ['Blockchain', 'Cryptocurrency', 'DeFi', 'Technology'],
                'max_participants': 200,
                'participation_fee': 0
            },
            {
                'title': 'Workshop Game Development với Unity',
                'category': 'Workshop',
                'description': 'Học cách tạo game 2D và 3D với Unity Engine từ cơ bản đến nâng cao.',
                'short_description': 'Tạo game đầu tiên với Unity',
                'requirements': ['Kiến thức C# cơ bản', 'Máy tính cài Unity Hub', 'Đam mê game development'],
                'tags': ['Unity', 'Game Development', 'C#', '3D Modeling'],
                'max_participants': 25,
                'participation_fee': 100000
            },
            {
                'title': 'Tech Talk: Tương lai của Cybersecurity',
                'category': 'Seminar',
                'description': 'Các chuyên gia chia sẻ về xu hướng và thách thức trong lĩnh vực an ninh mạng.',
                'short_description': 'Cập nhật xu hướng Cybersecurity mới nhất',
                'requirements': ['Quan tâm đến bảo mật', 'Không yêu cầu kiến thức chuyên sâu'],
                'tags': ['Cybersecurity', 'Information Security', 'Tech Talk'],
                'max_participants': 150,
                'participation_fee': 0
            }
        ],
        'Thể thao': [
            {
                'title': 'Giải bóng đá sinh viên',
                'category': 'Competition',
                'description': 'Giải đấu bóng đá thường niên dành cho sinh viên toàn trường.',
                'short_description': 'Giải bóng đá sinh viên quy mô lớn',
                'requirements': ['Sinh viên trong trường', 'Có kinh nghiệm chơi bóng đá', 'Đăng ký theo đội (11 người)'],
                'tags': ['Football', 'Competition', 'Sports', 'Tournament'],
                'max_participants': 200,
                'participation_fee': 200000
            },
            {
                'title': 'Giải cầu lông mở rộng',
                'category': 'Competition',
                'description': 'Giải cầu lông cho cả nam và nữ với nhiều hạng mục thi đấu.',
                'short_description': 'Giải cầu lông đa hạng mục',
                'requirements': ['Mang vợt cầu lông', 'Giày thể thao chuyên dụng', 'Đăng ký cá nhân hoặc đôi'],
                'tags': ['Badminton', 'Competition', 'Individual Sports'],
                'max_participants': 80,
                'participation_fee': 50000
            },
            {
                'title': 'Marathon Charity Run',
                'category': 'Social',
                'description': 'Chạy marathon từ thiện gây quỹ hỗ trợ trẻ em vùng cao.',
                'short_description': 'Chạy marathon vì cộng đồng',
                'requirements': ['Sức khỏe tốt', 'Đăng ký khám sức khỏe', 'Tinh thần tình nguyện'],
                'tags': ['Marathon', 'Charity', 'Running', 'Community'],
                'max_participants': 500,
                'participation_fee': 100000
            },
            {
                'title': 'Workshop Yoga và Thiền',
                'category': 'Workshop',
                'description': 'Học các bài tập yoga cơ bản và kỹ thuật thiền để giảm stress.',
                'short_description': 'Thư giãn với Yoga và Thiền',
                'requirements': ['Mang thảm tập yoga', 'Trang phục thoải mái', 'Không cần kinh nghiệm'],
                'tags': ['Yoga', 'Meditation', 'Health', 'Wellness'],
                'max_participants': 40,
                'participation_fee': 30000
            }
        ],
        'Văn hóa': [
            {
                'title': 'Đêm nhạc "Những câu chuyện tuổi trẻ"',
                'category': 'Performance',
                'description': 'Đêm nhạc kết hợp nhiều thể loại âm nhạc từ pop, rock đến dân ca.',
                'short_description': 'Đêm nhạc đa dạng thể loại',
                'requirements': ['Mua vé trước', 'Trang phục lịch sự'],
                'tags': ['Music', 'Performance', 'Culture', 'Entertainment'],
                'max_participants': 500,
                'participation_fee': 100000
            },
            {
                'title': 'Triển lãm Nhiếp ảnh Sinh viên',
                'category': 'Exhibition',
                'description': 'Triển lãm ảnh nghệ thuật của sinh viên với chủ đề "Vẻ đẹp Hà Nội".',
                'short_description': 'Triển lãm ảnh nghệ thuật sinh viên',
                'requirements': ['Không yêu cầu đặc biệt', 'Yêu thích nghệ thuật'],
                'tags': ['Photography', 'Art', 'Exhibition', 'Culture'],
                'max_participants': 300,
                'participation_fee': 0
            },
            {
                'title': 'Workshop Múa hiện đại',
                'category': 'Workshop',
                'description': 'Học các động tác múa hiện đại, hip-hop và K-pop dance cơ bản.',
                'short_description': 'Học múa hiện đại và K-pop',
                'requirements': ['Trang phục thể thao', 'Giày sneaker', 'Tinh thần học hỏi'],
                'tags': ['Dance', 'Modern Dance', 'K-pop', 'Performance'],
                'max_participants': 50,
                'participation_fee': 80000
            },
            {
                'title': 'Buổi diễn Kịch nghệ',
                'category': 'Performance',
                'description': 'Buổi diễn kịch của các thành viên câu lạc bộ với các vở kịch nổi tiếng.',
                'short_description': 'Thưởng thức nghệ thuật kịch nghệ',
                'requirements': ['Mua vé trước', 'Đến đúng giờ'],
                'tags': ['Drama', 'Theater', 'Performance', 'Acting'],
                'max_participants': 200,
                'participation_fee': 50000
            }
        ],
        'Học thuật': [
            {
                'title': 'Olympic Toán học sinh viên',
                'category': 'Competition',
                'description': 'Cuộc thi toán học dành cho sinh viên với các bài toán thách thức.',
                'short_description': 'Thách thức trí tuệ với Olympic Toán',
                'requirements': ['Kiến thức toán đại học', 'Tư duy logic tốt', 'Đăng ký cá nhân'],
                'tags': ['Mathematics', 'Competition', 'Academic', 'Problem Solving'],
                'max_participants': 100,
                'participation_fee': 30000
            },
            {
                'title': 'Seminar Nghiên cứu Khoa học',
                'category': 'Seminar',
                'description': 'Chia sẻ các nghiên cứu khoa học mới nhất trong các lĩnh vực khác nhau.',
                'short_description': 'Cập nhật nghiên cứu khoa học mới',
                'requirements': ['Quan tâm nghiên cứu', 'Có thể tham gia thảo luận'],
                'tags': ['Research', 'Science', 'Academic', 'Innovation'],
                'max_participants': 150,
                'participation_fee': 0
            },
            {
                'title': 'Workshop IELTS Speaking',
                'category': 'Workshop',
                'description': 'Luyện tập kỹ năng nói tiếng Anh cho kỳ thi IELTS.',
                'short_description': 'Nâng cao kỹ năng IELTS Speaking',
                'requirements': ['Trình độ tiếng Anh trung bình', 'Mang tài liệu học tập'],
                'tags': ['IELTS', 'English', 'Speaking', 'Language'],
                'max_participants': 30,
                'participation_fee': 150000
            },
            {
                'title': 'Thí nghiệm Vật lý thú vị',
                'category': 'Workshop',
                'description': 'Khám phá các hiện tượng vật lý thông qua thí nghiệm thực tế.',
                'short_description': 'Khám phá vật lý qua thí nghiệm',
                'requirements': ['Quan tâm khoa học', 'Tuân thủ an toàn phòng lab'],
                'tags': ['Physics', 'Experiment', 'Science', 'Discovery'],
                'max_participants': 25,
                'participation_fee': 40000
            }
        ],
        'Tình nguyện': [
            {
                'title': 'Chiến dịch Làm sạch Môi trường',
                'category': 'Social',
                'description': 'Hoạt động dọn dẹp công viên, trồng cây xanh và tuyên truyền bảo vệ môi trường.',
                'short_description': 'Cùng nhau bảo vệ môi trường xanh',
                'requirements': ['Tinh thần tình nguyện', 'Trang phục phù hợp', 'Mang găng tay'],
                'tags': ['Environment', 'Volunteer', 'Green', 'Community'],
                'max_participants': 100,
                'participation_fee': 0
            },
            {
                'title': 'Đêm Từ thiện "Vì trẻ em vùng cao"',
                'category': 'Social',
                'description': 'Buổi gala từ thiện gây quỹ hỗ trợ trẻ em vùng sâu vùng xa.',
                'short_description': 'Gây quỹ từ thiện cho trẻ em',
                'requirements': ['Mua vé tham gia', 'Tinh thần chia sẻ'],
                'tags': ['Charity', 'Children', 'Fundraising', 'Community'],
                'max_participants': 300,
                'participation_fee': 200000
            },
            {
                'title': 'Ngày Hiến máu Nhân đạo',
                'category': 'Social',
                'description': 'Tổ chức hiến máu tình nguyện cứu người và tuyên truyền về hiến máu.',
                'short_description': 'Hiến máu tình nguyện cứu người',
                'requirements': ['Tuổi 18-60', 'Sức khỏe tốt', 'Đã ăn sáng đầy đủ'],
                'tags': ['Blood Donation', 'Health', 'Volunteer', 'Humanitarian'],
                'max_participants': 200,
                'participation_fee': 0
            }
        ],
        'Kinh doanh': [
            {
                'title': 'Startup Pitch Competition',
                'category': 'Competition',
                'description': 'Cuộc thi thuyết trình ý tưởng khởi nghiệp dành cho sinh viên.',
                'short_description': 'Thuyết trình ý tưởng startup',
                'requirements': ['Có ý tưởng kinh doanh', 'Làm việc nhóm 3-5 người', 'Chuẩn bị slide thuyết trình'],
                'tags': ['Startup', 'Pitch', 'Business', 'Entrepreneurship'],
                'max_participants': 60,
                'participation_fee': 100000
            },
            {
                'title': 'Workshop Digital Marketing 2024',
                'category': 'Workshop',
                'description': 'Học các kỹ thuật marketing online, SEO, social media marketing hiện đại.',
                'short_description': 'Kỹ năng Digital Marketing thiết yếu',
                'requirements': ['Mang laptop', 'Quan tâm đến marketing', 'Tài khoản social media'],
                'tags': ['Digital Marketing', 'SEO', 'Social Media', 'Business'],
                'max_participants': 80,
                'participation_fee': 150000
            },
            {
                'title': 'Hội thảo Đầu tư Chứng khoán',
                'category': 'Seminar',
                'description': 'Hướng dẫn cơ bản về đầu tư chứng khoán, phân tích cổ phiếu và quản lý rủi ro.',
                'short_description': 'Kiến thức đầu tư chứng khoán cơ bản',
                'requirements': ['Quan tâm đến tài chính', 'Không cần kinh nghiệm đầu tư'],
                'tags': ['Investment', 'Stock Market', 'Finance', 'Economics'],
                'max_participants': 120,
                'participation_fee': 50000
            }
        ]
    }
    
    # Get actual data
    users = fetch_users()
    clubs = fetch_clubs()
    
    if not users or not clubs:
        logger.error("❌ Cannot proceed without users and clubs data")
        return []
    
    # Group clubs by category
    clubs_by_category = {}
    for club in clubs:
        category = club.get('category', 'Học thuật')
        if category not in clubs_by_category:
            clubs_by_category[category] = []
        clubs_by_category[category].append(club)
    
    logger.info(f"📊 Clubs grouped by category: {dict((k, len(v)) for k, v in clubs_by_category.items())}")
    
    # Generate events with proper relationships
    events_data = []
    user_ids = [user['id'] for user in users]
    
    # Generate events for each category
    for category, event_templates in category_event_templates.items():
        category_clubs = clubs_by_category.get(category, [])
        
        if not category_clubs:
            logger.warning(f"⚠️  No clubs found for category {category}, skipping events")
            continue
        
        logger.info(f"🎯 Generating events for {category} ({len(category_clubs)} clubs, {len(event_templates)} templates)")
        
        # Generate 2-4 events per template for each club in this category
        for club in category_clubs:
            club_id = club['_id']
            club_name = club['name']
            
            # Select 2-3 random templates for this club
            selected_templates = random.sample(event_templates, min(random.randint(2, 3), len(event_templates)))
            
            for template in selected_templates:
                # Generate 1-2 variations of each template
                for variation in range(random.randint(1, 2)):
                    event_id = str(ObjectId())
                    organizer_id = random.choice(user_ids)
                    
                    # Randomize dates (events spread across past and future)
                    start_date = datetime.now() + timedelta(days=random.randint(-60, 90))
                    duration_hours = random.randint(2, 8)
                    end_date = start_date + timedelta(hours=duration_hours)
                    reg_deadline = start_date - timedelta(days=random.randint(1, 14))
                    
                    # Create title variations
                    title_variations = [
                        template['title'],
                        f"{template['title']} - {club_name}",
                        f"{template['title']} {datetime.now().year}",
                        f"{template['title']} - Phiên {variation + 1}"
                    ]
                    
                    # Generate thematic images
                    event_image_url = generate_thematic_event_image_url(
                        event_id, template['title'], template['category'], category
                    )
                    event_logo_url = generate_thematic_event_logo_url(
                        event_id, template['title'], template['category'], category
                    )
                    gallery_urls = generate_thematic_event_gallery_urls(
                        event_id, template['category'], category, random.randint(2, 4)
                    )
                    
                    # Randomize location based on event type
                    locations = [
                        {
                            'location_type': 'physical',
                            'address': random.choice([
                                'Hội trường A, Đại học Bách khoa Hà Nội',
                                'Phòng 301, Tòa nhà C2, ĐHBK Hà Nội',
                                'Sân vận động trường ĐHBK',
                                'Thư viện Tạ Quang Bửu, ĐHBK Hà Nội',
                                'Phòng lab CNTT, Tòa B1'
                            ]),
                            'room': f"Phòng {random.randint(101, 501)}",
                            'coordinates': {
                                'lat': round(21.0 + random.uniform(-0.01, 0.01), 4), 
                                'lng': round(105.85 + random.uniform(-0.01, 0.01), 4)
                            }
                        },
                        {
                            'location_type': 'virtual',
                            'virtual_link': f"https://meet.google.com/{random.randint(100000, 999999)}",
                            'platform': random.choice(['Zoom', 'Google Meet', 'Microsoft Teams'])
                        }
                    ]
                    
                    # Generate agenda
                    agenda = generate_agenda(template['category'], duration_hours)
                    
                    event_data = {
                        '_id': ObjectId(event_id),
                        'club_id': club_id,
                        'title': random.choice(title_variations),
                        'description': template['description'],
                        'short_description': template['short_description'],
                        'category': template['category'],
                        'location': random.choice(locations),
                        'start_date': start_date,
                        'end_date': end_date,
                        'registration_deadline': reg_deadline,
                        'max_participants': template['max_participants'] + random.randint(-10, 20),
                        'participation_fee': template['participation_fee'] + random.randint(-10000, 10000) if template['participation_fee'] > 0 else 0,
                        'currency': 'VND',
                        'requirements': template['requirements'],
                        'tags': template['tags'] + [f"Event{random.randint(1, 100)}", category],
                        
                        # Thematic images
                        'images': gallery_urls,
                        'event_image_url': event_image_url,
                        'event_logo_url': event_logo_url,
                        
                        'agenda': agenda,
                        'contact_info': {
                            'email': f"event{random.randint(1000, 9999)}@bkhn.edu.vn",
                            'phone': f"+8490{random.randint(1000000, 9999999)}"
                        },
                        'social_links': {
                            'facebook': f"https://facebook.com/event{random.randint(1000, 9999)}"
                        },
                        'status': random.choice(['published', 'published', 'published', 'draft', 'cancelled']),
                        'visibility': random.choice(['public', 'public', 'public', 'private']),
                        'organizers': [{
                            'user_id': organizer_id,
                            'role': 'lead_organizer',
                            'joined_at': datetime.now() - timedelta(days=random.randint(1, 30))
                        }],
                        'statistics': {
                            'total_registrations': random.randint(0, template['max_participants']),
                            'total_interested': random.randint(0, template['max_participants'] * 2),
                            'total_attended': 0 if start_date > datetime.now() else random.randint(0, template['max_participants'])
                        },
                        'created_by': random.choice(user_ids),
                        'current_participants': random.randint(0, template['max_participants']),
                        'created_at': datetime.now() - timedelta(days=random.randint(1, 60)),
                        'updated_at': datetime.now() - timedelta(days=random.randint(0, 5))
                    }
                    
                    events_data.append(event_data)
    
    logger.info(f"📝 Generated {len(events_data)} events with proper club-category relationships")
    return events_data

def generate_agenda(event_category, duration_hours):
    """Generate realistic agenda based on event category and duration"""
    agenda = []
    current_time = datetime.strptime("09:00", "%H:%M")
    
    # Category-specific agenda items
    agenda_templates = {
        'Workshop': [
            'Đăng ký và check-in',
            'Giới thiệu và icebreaker',
            'Phần lý thuyết cơ bản',
            'Thực hành hands-on',
            'Nghỉ giải lao',
            'Thực hành nâng cao',
            'Q&A và thảo luận',
            'Tổng kết và chứng nhận'
        ],
        'Competition': [
            'Đăng ký và check-in',
            'Giới thiệu luật thi đấu',
            'Vòng loại',
            'Nghỉ giải lao',
            'Vòng bán kết',
            'Vòng chung kết',
            'Lễ trao giải',
            'Chụp ảnh lưu niệm'
        ],
        'Seminar': [
            'Đăng ký và check-in',
            'Khai mạc và giới thiệu diễn giả',
            'Phần thuyết trình chính',
            'Thảo luận và Q&A',
            'Nghỉ giải lao',
            'Phần chia sẻ kinh nghiệm',
            'Networking',
            'Tổng kết và đánh giá'
        ],
        'Performance': [
            'Chuẩn bị và sound check',
            'Đón khách và check-in',
            'Khai mạc chương trình',
            'Phần biểu diễn chính',
            'Giải lao',
            'Phần biểu diễn đặc biệt',
            'Tương tác với khán giả',
            'Bế mạc và chụp ảnh'
        ],
        'Exhibition': [
            'Chuẩn bị triển lãm',
            'Khai mạc và giới thiệu',
            'Tham quan tự do',
            'Chia sẻ của tác giả',
            'Nghỉ giải lao',
            'Thảo luận và đánh giá',
            'Networking',
            'Bế mạc triển lãm'
        ],
        'Social': [
            'Đăng ký và check-in',
            'Icebreaker games',
            'Hoạt động chính',
            'Nghỉ giải lao và ăn nhẹ',
            'Hoạt động nhóm',
            'Chia sẻ và kết nối',
            'Chụp ảnh nhóm',
            'Tổng kết và hẹn gặp lại'
        ]
    }
    
    # Get appropriate agenda template
    template = agenda_templates.get(event_category, agenda_templates['Workshop'])
    
    # Select items based on duration
    num_items = min(duration_hours + 1, len(template))
    selected_items = template[:num_items]
    
    for i, item in enumerate(selected_items):
        time_str = current_time.strftime("%H:%M")
        agenda.append({'time': time_str, 'activity': item})
        # Add appropriate time intervals
        if i == 0:  # Check-in
            current_time += timedelta(minutes=30)
        elif 'nghỉ' in item.lower() or 'giải lao' in item.lower():
            current_time += timedelta(minutes=15)
        else:
            current_time += timedelta(minutes=random.randint(45, 90))
    
    return agenda

def seed_events():
    """Seed events collection with enhanced thematic data"""
    
    print("🎉 Starting Enhanced Event Service Database Seeding v2...")
    print("🎯 Features: Perfect club-event relationships, thematic images")
    
    try:
        # Connect to MongoDB
        client = MongoClient(db_config.event_db_uri, serverSelectionTimeoutMS=5000)
        db = client.event_service_db
        
        # Test connection
        client.admin.command('ping')
        if db is None:
            raise ConnectionFailure("Failed to connect to database")
        
        logging.info("✅ Connected to MongoDB Event Database")
        
        # Generate event data with proper relationships
        events_data = generate_thematic_events_data()
        if not events_data:
            logging.error("❌ No event data generated")
            return False
            
        logging.info(f"📝 Generated {len(events_data)} events with thematic relationships")
        
        # Clear existing data
        logging.info("🧹 Clearing existing events...")
        db.events.delete_many({})
        
        # Insert events in batches
        logging.info("💾 Seeding events...")
        batch_size = 50
        for i in range(0, len(events_data), batch_size):
            batch = events_data[i:i + batch_size]
            result = db.events.insert_many(batch)
            logging.info(f"✅ Inserted batch {i//batch_size + 1}: {len(result.inserted_ids)} events")
        
        # Verify data
        total_events = db.events.count_documents({})
        logging.info(f"📊 Total events in database: {total_events}")
        
        # Show events by category with sample images
        categories = db.events.distinct("category")
        logging.info("🏷️ Events by category (with thematic images):")
        for category in categories:
            count = db.events.count_documents({"category": category})
            # Get sample event with images
            sample_event = db.events.find_one({"category": category}, {
                "title": 1, 
                "event_image_url": 1, 
                "club_id": 1
            })
            logging.info(f"   - {category}: {count} events")
            if sample_event:
                logging.info(f"     Sample: {sample_event['title']}")
                logging.info(f"     Image: {sample_event.get('event_image_url', 'N/A')}")
        
        # Verify club-event relationships
        pipeline = [
            {"$lookup": {
                "from": "clubs",  # This won't work cross-database, but shows intent
                "localField": "club_id",
                "foreignField": "_id",
                "as": "club_info"
            }},
            {"$group": {
                "_id": "$club_id",
                "event_count": {"$sum": 1},
                "event_categories": {"$addToSet": "$category"}
            }}
        ]
        
        # Show events by status
        statuses = db.events.distinct("status")
        logging.info("📈 Events by status:")
        for status in statuses:
            count = db.events.count_documents({"status": status})
            logging.info(f"   - {status}: {count} events")
        
        # Show participation statistics
        pipeline = [
            {"$group": {
                "_id": None,
                "total_capacity": {"$sum": "$max_participants"},
                "total_registrations": {"$sum": "$statistics.total_registrations"},
                "avg_fee": {"$avg": "$participation_fee"},
                "free_events": {"$sum": {"$cond": [{"$eq": ["$participation_fee", 0]}, 1, 0]}}
            }}
        ]
        stats = list(db.events.aggregate(pipeline))
        if stats:
            stats = stats[0]
            logging.info("📊 Participation statistics:")
            logging.info(f"   - Total event capacity: {stats['total_capacity']} participants")
            logging.info(f"   - Total registrations: {stats['total_registrations']} people")
            logging.info(f"   - Average participation fee: {stats['avg_fee']:,.0f} VND")
            logging.info(f"   - Free events: {stats['free_events']} events")
        
    except ConnectionFailure as e:
        logging.error(f"❌ Database connection failed: {e}")
        return False
    except BulkWriteError as e:
        logging.error(f"❌ Bulk write error: {e.details}")
        return False
    except Exception as e:
        logging.error(f"❌ Unexpected error: {e}")
        return False
    finally:
        try:
            client.close()
            logging.info("🔌 Database connection closed")
        except:
            pass
    
    return True

if __name__ == "__main__":
    success = seed_events()
    if success:
        print("\n🎉 SUCCESS: Enhanced event service v2 completed successfully")
        print("✅ Features:")
        print("   🎯 Perfect club-event category relationships")
        print("   🖼️ Thematic images matching event and club categories")
        print("   📊 Comprehensive event data with realistic details")
        print("   🔧 Environment-based configuration")
    else:
        print("\n❌ ERROR: Enhanced event service v2 seeding failed")
        print("💡 Check your database connectivity and club data")

