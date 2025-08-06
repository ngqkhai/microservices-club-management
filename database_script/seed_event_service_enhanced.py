#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Event Service Database Seeding Script
Generates comprehensive event data with realistic diversity
"""

import logging
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, BulkWriteError
from bson import ObjectId
import random

# Configuration
MONGODB_URI = "mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/event_service_db?retryWrites=true&w=majority"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def generate_events_data():
    """Generate comprehensive event data"""
    
    # Event templates by category
    tech_events = [
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
            'title': 'Hackathon AI Challenge 2024',
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
            'category': 'Talk',
            'description': 'Các chuyên gia chia sẻ về xu hướng và thách thức trong lĩnh vực an ninh mạng.',
            'short_description': 'Cập nhật xu hướng Cybersecurity mới nhất',
            'requirements': ['Quan tâm đến bảo mật', 'Không yêu cầu kiến thức chuyên sâu'],
            'tags': ['Cybersecurity', 'Information Security', 'Tech Talk'],
            'max_participants': 150,
            'participation_fee': 0
        }
    ]
    
    sports_events = [
        {
            'title': 'Giải bóng đá sinh viên mùa Thu 2024',
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
            'category': 'Event',
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
    ]
    
    cultural_events = [
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
            'title': 'Workshop Múa K-pop',
            'category': 'Workshop',
            'description': 'Học các điệu múa K-pop hot trend từ các bài hát nổi tiếng.',
            'short_description': 'Học múa K-pop cùng bạn bè',
            'requirements': ['Trang phục thoải mái', 'Giày thể thao', 'Tinh thần học hỏi'],
            'tags': ['K-pop', 'Dance', 'Korean Culture', 'Entertainment'],
            'max_participants': 50,
            'participation_fee': 80000
        },
        {
            'title': 'Liên hoan Phim Sinh viên',
            'category': 'Festival',
            'description': 'Chiếu và thảo luận các bộ phim ngắn do sinh viên sản xuất.',
            'short_description': 'Liên hoan phim ngắn sinh viên',
            'requirements': ['Yêu thích điện ảnh', 'Không yêu cầu kinh nghiệm'],
            'tags': ['Film', 'Cinema', 'Student Work', 'Art'],
            'max_participants': 200,
            'participation_fee': 50000
        }
    ]
    
    academic_events = [
        {
            'title': 'Hội thảo Khoa học Quốc tế',
            'category': 'Conference',
            'description': 'Hội thảo khoa học với sự tham gia của các chuyên gia trong và ngoài nước.',
            'short_description': 'Hội thảo khoa học quốc tế',
            'requirements': ['Sinh viên năm 3, 4', 'Có báo cáo nghiên cứu (tùy chọn)'],
            'tags': ['Science', 'Research', 'Academic', 'International'],
            'max_participants': 300,
            'participation_fee': 150000
        },
        {
            'title': 'Olympic Toán học Mở rộng',
            'category': 'Competition',
            'description': 'Cuộc thi toán học cho sinh viên với các bài toán từ cơ bản đến nâng cao.',
            'short_description': 'Cuộc thi Olympic Toán học',
            'requirements': ['Yêu thích toán học', 'Kiến thức toán đại cương', 'Thi cá nhân'],
            'tags': ['Mathematics', 'Olympic', 'Competition', 'Academic'],
            'max_participants': 100,
            'participation_fee': 30000
        },
        {
            'title': 'Workshop Viết luận văn và Nghiên cứu khoa học',
            'category': 'Workshop',
            'description': 'Hướng dẫn kỹ năng viết luận văn, báo cáo khoa học và trình bày nghiên cứu.',
            'short_description': 'Kỹ năng viết luận văn khoa học',
            'requirements': ['Sinh viên năm 3, 4', 'Chuẩn bị làm luận văn'],
            'tags': ['Academic Writing', 'Research', 'Thesis', 'Skills'],
            'max_participants': 60,
            'participation_fee': 100000
        }
    ]
    
    volunteer_events = [
        {
            'title': 'Chiến dịch làm sạch bãi biển',
            'category': 'Volunteer',
            'description': 'Hoạt động tình nguyện làm sạch bãi biển và bảo vệ môi trường biển.',
            'short_description': 'Hoạt động bảo vệ môi trường biển',
            'requirements': ['Mang găng tay và nón', 'Trang phục thoải mái', 'Tinh thần tình nguyện'],
            'tags': ['Environment', 'Volunteer', 'Beach Cleanup', 'Community'],
            'max_participants': 100,
            'participation_fee': 0
        },
        {
            'title': 'Chương trình "Mùa đông ấm áp"',
            'category': 'Volunteer',
            'description': 'Tặng quà và tổ chức hoạt động vui chơi cho trẻ em vùng cao trong mùa đông.',
            'short_description': 'Mang hơi ấm đến trẻ em vùng cao',
            'requirements': ['Tinh thần tình nguyện', 'Có thể đóng góp quà tặng'],
            'tags': ['Charity', 'Children', 'Winter', 'Highland'],
            'max_participants': 80,
            'participation_fee': 0
        },
        {
            'title': 'Ngày hội Hiến máu Nhân đạo',
            'category': 'Volunteer',
            'description': 'Hiến máu tình nguyện cứu người và tuyên truyền về ý nghĩa hiến máu.',
            'short_description': 'Hiến máu cứu người - Nghĩa cử cao đẹp',
            'requirements': ['Tuổi 18-60', 'Sức khỏe tốt', 'Cân nặng trên 45kg'],
            'tags': ['Blood Donation', 'Healthcare', 'Humanitarian', 'Community'],
            'max_participants': 200,
            'participation_fee': 0
        }
    ]
    
    business_events = [
        {
            'title': 'Startup Pitch Competition',
            'category': 'Competition',
            'description': 'Cuộc thi pitch ý tưởng khởi nghiệp với sự đánh giá của các nhà đầu tư.',
            'short_description': 'Cuộc thi pitch startup của sinh viên',
            'requirements': ['Có ý tưởng kinh doanh', 'Làm việc nhóm 2-5 người', 'Chuẩn bị slide thuyết trình'],
            'tags': ['Startup', 'Pitch', 'Business', 'Innovation'],
            'max_participants': 50,
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
            'title': 'Hội thảo Đầu tư Chứng khoán cho Sinh viên',
            'category': 'Seminar',
            'description': 'Hướng dẫn cơ bản về đầu tư chứng khoán, phân tích cổ phiếu và quản lý rủi ro.',
            'short_description': 'Kiến thức đầu tư chứng khoán cơ bản',
            'requirements': ['Quan tâm đến tài chính', 'Không cần kinh nghiệm đầu tư'],
            'tags': ['Investment', 'Stock Market', 'Finance', 'Economics'],
            'max_participants': 120,
            'participation_fee': 50000
        }
    ]
    
    # Combine all event templates
    all_event_templates = tech_events + sports_events + cultural_events + academic_events + volunteer_events + business_events
    
    # Generate multiple events from templates
    events_data = []
    club_ids = [ObjectId() for _ in range(25)]  # 25 different clubs
    organizer_ids = [ObjectId() for _ in range(50)]  # 50 different organizers
    admin_user_id = ObjectId()
    
    # Generate 3-5 events per template to create variety
    for template in all_event_templates:
        for i in range(random.randint(3, 5)):
            club_id = random.choice(club_ids)
            organizer_id = random.choice(organizer_ids)
            
            # Randomize dates
            start_date = datetime.now() + timedelta(days=random.randint(-30, 60))
            duration_hours = random.randint(2, 8)
            end_date = start_date + timedelta(hours=duration_hours)
            reg_deadline = start_date - timedelta(days=random.randint(1, 14))
            
            # Create variations in title
            title_variations = [
                template['title'],
                f"{template['title']} - Lần {i+1}",
                f"{template['title']} {datetime.now().year}",
                f"{template['title']} - Phiên bản {['Cơ bản', 'Nâng cao', 'Chuyên sâu'][i % 3]}"
            ]
            
            # Randomize location
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
                    'coordinates': {'lat': round(21.0 + random.uniform(-0.01, 0.01), 4), 
                                  'lng': round(105.85 + random.uniform(-0.01, 0.01), 4)}
                },
                {
                    'location_type': 'online',
                    'platform': random.choice(['Zoom', 'Google Meet', 'Microsoft Teams']),
                    'meeting_url': f"https://meet.google.com/{random.randint(100000, 999999)}"
                }
            ]
            
            event_data = {
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
                'tags': template['tags'] + [f"Event{random.randint(1, 100)}"],
                'images': [f"https://example.com/events/{template['title'].lower().replace(' ', '-')}-{i+1}.jpg"],
                'agenda': generate_agenda(duration_hours),
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
                'created_by': admin_user_id,
                'current_participants': random.randint(0, template['max_participants']),
                'created_at': datetime.now() - timedelta(days=random.randint(1, 60)),
                'updated_at': datetime.now() - timedelta(days=random.randint(0, 5))
            }
            
            events_data.append(event_data)
    
    return events_data

def generate_agenda(self, duration_hours):
    """Generate realistic agenda based on event duration"""
    agenda = []
    current_time = datetime.strptime("09:00", "%H:%M")
    
    # Common agenda items
    agenda_items = [
        'Đăng ký và check-in',
        'Khai mạc và giới thiệu',
        'Phần thuyết trình chính',
        'Thảo luận và Q&A',
        'Nghỉ giải lao',
        'Workshop thực hành',
        'Chia sẻ kinh nghiệm',
        'Networking',
        'Tổng kết và đóng góp ý kiến',
        'Chụp ảnh lưu niệm'
    ]
    
    num_items = min(duration_hours + 2, len(agenda_items))
    selected_items = random.sample(agenda_items, num_items)
    
    for i, item in enumerate(selected_items):
        time_str = current_time.strftime("%H:%M")
        agenda.append({'time': time_str, 'activity': item})
        current_time += timedelta(minutes=random.randint(30, 90))
    
    return agenda

def seed_events():
    """Seed events collection with enhanced data"""
    
    logging.info("Starting Enhanced Event Service Database Seeding...")
    logging.info("Target: MongoDB Atlas Database")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client.event_service_db
        
        # Test connection
        client.admin.command('ping')
        if db is None:
            raise ConnectionFailure("Failed to connect to database")
        
        logging.info(f"Connected to MongoDB: {client.admin.command('hello')['hosts']}")
        
        # Generate event data
        events_data = generate_events_data()
        logging.info(f"Generated {len(events_data)} events")
        
        # Clear existing data
        logging.info("Clearing existing events...")
        db.events.delete_many({})
        
        # Insert events in batches
        logging.info("Seeding events...")
        batch_size = 50
        for i in range(0, len(events_data), batch_size):
            batch = events_data[i:i + batch_size]
            result = db.events.insert_many(batch)
            logging.info(f"Inserted batch {i//batch_size + 1}: {len(result.inserted_ids)} events")
        
        # Verify data
        total_events = db.events.count_documents({})
        logging.info(f"Total events in database: {total_events}")
        
        # Show events by category
        categories = db.events.distinct("category")
        logging.info("Events by category:")
        for category in categories:
            count = db.events.count_documents({"category": category})
            logging.info(f"   - {category}: {count} events")
        
        # Show events by status
        statuses = db.events.distinct("status")
        logging.info("Events by status:")
        for status in statuses:
            count = db.events.count_documents({"status": status})
            logging.info(f"   - {status}: {count} events")
        
        # Show location types
        pipeline = [
            {"$group": {"_id": "$location.location_type", "count": {"$sum": 1}}}
        ]
        location_stats = list(db.events.aggregate(pipeline))
        logging.info("Events by location type:")
        for stat in location_stats:
            logging.info(f"   - {stat['_id']}: {stat['count']} events")
        
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
        stats = list(db.events.aggregate(pipeline))[0]
        logging.info("Participation statistics:")
        logging.info(f"   - Total event capacity: {stats['total_capacity']} participants")
        logging.info(f"   - Total registrations: {stats['total_registrations']} people")
        logging.info(f"   - Average participation fee: {stats['avg_fee']:,.0f} VND")
        logging.info(f"   - Free events: {stats['free_events']} events")
        
    except ConnectionFailure as e:
        logging.error(f"Database connection failed: {e}")
        return False
    except BulkWriteError as e:
        logging.error(f"Bulk write error: {e.details}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return False
    finally:
        try:
            client.close()
            logging.info("Database connection closed")
        except:
            pass
    
    return True

# Fix the self reference issue
def generate_agenda(duration_hours):
    """Generate realistic agenda based on event duration"""
    agenda = []
    current_time = datetime.strptime("09:00", "%H:%M")
    
    agenda_items = [
        'Đăng ký và check-in',
        'Khai mạc và giới thiệu', 
        'Phần thuyết trình chính',
        'Thảo luận và Q&A',
        'Nghỉ giải lao',
        'Workshop thực hành',
        'Chia sẻ kinh nghiệm',
        'Networking',
        'Tổng kết và đóng góp ý kiến',
        'Chụp ảnh lưu niệm'
    ]
    
    num_items = min(duration_hours + 2, len(agenda_items))
    selected_items = random.sample(agenda_items, num_items)
    
    for item in selected_items:
        time_str = current_time.strftime("%H:%M")
        agenda.append({'time': time_str, 'activity': item})
        current_time += timedelta(minutes=random.randint(30, 90))
    
    return agenda

if __name__ == "__main__":
    success = seed_events()
    if success:
        print("SUCCESS: Enhanced event service completed successfully")
    else:
        print("ERROR: Enhanced event service seeding failed")
