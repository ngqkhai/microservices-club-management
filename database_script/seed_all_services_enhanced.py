#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLUB MANAGEMENT SYSTEM - ENHANCED DATABASE SEEDING ORCHESTRATOR
Comprehensive data generation with realistic scale and diversity
"""

import subprocess
import sys
import logging
from datetime import datetime

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def run_seeding_script(script_name, service_name):
    """Run a seeding script and return success status"""
    try:
        logging.info(f"Running {script_name}...")
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=True,
            text=True,
            timeout=600  # Increased timeout for larger datasets
        )
        
        if result.returncode == 0:
            logging.info(f"SUCCESS: {service_name} seeded successfully")
            # Print just the last few lines of output for summary
            output_lines = result.stdout.strip().split('\n')
            summary_lines = output_lines[-10:] if len(output_lines) > 10 else output_lines
            logging.info(f"Summary:\n" + '\n'.join(summary_lines))
            return True
        else:
            logging.error(f"FAILED: {service_name} seeding failed")
            logging.error(f"Error output: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logging.error(f"TIMEOUT: {service_name} seeding timed out")
        return False
    except Exception as e:
        logging.error(f"ERROR: Failed to run {service_name} seeding: {e}")
        return False

def main():
    """Main orchestration function for enhanced seeding"""
    print("[STARTING] CLUB MANAGEMENT SYSTEM - ENHANCED DATABASE SEEDING")
    print("=" * 70)
    print("[EVENTS] COMPREHENSIVE DATA GENERATION")
    print(f"[DATE] Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    print("[STATS] ENHANCED SEEDING PLAN:")
    print("   1. [AUTH] Authentication Service - 100+ realistic users with profiles")
    print("   2. [CLUBS]  Club Service - 25+ diverse clubs across 6 categories") 
    print("   3. [COMPLETED] Event Service - 100+ varied events across all categories")
    print("   4. [SUMMARY] Comprehensive statistics and realistic relationships")
    
    print("\n[CHECK] DATA SCOPE:")
    print("   - Users: ~102 (2 admins + 100 regular users)")
    print("   - Clubs: ~25 (Tech, Sports, Culture, Academic, Volunteer, Business)")
    print("   - Events: ~100+ (Workshops, Competitions, Seminars, Performances)")
    print("   - Realistic Vietnamese names, locations, and scenarios")
    
    # Ask for confirmation
    confirm = input("\n[SUCCESS] Proceed with enhanced seeding? (y/N): ")
    if confirm.lower() != 'y':
        print("[FAILED] Seeding cancelled.")
        return
    
    print("\n[UPDATING] Starting enhanced seeding process...\n")
    
    # Track success/failure
    results = {}
    
    # Step 1: Enhanced Authentication Service
    print("[AUTH] Step 1/3: Enhanced Authentication Service")
    print("=" * 70)
    results['auth'] = run_seeding_script('seed_auth_service_enhanced.py', 'Enhanced Authentication service')
    
    # Step 2: Enhanced Club Service  
    print("\n[CLUBS] Step 2/3: Enhanced Club Service")
    print("=" * 70)
    results['club'] = run_seeding_script('seed_club_service_enhanced.py', 'Enhanced Club service')
    
    # Step 3: Enhanced Event Service
    print("\n[COMPLETED] Step 3/3: Enhanced Event Service")
    print("=" * 70)
    results['event'] = run_seeding_script('seed_event_service_enhanced.py', 'Enhanced Event service')
    
    # Summary
    print("\n" + "=" * 70)
    print("[TASKS] ENHANCED SEEDING SUMMARY")
    print("=" * 70)
    
    successful_services = sum(1 for success in results.values() if success)
    total_services = len(results)
    
    print(f"[EVENTS] Overall Status: {successful_services}/{total_services} services seeded successfully")
    
    status_icons = {'auth': '[AUTH]', 'club': '[CLUBS]', 'event': '[COMPLETED]'}
    for service, success in results.items():
        icon = status_icons.get(service, '[EMOJI]')
        status = "[SUCCESS] SUCCESS" if success else "[FAILED] FAILED"
        service_name = {
            'auth': 'Authentication (Enhanced)',
            'club': 'Club Service (Enhanced)', 
            'event': 'Event Service (Enhanced)'
        }.get(service, service)
        print(f"   {icon} {service_name:<25}: {status}")
    
    print(f"\n[TIMEOUT] Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if successful_services == total_services:
        print("\n[SUCCESS] COMPLETE SUCCESS: All enhanced services seeded successfully!")
        print("\n[STARTING] ENHANCED SYSTEM READY:")
        print("   [STATS] Rich, realistic data across all services")
        print("   [USERS] 100+ diverse user profiles with Vietnamese names")
        print("   [CLUBS]  25+ clubs spanning 6 major categories") 
        print("   [COMPLETED] 100+ events with varied types and schedules")
        print("   [RELATIONSHIPS] Proper relationships and realistic statistics")
        print("\n[EVENTS] Next steps:")
        print("   - Start all microservices")
        print("   - Test API endpoints with rich data")
        print("   - Explore comprehensive analytics")
        print("   - Begin frontend development with realistic data")
    elif successful_services > 0:
        print(f"\n[WARNING]  PARTIAL SUCCESS: {successful_services}/{total_services} services completed")
        print("[INSERTING] Please check the error logs above and retry failed services")
        print("[SUCCESS] Successful services contain enhanced data and are ready to use")
    else:
        print("\n[ERROR] COMPLETE FAILURE: No services were seeded successfully")
        print("[CHECK] Please check the error logs and database connections")
        print("[EMOJI]️  Verify MongoDB and PostgreSQL credentials")
    
    print("\n[EMOJI] Common Issues:")
    print("   - Database connection timeouts")
    print("   - Schema validation errors") 
    print("   - Network connectivity issues")
    print("   - Invalid credentials")
    print("   - Insufficient memory for large datasets")

if __name__ == "__main__":
    main()
