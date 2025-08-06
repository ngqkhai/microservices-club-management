#!/usr/bin/env python3
"""
Enhanced Data Volumes Check
Checks all collections including high priority relationship data
"""

from pymongo import MongoClient
import psycopg2

def check_auth_service():
    """Check auth service data volumes"""
    try:
        conn = psycopg2.connect("postgresql://postgres.rkzyqtmqflkuxbcghkmy:tDUBMmQzQ5ilqlgU@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres")
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
        user_count = cursor.fetchone()[0]
        
        print(f"   [USERS] Users: {user_count}")
        
        # Check user roles if users exist
        if user_count > 0:
            cursor.execute("SELECT role, COUNT(*) FROM users WHERE deleted_at IS NULL GROUP BY role")
            for role, count in cursor.fetchall():
                print(f"      - {role}: {count}")
        
        cursor.close()
        conn.close()
        return user_count
        
    except Exception as e:
        print(f"   [FAILED] Error checking auth service: {e}")
        return 0

def check_club_service():
    """Check club service data volumes including relationships"""
    try:
        client = MongoClient("mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/club_service_db")
        db = client.club_service_db
        
        # Check clubs
        club_count = db.clubs.count_documents({})
        print(f"   [CLUBS]  Clubs: {club_count}")
        
        if club_count > 0:
            categories = db.clubs.distinct("category")
            for cat in categories:
                count = db.clubs.count_documents({"category": cat})
                print(f"      - {cat}: {count}")
        
        # Check memberships
        membership_count = db.memberships.count_documents({})
        print(f"   [USERS] Memberships: {membership_count}")
        
        if membership_count > 0:
            roles = db.memberships.distinct("role")
            for role in roles:
                count = db.memberships.count_documents({"role": role})
                print(f"      - {role}: {count}")
            
            # Active vs inactive memberships
            active_count = db.memberships.count_documents({"status": "active"})
            print(f"      - Active: {active_count}")
        
        # Check recruitment campaigns
        campaign_count = db.recruitment_campaigns.count_documents({})
        print(f"   [CAMPAIGNS] Recruitment Campaigns: {campaign_count}")
        
        if campaign_count > 0:
            statuses = db.recruitment_campaigns.distinct("status")
            for status in statuses:
                count = db.recruitment_campaigns.count_documents({"status": status})
                print(f"      - {status}: {count}")
        
        client.close()
        return club_count + membership_count + campaign_count
        
    except Exception as e:
        print(f"   [FAILED] Error checking club service: {e}")
        return 0

def check_event_service():
    """Check event service data volumes including relationships"""
    try:
        client = MongoClient("mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/event_service_db")
        db = client.event_service_db
        
        # Check events
        event_count = db.events.count_documents({})
        print(f"   [COMPLETED] Events: {event_count}")
        
        if event_count > 0:
            categories = db.events.distinct("category")
            for cat in categories:
                count = db.events.count_documents({"category": cat})
                print(f"      - {cat}: {count}")
        
        # Check registrations
        registration_count = db.registrations.count_documents({})
        print(f"   [REGISTRATIONS] Event Registrations: {registration_count}")
        
        if registration_count > 0:
            statuses = db.registrations.distinct("status")
            for status in statuses:
                count = db.registrations.count_documents({"status": status})
                print(f"      - {status}: {count}")
            
            # Payment statistics
            payment_statuses = db.registrations.distinct("payment_status")
            print(f"      Payment Status:")
            for status in payment_statuses:
                count = db.registrations.count_documents({"payment_status": status})
                print(f"        - {status}: {count}")
        
        # Check event interests
        try:
            interest_count = db.event_interests.count_documents({})
            print(f"   [INTERESTS]  Event Interests: {interest_count}")
        except:
            print(f"   [INTERESTS]  Event Interests: 0 (collection not created)")
        
        # Check event tasks
        try:
            task_count = db.event_tasks.count_documents({})
            print(f"   [TASKS] Event Tasks: {task_count}")
        except:
            print(f"   [TASKS] Event Tasks: 0 (collection not created)")
        
        client.close()
        return event_count + registration_count
        
    except Exception as e:
        print(f"   [FAILED] Error checking event service: {e}")
        return 0

def main():
    print("[CHECK] COMPREHENSIVE DATA VOLUMES CHECK")
    print("=" * 50)
    
    print("[STATS] Services Overview:")
    
    # Check PostgreSQL Auth Service
    print("   [AUTH] PostgreSQL Auth Service:")
    auth_total = check_auth_service()
    
    # Check MongoDB Club Service
    print("   [CLUB SERVICE] MongoDB Club Service:")
    club_total = check_club_service()
    
    # Check MongoDB Event Service
    print("   [EVENTS] MongoDB Event Service:")
    event_total = check_event_service()
    
    # Summary
    total_data_points = auth_total + club_total + event_total
    
    print("\n" + "=" * 50)
    print("[SUMMARY] SUMMARY:")
    print(f"   [AUTH] Auth Service: {auth_total} records")
    print(f"   [CLUB SERVICE] Club Service: {club_total} records")
    print(f"   [EVENTS] Event Service: {event_total} records")
    print(f"   [EVENTS] TOTAL: {total_data_points} records")
    
    # Relationship status
    print("\n[RELATIONSHIPS] RELATIONSHIP STATUS:")
    if club_total > auth_total:  # Has memberships
        print("   [SUCCESS] User-Club relationships: ACTIVE")
    else:
        print("   [FAILED] User-Club relationships: MISSING")
    
    if event_total > 88:  # Has registrations (88 events + registrations)
        print("   [SUCCESS] User-Event relationships: ACTIVE")
    else:
        print("   [FAILED] User-Event relationships: MISSING")
    
    # System readiness
    print("\n[STARTING] SYSTEM READINESS:")
    if total_data_points > 500:
        print("   [SUCCESS] System ready for full testing with comprehensive data")
    elif total_data_points > 200:
        print("   [WARNING]  System has basic data, some relationships may be missing")
    else:
        print("   [FAILED] System needs more data for proper testing")

if __name__ == "__main__":
    main()
