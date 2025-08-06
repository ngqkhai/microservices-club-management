#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced Auth Service Database Seeding Script
Generates comprehensive user data with realistic profiles
"""

import logging
import psycopg2
from datetime import datetime, timedelta
import random
import json

# Configuration
SUPABASE_DB_URL = "postgresql://postgres.rkzyqtmqflkuxbcghkmy:tDUBMmQzQ5ilqlgU@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def generate_users_data():
    """Generate comprehensive user data"""
    
    # Vietnamese names and realistic data
    first_names = [
        'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Vo', 'Vu', 'Dang', 'Bui',
        'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Mai', 'Trinh', 'Luu', 'Cao', 'Truong',
        'Phan', 'Ta', 'Lam', 'Dinh', 'Ton', 'Bach', 'Quach', 'Chau', 'Ong', 'Luc'
    ]
    
    middle_names = [
        'Van', 'Thi', 'Thanh', 'Minh', 'Hoang', 'Duc', 'Quoc', 'Anh', 'Hai', 'Huu',
        'Ngoc', 'Thu', 'Kim', 'Xuan', 'Duy', 'Bao', 'Khanh', 'Lan', 'Linh', 'My'
    ]
    
    last_names = [
        'An', 'Binh', 'Cao', 'Duc', 'Em', 'Giang', 'Hoa', 'Khai', 'Linh', 'Mai',
        'Nam', 'Oanh', 'Phuc', 'Quang', 'Son', 'Tam', 'Uyen', 'Vy', 'Xuan', 'Yen',
        'Bao', 'Chi', 'Dat', 'Huy', 'Khoa', 'Long', 'Nhat', 'Phong', 'Quan', 'Tung'
    ]
    
    departments = [
        'CNTT', 'KTMT', 'KHMT', 'ATTT', 'KTPM', 'TTNT', 'DTPT', 'KTTT', 'CNPM', 'HEHH',
        'KDQT', 'QTKD', 'KTCK', 'TCNH', 'XHKD', 'QLCS', 'TCKT', 'TTQT', 'NVKD', 'QLNN'
    ]
    
    universities = [
        'Đại học Bách khoa Hà Nội',
        'Đại học Quốc gia Hà Nội', 
        'Đại học Kinh tế Quốc dân',
        'Đại học Ngoại thương',
        'Đại học Công nghệ',
        'Đại học Sư phạm Hà Nội',
        'Đại học Y Hà Nội',
        'Đại học Luật Hà Nội'
    ]
    
    interests = [
        'Lập trình', 'Công nghệ', 'Thể thao', 'Âm nhạc', 'Du lịch', 'Đọc sách',
        'Nhiếp ảnh', 'Nấu ăn', 'Phim ảnh', 'Game', 'Nghệ thuật', 'Khoa học',
        'Tình nguyện', 'Kinh doanh', 'Marketing', 'Design', 'Blockchain', 'AI'
    ]
    
    users_data = []
    
    # Generate admin users
    admin_users = [
        {
            'email': 'admin@clubsystem.edu.vn',
            'password_hash': '$2b$12$LQv3c1yqBwdVHdDhzXCZl.j8kF9QzMKlGqE3gOQwHzHzFqZyK9tI2',
            'full_name': 'Nguyen Van Quan',
            'role': 'admin',
            'phone': '+84901000001',
            'profile_picture_url': 'https://example.com/avatars/admin1.jpg',
            'bio': 'Quản trị viên hệ thống quản lý câu lạc bộ sinh viên',
            'date_of_birth': datetime(1990, 1, 15),
            'gender': 'Nam',
            'address': 'Hà Nội, Việt Nam',
            'social_links': json.dumps({'linkedin': 'https://linkedin.com/in/admin-system'}),
            'email_verified': True
        },
        {
            'email': 'clubs.admin@clubsystem.edu.vn', 
            'password_hash': '$2b$12$LQv3c1yqBwdVHdDhzXCZl.j8kF9QzMKlGqE3gOQwHzHzFqZyK9tI2',
            'full_name': 'Tran Thi Linh',
            'role': 'admin',
            'phone': '+84901000002',
            'profile_picture_url': 'https://example.com/avatars/admin2.jpg',
            'bio': 'Quản trị viên phụ trách các hoạt động câu lạc bộ',
            'date_of_birth': datetime(1991, 3, 22),
            'gender': 'Nữ',
            'address': 'Hà Nội, Việt Nam',
            'social_links': json.dumps({'linkedin': 'https://linkedin.com/in/clubs-admin'}),
            'email_verified': True
        }
    ]
    
    users_data.extend(admin_users)
    
    # Generate regular users
    for i in range(1, 101):  # 100 regular users
        first_name = random.choice(first_names)
        middle_name = random.choice(middle_names)
        last_name = random.choice(last_names)
        
        username_base = f"{last_name.lower()}{first_name.lower()}{i:03d}"
        email = f"{username_base}@student.university.edu.vn"
        
        # Random personal data
        birth_year = random.randint(1999, 2005)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        
        year_of_study = random.randint(1, 4)
        department = random.choice(departments)
        university = random.choice(universities)
        gender = random.choice(['Nam', 'Nữ', 'Khác'])
        
        # Generate full name
        full_name = f"{first_name} {middle_name} {last_name}"
        
        # Generate interests (1-4 interests per user)
        user_interests = random.sample(interests, random.randint(1, 4))
        
        # Generate bio
        bio_templates = [
            f"Sinh viên năm {year_of_study} chuyên ngành {department}. Yêu thích {', '.join(user_interests[:2])}.",
            f"Đam mê {user_interests[0]} và các hoạt động {user_interests[1] if len(user_interests) > 1 else 'tình nguyện'}.",
            f"Học {department} tại {university}. Quan tâm đến {', '.join(user_interests)}.",
            f"Sinh viên năm {year_of_study}, thích khám phá {user_interests[0]} và kết bạn.",
            f"Yêu thích học hỏi và tham gia các hoạt động {user_interests[0]} cùng bạn bè."
        ]
        
        # Create social links
        social_links = {
            'facebook': f"https://facebook.com/{username_base}",
            'instagram': f"https://instagram.com/{username_base}"
        }
        if random.random() > 0.7:  # 30% chance to have LinkedIn
            social_links['linkedin'] = f"https://linkedin.com/in/{username_base}"
        
        user_data = {
            'email': email,
            'password_hash': '$2b$12$LQv3c1yqBwdVHdDhzXCZl.j8kF9QzMKlGqE3gOQwHzHzFqZyK9tI2',
            'full_name': full_name,
            'role': 'user',
            'phone': f'+8490{random.randint(1000000, 9999999)}',
            'profile_picture_url': f'https://example.com/avatars/user{i:03d}.jpg',
            'bio': random.choice(bio_templates),
            'date_of_birth': datetime(birth_year, birth_month, birth_day),
            'gender': gender,
            'address': f"Hà Nội, Việt Nam",
            'social_links': json.dumps(social_links),
            'email_verified': random.choice([True, True, True, False])  # 75% verified
        }
        
        users_data.append(user_data)
    
    return users_data

def seed_auth_service():
    """Seed the authentication service with enhanced user data"""
    
    print("Starting Enhanced Auth Service Database Seeding...")
    print("Target: Supabase PostgreSQL Database")
    
    try:
        # Connect to database
        conn = psycopg2.connect(SUPABASE_DB_URL)
        cur = conn.cursor()
        
        print("Connected to Supabase PostgreSQL")
        
        # Clear existing users
        print("Clearing existing users...")
        cur.execute("DELETE FROM users")
        
        # Generate user data
        users_data = generate_users_data()
        print(f"Generated {len(users_data)} users")
        
        # Insert users
        print("Seeding users...")
        insert_query = """
        INSERT INTO users (
            email, password_hash, full_name, role, phone, profile_picture_url,
            bio, date_of_birth, gender, address, social_links, email_verified,
            created_at, updated_at
        ) VALUES (
            %(email)s, %(password_hash)s, %(full_name)s, %(role)s, %(phone)s, %(profile_picture_url)s,
            %(bio)s, %(date_of_birth)s, %(gender)s, %(address)s, %(social_links)s, %(email_verified)s,
            NOW(), NOW()
        )
        """
        
        cur.executemany(insert_query, users_data)
        
        # Commit transaction
        conn.commit()
        print("All data committed successfully")
        
        # Verify data
        cur.execute("SELECT COUNT(*) FROM users")
        total_users = cur.fetchone()[0]
        print(f"Total users in database: {total_users}")
        
        # Show users by role
        cur.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
        role_counts = cur.fetchall()
        print("Users by role:")
        for role, count in role_counts:
            print(f"   - {role}: {count} users")
        
        # Show verification status
        cur.execute("SELECT email_verified, COUNT(*) FROM users GROUP BY email_verified")
        verification_counts = cur.fetchall()
        print("Email verification status:")
        for verified, count in verification_counts:
            status = "Verified" if verified else "Unverified"
            print(f"   - {status}: {count} users")
        
        # Show gender distribution
        cur.execute("SELECT gender, COUNT(*) FROM users WHERE gender IS NOT NULL GROUP BY gender")
        gender_counts = cur.fetchall()
        print("Users by gender:")
        for gender, count in gender_counts:
            print(f"   - {gender}: {count} users")
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        try:
            cur.close()
            conn.close()
            print("Database connection closed")
        except:
            pass
    
    return True

if __name__ == "__main__":
    success = seed_auth_service()
    if success:
        print("SUCCESS: Enhanced auth service completed successfully")
    else:
        print("ERROR: Enhanced auth service seeding failed")
