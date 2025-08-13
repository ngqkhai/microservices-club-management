"""
Database seeding utilities
"""

from .image_url_generator import (
    ImageURLGenerator,
    image_generator,
    generate_profile_picture_url,
    generate_club_logo_url,
    generate_club_cover_url,
    generate_event_image_url,
    generate_event_logo_url,
    generate_event_gallery_urls
)

from .thematic_image_generator import (
    ThematicImageGenerator,
    thematic_generator,
    generate_thematic_club_logo_url,
    generate_thematic_club_cover_url,
    generate_thematic_event_image_url,
    generate_thematic_event_logo_url,
    generate_thematic_event_gallery_urls
)

from .database_config import (
    DatabaseConfig,
    db_config,
    get_supabase_url,
    get_mongodb_uri,
    get_club_db_uri,
    get_event_db_uri
)

__all__ = [
    # Original image generator
    'ImageURLGenerator',
    'image_generator',
    'generate_profile_picture_url',
    'generate_club_logo_url',
    'generate_club_cover_url',
    'generate_event_image_url',
    'generate_event_logo_url',
    'generate_event_gallery_urls',
    
    # Thematic image generator
    'ThematicImageGenerator',
    'thematic_generator',
    'generate_thematic_club_logo_url',
    'generate_thematic_club_cover_url',
    'generate_thematic_event_image_url',
    'generate_thematic_event_logo_url',
    'generate_thematic_event_gallery_urls',
    
    # Database configuration
    'DatabaseConfig',
    'db_config',
    'get_supabase_url',
    'get_mongodb_uri',
    'get_club_db_uri',
    'get_event_db_uri'
]
