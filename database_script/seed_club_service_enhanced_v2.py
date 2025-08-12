#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Club Service Database Seeding Script - Version 2
✅ Uses thematic image generation for realistic, category-appropriate images
✅ Environment-based configuration
✅ Improved club-category matching
"""

import logging
import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, BulkWriteError
from bson import ObjectId
import random

# Add utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))

from database_config import db_config
from thematic_image_generator import generate_thematic_club_logo_url, generate_thematic_club_cover_url
import psycopg2

# Logging setup
logging.basicConfig(
    level=getattr(logging, db_config.seeding_config['log_level']),
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def get_existing_users():
    """Fetch existing user IDs from PostgreSQL auth service"""
    try:
        conn = psycopg2.connect(db_config.supabase_url)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email,
                   COALESCE(full_name, email) as name
            FROM users
            WHERE deleted_at IS NULL
            ORDER BY created_at
        """)
        
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'email': row[1], 
                'name': row[2]
            })
        
        cursor.close()
        conn.close()
        
        logging.info(f"✅ Retrieved {len(users)} users from PostgreSQL")
        return users
        
    except Exception as e:
        logging.error(f"❌ Error fetching users from PostgreSQL: {e}")
        return []

def generate_clubs_data():
    """Generate comprehensive club data with thematic images"""
    
    # Technology clubs
    tech_clubs = [
        {
            'name': 'CLB Công nghệ Thông tin BKHN',
            'description': 'Câu lạc bộ dành cho sinh viên yêu thích lập trình, AI, và các công nghệ mới. Tổ chức workshop, hackathon và các dự án công nghệ.',
            'category': 'Công nghệ',
            'location': 'Phòng Lab CNTT, Tòa A',
            'contact_email': 'tech.club@bkhn.edu.vn',
            'contact_phone': '+84901234567',
            'member_count': 145
        },
        {
            'name': 'CLB Trí tuệ Nhân tạo',
            'description': 'Nghiên cứu và phát triển các ứng dụng AI, Machine Learning, Deep Learning. Tham gia các cuộc thi quốc tế về AI.',
            'category': 'Công nghệ',
            'location': 'Phòng AI Lab, Tòa B',
            'contact_email': 'ai.club@bkhn.edu.vn',
            'contact_phone': '+84901234568',
            'member_count': 89
        },
        {
            'name': 'CLB Blockchain & Cryptocurrency',
            'description': 'Tìm hiểu công nghệ Blockchain, phát triển DApps, nghiên cứu về cryptocurrency và FinTech.',
            'category': 'Công nghệ',
            'location': 'Phòng Innovation Hub',
            'contact_email': 'blockchain@bkhn.edu.vn',
            'contact_phone': '+84901234569',
            'member_count': 67
        },
        {
            'name': 'CLB Game Development',
            'description': 'Phát triển game indie, học Unity, Unreal Engine, và các công nghệ game development hiện đại.',
            'category': 'Công nghệ',
            'location': 'Phòng Game Lab, Tòa C',
            'contact_email': 'gamedev@bkhn.edu.vn',
            'contact_phone': '+84901234570',
            'member_count': 78
        },
        {
            'name': 'CLB Cyber Security',
            'description': 'Nghiên cứu an toàn thông tin, ethical hacking, penetration testing và bảo mật mạng.',
            'category': 'Công nghệ',
            'location': 'Phòng Security Lab',
            'contact_email': 'cybersec@bkhn.edu.vn',
            'contact_phone': '+84901234571',
            'member_count': 92
        }
    ]
    
    # Sports clubs
    sports_clubs = [
        {
            'name': 'CLB Bóng đá Nam BKHN',
            'description': 'Câu lạc bộ bóng đá nam với đội hình mạnh, thường xuyên tham gia các giải đấu liên trường và quốc gia.',
            'category': 'Thể thao',
            'location': 'Sân bóng đá trường',
            'contact_email': 'football.men@bkhn.edu.vn',
            'contact_phone': '+84901234572',
            'member_count': 156
        },
        {
            'name': 'CLB Bóng đá Nữ BKHN',
            'description': 'Đội bóng đá nữ năng động, tham gia tích cực các giải đấu và hoạt động thể thao nữ.',
            'category': 'Thể thao',
            'location': 'Sân bóng đá trường',
            'contact_email': 'football.women@bkhn.edu.vn',
            'contact_phone': '+84901234573',
            'member_count': 89
        },
        {
            'name': 'CLB Bóng chuyền',
            'description': 'CLB bóng chuyền với cả đội nam và nữ, tham gia các giải đấu trong và ngoài trường.',
            'category': 'Thể thao',
            'location': 'Nhà thi đấu đa năng',
            'contact_email': 'volleyball@bkhn.edu.vn',
            'contact_phone': '+84901234574',
            'member_count': 134
        },
        {
            'name': 'CLB Cầu lông',
            'description': 'Câu lạc bộ cầu lông với nhiều cấp độ từ người mới bắt đầu đến chuyên nghiệp.',
            'category': 'Thể thao',
            'location': 'Sân cầu lông trong nhà',
            'contact_email': 'badminton@bkhn.edu.vn',
            'contact_phone': '+84901234575',
            'member_count': 167
        },
        {
            'name': 'CLB Bóng rổ',
            'description': 'CLB bóng rổ năng động, tổ chức các trận đấu giao hữu và tham gia giải đấu liên trường.',
            'category': 'Thể thao',
            'location': 'Sân bóng rổ ngoài trời',
            'contact_email': 'basketball@bkhn.edu.vn',
            'contact_phone': '+84901234576',
            'member_count': 98
        },
        {
            'name': 'CLB Taekwondo',
            'description': 'Luyện tập võ thuật Taekwondo, tham gia thi đấu và biểu diễn trong các sự kiện trường.',
            'category': 'Thể thao',
            'location': 'Phòng tập võ',
            'contact_email': 'taekwondo@bkhn.edu.vn',
            'contact_phone': '+84901234577',
            'member_count': 76
        }
    ]
    
    # Cultural clubs
    cultural_clubs = [
        {
            'name': 'CLB Âm nhạc BKHN',
            'description': 'Câu lạc bộ âm nhạc đa dạng thể loại, từ nhạc cổ điển, pop đến rock và electronic.',
            'category': 'Văn hóa',
            'location': 'Phòng âm nhạc, Tòa văn hóa',
            'contact_email': 'music@bkhn.edu.vn',
            'contact_phone': '+84901234578',
            'member_count': 123
        },
        {
            'name': 'CLB Múa hiện đại',
            'description': 'Múa hiện đại, hip-hop, K-pop dance và các thể loại múa đương đại khác.',
            'category': 'Văn hóa',
            'location': 'Phòng tập múa',
            'contact_email': 'dance@bkhn.edu.vn',
            'contact_phone': '+84901234579',
            'member_count': 145
        },
        {
            'name': 'CLB Kịch nghệ',
            'description': 'Sân chơi cho những người yêu thích diễn xuất, kịch nói, và nghệ thuật sân khấu.',
            'category': 'Văn hóa',
            'location': 'Hội trường lớn',
            'contact_email': 'drama@bkhn.edu.vn',
            'contact_phone': '+84901234580',
            'member_count': 87
        },
        {
            'name': 'CLB Nhiếp ảnh',
            'description': 'Đam mê chụp ảnh, chỉnh sửa ảnh, và khám phá vẻ đẹp qua ống kính máy ảnh.',
            'category': 'Văn hóa',
            'location': 'Studio nhiếp ảnh',
            'contact_email': 'photography@bkhn.edu.vn',
            'contact_phone': '+84901234581',
            'member_count': 156
        },
        {
            'name': 'CLB Văn học',
            'description': 'Yêu thích văn học, thơ ca, sáng tác và chia sẻ những tác phẩm văn học.',
            'category': 'Văn hóa',
            'location': 'Phòng đọc sách',
            'contact_email': 'literature@bkhn.edu.vn',
            'contact_phone': '+84901234582',
            'member_count': 67
        }
    ]
    
    # Academic clubs
    academic_clubs = [
        {
            'name': 'CLB Toán học',
            'description': 'Nghiên cứu toán học, giải toán olympic và ứng dụng toán học trong thực tế.',
            'category': 'Học thuật',
            'location': 'Phòng Toán, Tòa A',
            'contact_email': 'math@bkhn.edu.vn',
            'contact_phone': '+84901234583',
            'member_count': 89
        },
        {
            'name': 'CLB Vật lý',
            'description': 'Thí nghiệm vật lý, nghiên cứu khoa học và tham gia các cuộc thi vật lý.',
            'category': 'Học thuật',
            'location': 'Phòng thí nghiệm Vật lý',
            'contact_email': 'physics@bkhn.edu.vn',
            'contact_phone': '+84901234584',
            'member_count': 78
        },
        {
            'name': 'CLB Hóa học',
            'description': 'Thí nghiệm hóa học, nghiên cứu hóa học ứng dụng và an toàn phòng thí nghiệm.',
            'category': 'Học thuật',
            'location': 'Phòng thí nghiệm Hóa học',
            'contact_email': 'chemistry@bkhn.edu.vn',
            'contact_phone': '+84901234585',
            'member_count': 92
        },
        {
            'name': 'CLB Tiếng Anh',
            'description': 'Luyện tập tiếng Anh, IELTS, TOEFL và giao lưu với sinh viên quốc tế.',
            'category': 'Học thuật',
            'location': 'Phòng ngoại ngữ',
            'contact_email': 'english@bkhn.edu.vn',
            'contact_phone': '+84901234586',
            'member_count': 201
        }
    ]
    
    # Volunteer clubs
    volunteer_clubs = [
        {
            'name': 'CLB Tình nguyện Xanh',
            'description': 'Tập trung vào các hoạt động bảo vệ môi trường, làm sạch bãi biển, trồng cây xanh.',
            'category': 'Tình nguyện',
            'location': 'Phòng Đoàn Thanh niên',
            'contact_email': 'green@bkhn.edu.vn',
            'contact_phone': '+84901234587',
            'member_count': 178
        },
        {
            'name': 'CLB Từ thiện Nhân ái',
            'description': 'Hoạt động từ thiện, hỗ trợ trẻ em vùng sâu vùng xa, người già neo đơn.',
            'category': 'Tình nguyện',
            'location': 'Phòng hoạt động xã hội',
            'contact_email': 'charity@bkhn.edu.vn',
            'contact_phone': '+84901234588',
            'member_count': 234
        },
        {
            'name': 'CLB Hiến máu Nhân đạo',
            'description': 'Tổ chức các đợt hiến máu tình nguyện, tuyên truyền về hiến máu cứu người.',
            'category': 'Tình nguyện',
            'location': 'Trung tâm y tế',
            'contact_email': 'blooddonate@bkhn.edu.vn',
            'contact_phone': '+84901234589',
            'member_count': 156
        }
    ]
    
    # Business clubs
    business_clubs = [
        {
            'name': 'CLB Khởi nghiệp BKHN',
            'description': 'Hỗ trợ sinh viên khởi nghiệp, tìm hiểu về startup, pitch idea và networking.',
            'category': 'Kinh doanh',
            'location': 'Innovation Hub',
            'contact_email': 'startup@bkhn.edu.vn',
            'contact_phone': '+84901234590',
            'member_count': 167
        },
        {
            'name': 'CLB Marketing & Brand',
            'description': 'Học hỏi về marketing, branding, social media marketing và digital marketing.',
            'category': 'Kinh doanh',
            'location': 'Phòng Marketing Lab',
            'contact_email': 'marketing@bkhn.edu.vn',
            'contact_phone': '+84901234591',
            'member_count': 134
        },
        {
            'name': 'CLB Đầu tư Chứng khoán',
            'description': 'Tìm hiểu về thị trường chứng khoán, phân tích tài chính và đầu tư thông minh.',
            'category': 'Kinh doanh',
            'location': 'Phòng Tài chính',
            'contact_email': 'investment@bkhn.edu.vn',
            'contact_phone': '+84901234592',
            'member_count': 89
        }
    ]
    
    # Combine all clubs
    all_clubs = tech_clubs + sports_clubs + cultural_clubs + academic_clubs + volunteer_clubs + business_clubs
    
    # Get actual users from auth service
    users = get_existing_users()
    if not users:
        logging.error("❌ No users found in auth service. Please seed users first.")
        return []
    
    # Select admin/manager users to create clubs
    admin_users = [user for user in users if 'admin' in user['email'].lower()]
    if not admin_users:
        # If no admin users, use first few regular users as club creators
        admin_users = users[:10]  # First 10 users can create clubs
    
    logging.info(f"👥 Using {len(admin_users)} users as club creators")
    
    clubs_data = []
    for club in all_clubs:
        # Select a random user as club manager
        manager_user = random.choice(users)
        manager_id = manager_user['id']
        founding_year = random.randint(2020, 2024)
        founding_month = random.randint(1, 12)
        founding_day = random.randint(1, 28)
        
        # Generate club ID for image generation
        club_id = str(ObjectId())
        
        # Generate thematic images based on club category
        logo_url = generate_thematic_club_logo_url(club_id, club['name'], club['category'])
        cover_url = generate_thematic_club_cover_url(club_id, club['name'], club['category'])
        
        club_data = {
            '_id': ObjectId(club_id),  # Use the same ID for consistency
            'name': club['name'],
            'description': club['description'],
            'category': club['category'],
            'location': club['location'],
            'contact_email': club['contact_email'],
            'contact_phone': club['contact_phone'],
            'logo_url': logo_url,
            'cover_url': cover_url,
            'website_url': f"https://{club['contact_email'].split('@')[0]}.bkhn.edu.vn",
            'social_links': {
                'facebook': f"https://facebook.com/{club['contact_email'].split('@')[0]}.bkhn",
                'instagram': f"https://instagram.com/{club['contact_email'].split('@')[0]}_bkhn"
            },
            'status': random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'RECRUITING']),  # 75% active
            'manager': manager_id,
            'created_by': random.choice(admin_users)['id'],  # Using actual user ID from auth service
            'founding_date': datetime(founding_year, founding_month, founding_day),
            'member_count': club['member_count'],
            'created_at': datetime.now() - timedelta(days=random.randint(30, 365)),
            'updated_at': datetime.now()
        }
        clubs_data.append(club_data)
    
    return clubs_data

