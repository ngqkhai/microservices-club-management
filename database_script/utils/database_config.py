#!/usr/bin/env python3
"""
Database Configuration Utility
Handles environment variables and database connections
"""

import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseConfig:
    """Centralized database configuration"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._validate_environment()
    
    @property
    def supabase_url(self) -> str:
        """Get Supabase PostgreSQL URL"""
        url = os.getenv('SUPABASE_DB_URL')
        if not url:
            # Fallback to hardcoded for backward compatibility (with warning)
            self.logger.warning("⚠️  SUPABASE_DB_URL not found in environment, using fallback")
            url = "postgresql://postgres.rkzyqtmqflkuxbcghkmy:tDUBMmQzQ5ilqlgU@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
        return url
    
    @property
    def mongodb_uri(self) -> str:
        """Get MongoDB URI"""
        uri = os.getenv('MONGODB_URI')
        if not uri:
            # Fallback to hardcoded for backward compatibility (with warning)
            self.logger.warning("⚠️  MONGODB_URI not found in environment, using fallback")
            uri = "mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/club_service_db?retryWrites=true&w=majority"
        return uri
    
    @property
    def club_db_uri(self) -> str:
        """Get Club Service MongoDB URI"""
        uri = os.getenv('CLUB_MONGODB_URI')
        if not uri:
            # Use main MongoDB URI with club_service_db
            base_uri = self.mongodb_uri
            if 'club_service_db' in base_uri:
                return base_uri
            else:
                # Replace database name
                return base_uri.replace('/event_service_db', '/club_service_db').replace('?', '?')
        return uri
    
    @property
    def event_db_uri(self) -> str:
        """Get Event Service MongoDB URI"""
        uri = os.getenv('EVENT_MONGODB_URI')
        if not uri:
            # Use main MongoDB URI with event_service_db
            base_uri = self.mongodb_uri
            if 'event_service_db' in base_uri:
                return base_uri
            else:
                # Replace database name
                return base_uri.replace('/club_service_db', '/event_service_db')
        return uri
    
    @property
    def cloudinary_config(self) -> dict:
        """Get Cloudinary configuration"""
        return {
            'cloud_name': os.getenv('CLOUDINARY_CLOUD_NAME', 'djupm4v0l'),
            'api_key': os.getenv('CLOUDINARY_API_KEY', '541197445177598'),
            'api_secret': os.getenv('CLOUDINARY_API_SECRET', 'your_api_secret_here')
        }
    
    @property
    def seeding_config(self) -> dict:
        """Get seeding configuration"""
        return {
            'batch_size': int(os.getenv('SEED_BATCH_SIZE', '100')),
            'timeout_seconds': int(os.getenv('SEED_TIMEOUT_SECONDS', '600')),
            'log_level': os.getenv('LOG_LEVEL', 'INFO'),
            'use_real_images': os.getenv('USE_REAL_IMAGES', 'false').lower() == 'true',
            'use_placeholder_service': os.getenv('USE_PLACEHOLDER_SERVICE', 'true').lower() == 'true'
        }
    
    def _validate_environment(self):
        """Validate environment configuration"""
        missing_vars = []
        
        # Check critical environment variables
        critical_vars = [
            'SUPABASE_DB_URL',
            'MONGODB_URI'
        ]
        
        for var in critical_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            self.logger.warning(f"⚠️  Missing environment variables: {', '.join(missing_vars)}")
            self.logger.warning("⚠️  Using fallback hardcoded values (not recommended for production)")
            self.logger.info("💡 Create a .env file with proper configuration")
    
    def test_connections(self):
        """Test database connections"""
        results = {
            'postgresql': False,
            'mongodb_club': False,
            'mongodb_event': False
        }
        
        # Test PostgreSQL - try both psycopg2 and psycopg3
        try:
            # Try psycopg2 first
            try:
                import psycopg2
                conn = psycopg2.connect(self.supabase_url)
                conn.close()
                results['postgresql'] = True
                self.logger.info("✅ PostgreSQL connection successful (psycopg2)")
            except ImportError:
                # Try psycopg3 if psycopg2 not available
                import psycopg
                conn = psycopg.connect(self.supabase_url)
                conn.close()
                results['postgresql'] = True
                self.logger.info("✅ PostgreSQL connection successful (psycopg3)")
        except Exception as e:
            self.logger.error(f"❌ PostgreSQL connection failed: {e}")
        
        # Test MongoDB Club Service
        try:
            from pymongo import MongoClient
            client = MongoClient(self.club_db_uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            client.close()
            results['mongodb_club'] = True
            self.logger.info("✅ MongoDB Club Service connection successful")
        except Exception as e:
            self.logger.error(f"❌ MongoDB Club Service connection failed: {e}")
        
        # Test MongoDB Event Service
        try:
            from pymongo import MongoClient
            client = MongoClient(self.event_db_uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            client.close()
            results['mongodb_event'] = True
            self.logger.info("✅ MongoDB Event Service connection successful")
        except Exception as e:
            self.logger.error(f"❌ MongoDB Event Service connection failed: {e}")
        
        return results


# Global configuration instance
db_config = DatabaseConfig()


# Convenience functions for backward compatibility
def get_supabase_url() -> str:
    return db_config.supabase_url


def get_mongodb_uri() -> str:
    return db_config.mongodb_uri


def get_club_db_uri() -> str:
    return db_config.club_db_uri


def get_event_db_uri() -> str:
    return db_config.event_db_uri


if __name__ == "__main__":
    # Test the configuration
    print("🔧 Testing Database Configuration...")
    print(f"PostgreSQL URL: {db_config.supabase_url[:50]}...")
    print(f"MongoDB URI: {db_config.mongodb_uri[:50]}...")
    print(f"Cloudinary Config: {db_config.cloudinary_config}")
    print(f"Seeding Config: {db_config.seeding_config}")
    print("\n🔍 Testing Connections...")
    results = db_config.test_connections()
    print(f"Results: {results}")
