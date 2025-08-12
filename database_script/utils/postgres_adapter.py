#!/usr/bin/env python3
"""
PostgreSQL Adapter
Handles both psycopg2 and psycopg3 for Windows compatibility
"""

import logging

logger = logging.getLogger(__name__)

def get_postgres_connection(connection_string):
    """Get PostgreSQL connection using available driver"""
    try:
        # Try psycopg2 first (more common)
        import psycopg2
        conn = psycopg2.connect(connection_string)
        logger.info("🔌 Using psycopg2 for PostgreSQL connection")
        return conn, 'psycopg2'
    except ImportError:
        try:
            # Try psycopg3 if psycopg2 not available
            import psycopg
            conn = psycopg.connect(connection_string)
            logger.info("🔌 Using psycopg3 for PostgreSQL connection")
            return conn, 'psycopg3'
        except ImportError:
            raise ImportError("Neither psycopg2 nor psycopg is installed. Please install one of them.")

def execute_query(connection, query, params=None, driver_type='psycopg2'):
    """Execute query with compatibility for both drivers"""
    cursor = connection.cursor()
    try:
        if params:
            if driver_type == 'psycopg3':
                # psycopg3 uses different parameter style
                cursor.execute(query, params)
            else:
                # psycopg2 style
                cursor.execute(query, params)
        else:
            cursor.execute(query)
        return cursor
    except Exception as e:
        cursor.close()
        raise e

def execute_many(connection, query, params_list, driver_type='psycopg2'):
    """Execute many queries with compatibility"""
    cursor = connection.cursor()
    try:
        if driver_type == 'psycopg3':
            # psycopg3 might have different executemany behavior
            cursor.executemany(query, params_list)
        else:
            # psycopg2 style
            cursor.executemany(query, params_list)
        return cursor
    except Exception as e:
        cursor.close()
        raise e