def seed_clubs():
    """Seed clubs collection with enhanced thematic data"""
    
    print("🏛️ Starting Enhanced Club Service Database Seeding v2...")
    print("🎨 Features: Thematic images, category-appropriate visuals")
    
    try:
        # Connect to MongoDB
        client = MongoClient(db_config.club_db_uri, serverSelectionTimeoutMS=5000)
        db = client.club_service_db
        
        # Test connection
        client.admin.command('ping')
        if db is None:
            raise ConnectionFailure("Failed to connect to database")
        
        logging.info("✅ Connected to MongoDB Club Database")
        
        # Generate club data
        clubs_data = generate_clubs_data()
        if not clubs_data:
            logging.error("❌ No club data generated")
            return False
            
        logging.info(f"📝 Generated {len(clubs_data)} clubs with thematic images")
        
        # Clear existing data
        logging.info("🧹 Clearing existing clubs...")
        db.clubs.delete_many({})
        
        # Insert clubs
        logging.info("💾 Seeding clubs...")
        result = db.clubs.insert_many(clubs_data)
        
        if result.acknowledged:
            logging.info(f"✅ Clubs seeded successfully - {len(result.inserted_ids)} clubs inserted")
            
            # Verify data
            total_clubs = db.clubs.count_documents({})
            logging.info(f"📊 Total clubs in database: {total_clubs}")
            
            # Show clubs by category with image info
            categories = db.clubs.distinct("category")
            logging.info("🏷️ Clubs by category (with thematic images):")
            for category in categories:
                count = db.clubs.count_documents({"category": category})
                # Get sample image URL
                sample_club = db.clubs.find_one({"category": category}, {"name": 1, "logo_url": 1})
                logging.info(f"   - {category}: {count} clubs")
                if sample_club:
                    logging.info(f"     Sample: {sample_club['name']}")
                    logging.info(f"     Logo: {sample_club['logo_url']}")
            
            # Show clubs by status
            statuses = db.clubs.distinct("status")
            logging.info("📈 Clubs by status:")
            for status in statuses:
                count = db.clubs.count_documents({"status": status})
                logging.info(f"   - {status}: {count} clubs")
            
            # Show member statistics
            pipeline = [
                {"$group": {
                    "_id": None,
                    "total_members": {"$sum": "$member_count"},
                    "avg_members": {"$avg": "$member_count"},
                    "max_members": {"$max": "$member_count"},
                    "min_members": {"$min": "$member_count"}
                }}
            ]
            stats = list(db.clubs.aggregate(pipeline))[0]
            logging.info("👥 Member statistics:")
            logging.info(f"   - Total members across all clubs: {stats['total_members']}")
            logging.info(f"   - Average members per club: {stats['avg_members']:.1f}")
            logging.info(f"   - Largest club: {stats['max_members']} members")
            logging.info(f"   - Smallest club: {stats['min_members']} members")
            
        else:
            logging.error("❌ Failed to insert clubs")
            return False
            
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
    success = seed_clubs()
    if success:
        print("\n🎉 SUCCESS: Enhanced club service v2 completed successfully")
        print("✅ Features:")
        print("   🎨 Thematic images based on club categories")
        print("   🖼️ Category-appropriate logos and covers")
        print("   🔧 Environment-based configuration")
        print("   📊 Comprehensive club data with realistic relationships")
    else:
        print("\n❌ ERROR: Enhanced club service v2 seeding failed")
        print("💡 Check your database connectivity and user data")

