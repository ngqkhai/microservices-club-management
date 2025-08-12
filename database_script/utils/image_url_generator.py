#!/usr/bin/env python3
"""
Image URL Generator Utility
Generates realistic image URLs for database seeding
"""

import os
import random
import hashlib
from typing import Optional


class ImageURLGenerator:
    """Generates realistic image URLs for database seeding"""
    
    def __init__(self):
        self.cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', 'djupm4v0l')
        self.use_real_images = os.getenv('USE_REAL_IMAGES', 'false').lower() == 'true'
        self.use_placeholder_service = os.getenv('USE_PLACEHOLDER_SERVICE', 'true').lower() == 'true'
    
    def generate_profile_picture_url(self, user_id: str, gender: str = 'Nam') -> str:
        """Generate realistic profile picture URL"""
        if self.use_real_images:
            return self._generate_cloudinary_url('profiles', f'user_{user_id}', 400, 400)
        elif self.use_placeholder_service:
            # Use gender-appropriate placeholder
            seed = int(hashlib.md5(user_id.encode()).hexdigest()[:8], 16)
            return f"https://picsum.photos/seed/{seed}/400/400"
        else:
            # Use avatar placeholder service with Vietnamese names
            return f"https://ui-avatars.com/api/?name={user_id}&size=400&background=random"
    
    def generate_club_logo_url(self, club_id: str, club_name: str) -> str:
        """Generate realistic club logo URL"""
        if self.use_real_images:
            return self._generate_cloudinary_url('clubs/logos', f'club_{club_id}', 300, 300)
        elif self.use_placeholder_service:
            seed = int(hashlib.md5(club_id.encode()).hexdigest()[:8], 16)
            return f"https://picsum.photos/seed/logo{seed}/300/300"
        else:
            # Generate logo-style placeholder
            club_initial = club_name[0] if club_name else 'C'
            return f"https://ui-avatars.com/api/?name={club_initial}&size=300&background=4f46e5&color=ffffff&font-size=0.5"
    
    def generate_club_cover_url(self, club_id: str, category: str) -> str:
        """Generate realistic club cover URL"""
        if self.use_real_images:
            return self._generate_cloudinary_url('clubs/covers', f'cover_{club_id}', 1200, 400)
        elif self.use_placeholder_service:
            # Use category-based seeds for variety
            category_seeds = {
                'Công nghệ': 1000,
                'Thể thao': 2000,
                'Văn hóa': 3000,
                'Học thuật': 4000,
                'Tình nguyện': 5000,
                'Kinh doanh': 6000
            }
            base_seed = category_seeds.get(category, 0)
            seed = base_seed + int(hashlib.md5(club_id.encode()).hexdigest()[:8], 16) % 1000
            return f"https://picsum.photos/seed/cover{seed}/1200/400"
        else:
            return f"https://via.placeholder.com/1200x400/4f46e5/ffffff?text={category}"
    
    def generate_event_image_url(self, event_id: str, event_title: str) -> str:
        """Generate realistic event main image URL"""
        if self.use_real_images:
            return self._generate_cloudinary_url('events', f'event_{event_id}', 800, 600)
        elif self.use_placeholder_service:
            seed = int(hashlib.md5(event_id.encode()).hexdigest()[:8], 16)
            return f"https://picsum.photos/seed/event{seed}/800/600"
        else:
            return f"https://via.placeholder.com/800x600/059669/ffffff?text=Event"
    
    def generate_event_logo_url(self, event_id: str, event_title: str) -> str:
        """Generate realistic event logo URL"""
        if self.use_real_images:
            return self._generate_cloudinary_url('events/logos', f'logo_{event_id}', 200, 200)
        elif self.use_placeholder_service:
            seed = int(hashlib.md5(f"logo_{event_id}".encode()).hexdigest()[:8], 16)
            return f"https://picsum.photos/seed/eventlogo{seed}/200/200"
        else:
            event_initial = event_title[0] if event_title else 'E'
            return f"https://ui-avatars.com/api/?name={event_initial}&size=200&background=059669&color=ffffff&font-size=0.6"
    
    def generate_event_gallery_urls(self, event_id: str, count: int = 3) -> list:
        """Generate realistic event gallery image URLs"""
        urls = []
        for i in range(count):
            if self.use_real_images:
                url = self._generate_cloudinary_url('events/gallery', f'gallery_{event_id}_{i}', 600, 400)
            elif self.use_placeholder_service:
                seed = int(hashlib.md5(f"gallery_{event_id}_{i}".encode()).hexdigest()[:8], 16)
                url = f"https://picsum.photos/seed/gallery{seed}/600/400"
            else:
                url = f"https://via.placeholder.com/600x400/6366f1/ffffff?text=Gallery+{i+1}"
            urls.append(url)
        return urls
    
    def _generate_cloudinary_url(self, folder: str, public_id: str, width: int, height: int) -> str:
        """Generate Cloudinary URL with transformations"""
        base_url = f"https://res.cloudinary.com/{self.cloud_name}/image/upload"
        transformation = f"c_fill,w_{width},h_{height},q_auto,f_auto"
        full_public_id = f"club_management/{folder}/{public_id}"
        return f"{base_url}/{transformation}/{full_public_id}.jpg"
    
    def get_random_placeholder_image(self, width: int = 400, height: int = 400) -> str:
        """Get a random placeholder image"""
        if self.use_placeholder_service:
            seed = random.randint(1, 10000)
            return f"https://picsum.photos/seed/{seed}/{width}/{height}"
        else:
            return f"https://via.placeholder.com/{width}x{height}/6b7280/ffffff?text=Image"


# Global instance for easy import
image_generator = ImageURLGenerator()


# Convenience functions for direct use
def generate_profile_picture_url(user_id: str, gender: str = 'Nam') -> str:
    return image_generator.generate_profile_picture_url(user_id, gender)


def generate_club_logo_url(club_id: str, club_name: str) -> str:
    return image_generator.generate_club_logo_url(club_id, club_name)


def generate_club_cover_url(club_id: str, category: str) -> str:
    return image_generator.generate_club_cover_url(club_id, category)


def generate_event_image_url(event_id: str, event_title: str) -> str:
    return image_generator.generate_event_image_url(event_id, event_title)


def generate_event_logo_url(event_id: str, event_title: str) -> str:
    return image_generator.generate_event_logo_url(event_id, event_title)


def generate_event_gallery_urls(event_id: str, count: int = 3) -> list:
    return image_generator.generate_event_gallery_urls(event_id, count)


if __name__ == "__main__":
    # Test the generator
    print("Testing Image URL Generator...")
    print("Profile:", generate_profile_picture_url("user123", "Nam"))
    print("Club Logo:", generate_club_logo_url("club456", "CLB Công nghệ"))
    print("Club Cover:", generate_club_cover_url("club456", "Công nghệ"))
    print("Event Image:", generate_event_image_url("event789", "Workshop React"))
    print("Event Logo:", generate_event_logo_url("event789", "Workshop React"))
    print("Event Gallery:", generate_event_gallery_urls("event789", 2))

