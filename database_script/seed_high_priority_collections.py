#!/usr/bin/env python3
"""
Enhanced High Priority Collections Seeding Script
Seeds the missing high-priority collections:
1. Memberships (club-user relationships)
2. Recruitment Campaigns (club recruitment)
3. Event Registrations (event participation)

Ensures proper ID validation and relationships across services.
"""

import logging
import subprocess
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('seed_high_priority_collections.log'),
        logging.StreamHandler()
    ]
)

def run_seeding_script(script_name, description):
    """Run a seeding script and return success status"""
    try:
        logging.info(f"[STARTING] Starting {description}...")
        
        # Run the script
        result = subprocess.run([
            sys.executable, script_name
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            logging.info(f"[SUCCESS] {description} completed successfully!")
            logging.info(f"Output: {result.stdout}")
            return True
        else:
            logging.error(f"[FAILED] {description} failed!")
            logging.error(f"Error: {result.stderr}")
            logging.error(f"Output: {result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        logging.error(f"[TIMEOUT] {description} timed out after 5 minutes")
        return False
    except Exception as e:
        logging.error(f"[ERROR] Error running {description}: {e}")
        return False

def check_prerequisites():
    """Check if required data exists before seeding relationships"""
    try:
        # Check if users exist (PostgreSQL)
        import psycopg2
        
        conn = psycopg2.connect("postgresql://postgres.rkzyqtmqflkuxbcghkmy:tDUBMmQzQ5ilqlgU@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
        user_count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        if user_count == 0:
            logging.error("No users found. Please seed users first.")
            return False
        
        logging.info(f"Found {user_count} users in PostgreSQL")
        aw88ptr3w9
        # Check if clubs exist (MongoDB)
        from pymongo import MongoClient
        
        client = MongoClient("mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/club_service_db")
        db = client.club_service_db
        club_count = db.clubs.count_documents({})
        client.close()
        
        if club_count == 0:
            logging.error("No clubs found. Please seed clubs first.")
            return False
            
        logging.info(f"Found {club_count} clubs in MongoDB")
        
        # Check if events exist (MongoDB)
        client = MongoClient("mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/event_service_db")
        db = client.event_service_db
        event_count = db.events.count_documents({})
        client.close()
        
        if event_count == 0:
            logging.error("No events found. Please seed events first.")
            return False
            
        logging.info(f"Found {event_count} events in MongoDB")
        
        return True
        
    except Exception as e:
        logging.error(f"Error checking prerequisites: {e}")
        return False

def seed_high_priority_collections():
    """Main function to seed all high priority collections"""
    
    start_time = datetime.now()
    logging.info("=" * 80)
    logging.info("ENHANCED HIGH PRIORITY COLLECTIONS SEEDING")
    logging.info("=" * 80)
    logging.info(f"Started at: {start_time}")
    
    # Check prerequisites
    logging.info("\nChecking prerequisites...")
    if not check_prerequisites():
        logging.error("Prerequisites not met. Aborting seeding process.")
        return False
    
    # Define seeding order and scripts
    seeding_tasks = [
        {
            'script': 'seed_memberships_enhanced.py',
            'description': 'Club Memberships Seeding',
            'emoji': 'MEMBERS',
            'priority': 'HIGH'
        },
        {
            'script': 'seed_recruitment_campaigns_enhanced.py', 
            'description': 'Recruitment Campaigns Seeding',
            'emoji': 'CAMPAIGNS',
            'priority': 'HIGH'
        },
        {
            'script': 'seed_event_registrations_enhanced.py',
            'description': 'Event Registrations Seeding', 
            'emoji': 'REGISTRATIONS',
            'priority': 'HIGH'
        }
    ]
    
    results = {}
    successful_tasks = 0
    total_tasks = len(seeding_tasks)
    
    # Execute seeding tasks
    for i, task in enumerate(seeding_tasks, 1):
        logging.info(f"\n{'='*50}")
        logging.info(f"{task['emoji']} TASK {i}/{total_tasks}: {task['description'].upper()}")
        logging.info(f"Priority: {task['priority']}")
        logging.info(f"{'='*50}")
        
        success = run_seeding_script(task['script'], task['description'])
        results[task['description']] = success
        
        if success:
            successful_tasks += 1
            logging.info(f"[SUCCESS] Task {i} completed successfully!")
        else:
            logging.error(f"[FAILED] Task {i} failed!")
            logging.info("Continuing with next task...")
    
    # Final results
    end_time = datetime.now()
    duration = end_time - start_time
    
    logging.info("\n" + "=" * 80)
    logging.info("[STATS] SEEDING RESULTS SUMMARY")
    logging.info("=" * 80)
    
    logging.info(f"⏱️  Total Duration: {duration}")
    logging.info(f"[SUCCESS] Successful Tasks: {successful_tasks}/{total_tasks}")
    logging.info(f"[FAILED] Failed Tasks: {total_tasks - successful_tasks}/{total_tasks}")
    
    logging.info("\n[TASKS] Task Results:")
    for task_name, success in results.items():
        status = "[SUCCESS] SUCCESS" if success else "[FAILED] FAILED"
        logging.info(f"   {status}: {task_name}")
    
    if successful_tasks == total_tasks:
        logging.info("\n[COMPLETED] ALL HIGH PRIORITY COLLECTIONS SEEDED SUCCESSFULLY!")
        logging.info("[RELATIONSHIPS] The system now has complete relationship data:")
        logging.info("   [USERS] Users <-> Clubs (Memberships)")
        logging.info("   [CAMPAIGNS] Clubs -> Recruitment Campaigns")
        logging.info("   [REGISTRATIONS] Users <-> Events (Registrations)")
        logging.info("\n[READY] The application is now ready for full testing with realistic data!")
        return True
    else:
        logging.warning(f"\n[WARNING]  {total_tasks - successful_tasks} task(s) failed.")
        logging.info("Check individual script logs for details.")
        logging.info("You may need to re-run failed scripts manually.")
        return False

if __name__ == "__main__":
    try:
        success = seed_high_priority_collections()
        
        if success:
            print("\n[COMPLETED] High priority collections seeding completed successfully!")
            print("[STARTING] The system now has comprehensive relationship data!")
        else:
            print("\n[WARNING]  Some seeding tasks failed. Check logs for details.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n[STOPPED] Seeding interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        sys.exit(1)
