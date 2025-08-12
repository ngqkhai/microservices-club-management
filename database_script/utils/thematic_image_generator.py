#!/usr/bin/env python3
"""
Thematic Image Generator
Generates category-specific and thematically appropriate images for clubs and events
"""

import os
import random
import hashlib
from typing import Optional, List


class ThematicImageGenerator:
    """Generates thematically appropriate images based on club/event categories"""
    
    def __init__(self):
        self.cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', 'djupm4v0l')
        self.use_real_images = os.getenv('USE_REAL_IMAGES', 'false').lower() == 'true'
        self.use_placeholder_service = os.getenv('USE_PLACEHOLDER_SERVICE', 'true').lower() == 'true'
        
        # Category-specific image themes and keywords
        self.category_themes = {
            'Công nghệ': {
                'keywords': ['technology', 'coding', 'computer', 'software', 'digital', 'innovation'],
                'colors': ['4f46e5', '3b82f6', '06b6d4', '8b5cf6'],
                'unsplash_collections': ['3330452', '1065976'],  # Tech collections
                'picsum_seeds': range(1000, 1100)
            },
            'Thể thao': {
                'keywords': ['sports', 'fitness', 'athletics', 'competition', 'team', 'active'],
                'colors': ['ef4444', 'f97316', '22c55e', 'eab308'],
                'unsplash_collections': ['1571171', '3816141'],  # Sports collections
                'picsum_seeds': range(2000, 2100)
            },
            'Văn hóa': {
                'keywords': ['culture', 'art', 'music', 'creative', 'performance', 'artistic'],
                'colors': ['ec4899', 'a855f7', 'f59e0b', '06b6d4'],
                'unsplash_collections': ['3348849', '1154337'],  # Art/Culture collections
                'picsum_seeds': range(3000, 3100)
            },
            'Học thuật': {
                'keywords': ['academic', 'education', 'research', 'study', 'learning', 'knowledge'],
                'colors': ['059669', '0891b2', '7c3aed', 'dc2626'],
                'unsplash_collections': ['3308188', '4291835'],  # Education collections
                'picsum_seeds': range(4000, 4100)
            },
            'Tình nguyện': {
                'keywords': ['volunteer', 'community', 'helping', 'charity', 'environment', 'social'],
                'colors': ['22c55e', '16a34a', 'f59e0b', 'dc2626'],
                'unsplash_collections': ['3356627', '4291835'],  # Volunteer/Community collections
                'picsum_seeds': range(5000, 5100)
            },
            'Kinh doanh': {
                'keywords': ['business', 'entrepreneurship', 'finance', 'startup', 'corporate', 'professional'],
                'colors': ['1f2937', '374151', '4b5563', '6b7280'],
                'unsplash_collections': ['3308188', '827743'],  # Business collections
                'picsum_seeds': range(6000, 6100)
            }
        }
        
        # Event category specific themes
        self.event_themes = {
            'Workshop': {
                'keywords': ['workshop', 'learning', 'hands-on', 'training', 'skill'],
                'colors': ['3b82f6', '8b5cf6', '06b6d4'],
                'picsum_seeds': range(7000, 7050)
            },
            'Seminar': {
                'keywords': ['seminar', 'presentation', 'discussion', 'academic', 'lecture'],
                'colors': ['059669', '0891b2', '7c3aed'],
                'picsum_seeds': range(7050, 7100)
            },
            'Competition': {
                'keywords': ['competition', 'contest', 'challenge', 'tournament', 'winner'],
                'colors': ['ef4444', 'f97316', 'eab308'],
                'picsum_seeds': range(7100, 7150)
            },
            'Social': {
                'keywords': ['social', 'networking', 'community', 'gathering', 'fun'],
                'colors': ['ec4899', 'a855f7', 'f59e0b'],
                'picsum_seeds': range(7150, 7200)
            },
            'Performance': {
                'keywords': ['performance', 'show', 'entertainment', 'stage', 'audience'],
                'colors': ['ec4899', 'a855f7', '8b5cf6'],
                'picsum_seeds': range(7200, 7250)
            },
            'Exhibition': {
                'keywords': ['exhibition', 'display', 'showcase', 'gallery', 'art'],
                'colors': ['a855f7', 'f59e0b', '06b6d4'],
                'picsum_seeds': range(7250, 7300)
            }
        }

    def get_category_theme(self, category: str) -> dict:
        """Get theme data for a category"""
        return self.category_themes.get(category, self.category_themes['Học thuật'])

    def get_event_theme(self, event_category: str) -> dict:
        """Get theme data for an event category"""
        return self.event_themes.get(event_category, self.event_themes['Social'])

    def generate_club_logo_url(self, club_id: str, club_name: str, category: str) -> str:
        """Generate thematically appropriate club logo"""
        theme = self.get_category_theme(category)
        
        if self.use_real_images:
            return self._generate_cloudinary_url('clubs/logos', f'{category.lower()}_{club_id}', 300, 300)
        elif self.use_placeholder_service:
            # Use category-specific seed range
            seed_base = list(theme['picsum_seeds'])[0]
            seed = seed_base + int(hashlib.md5(club_id.encode()).hexdigest()[:4], 16) % 100
            return f"https://picsum.photos/seed/{seed}/300/300"
        else:
            # Use category-appropriate color
            color = random.choice(theme['colors'])
            club_initial = club_name[0] if club_name else 'C'
            return f"https://ui-avatars.com/api/?name={club_initial}&size=300&background={color}&color=ffffff&font-size=0.5"

    def generate_club_cover_url(self, club_id: str, club_name: str, category: str) -> str:
        """Generate thematically appropriate club cover"""
        theme = self.get_category_theme(category)
        
        if self.use_real_images:
            return self._generate_cloudinary_url('clubs/covers', f'{category.lower()}_{club_id}', 1200, 400)
        elif self.use_placeholder_service:
            # Use category-specific seed range for covers
            seed_base = list(theme['picsum_seeds'])[0] + 500  # Offset for covers
            seed = seed_base + int(hashlib.md5(f"cover_{club_id}".encode()).hexdigest()[:4], 16) % 100
            return f"https://picsum.photos/seed/{seed}/1200/400"
        else:
            color = random.choice(theme['colors'])
            return f"https://via.placeholder.com/1200x400/{color}/ffffff?text={category}"

    def generate_event_image_url(self, event_id: str, event_title: str, event_category: str, club_category: str) -> str:
        """Generate thematically appropriate event main image"""
        # Combine event and club themes
        event_theme = self.get_event_theme(event_category)
        club_theme = self.get_category_theme(club_category)
        
        if self.use_real_images:
            return self._generate_cloudinary_url('events', f'{event_category.lower()}_{club_category.lower()}_{event_id}', 800, 600)
        elif self.use_placeholder_service:
            # Use event-specific seed range
            seed_base = list(event_theme['picsum_seeds'])[0]
            seed = seed_base + int(hashlib.md5(event_id.encode()).hexdigest()[:4], 16) % 50
            return f"https://picsum.photos/seed/{seed}/800/600"
        else:
            # Combine event and club colors
            all_colors = event_theme['colors'] + club_theme['colors']
            color = random.choice(all_colors)
            return f"https://via.placeholder.com/800x600/{color}/ffffff?text={event_category}"

    def generate_event_logo_url(self, event_id: str, event_title: str, event_category: str, club_category: str) -> str:
        """Generate thematically appropriate event logo"""
        event_theme = self.get_event_theme(event_category)
        
        if self.use_real_images:
            return self._generate_cloudinary_url('events/logos', f'{event_category.lower()}_logo_{event_id}', 200, 200)
        elif self.use_placeholder_service:
            seed_base = list(event_theme['picsum_seeds'])[0] + 25  # Offset for logos
            seed = seed_base + int(hashlib.md5(f"logo_{event_id}".encode()).hexdigest()[:4], 16) % 25
            return f"https://picsum.photos/seed/{seed}/200/200"
        else:
            color = random.choice(event_theme['colors'])
            event_initial = event_title[0] if event_title else 'E'
            return f"https://ui-avatars.com/api/?name={event_initial}&size=200&background={color}&color=ffffff&font-size=0.6"

    def generate_event_gallery_urls(self, event_id: str, event_category: str, club_category: str, count: int = 3) -> List[str]:
        """Generate thematically appropriate event gallery images"""
        event_theme = self.get_event_theme(event_category)
        club_theme = self.get_category_theme(club_category)
        urls = []
        
        for i in range(count):
            if self.use_real_images:
                url = self._generate_cloudinary_url('events/gallery', f'{event_category.lower()}_{club_category.lower()}_gallery_{event_id}_{i}', 600, 400)
            elif self.use_placeholder_service:
                # Use varied seeds for gallery
                seed_base = list(event_theme['picsum_seeds'])[0] + 100
                seed = seed_base + int(hashlib.md5(f"gallery_{event_id}_{i}".encode()).hexdigest()[:4], 16) % 50
                url = f"https://picsum.photos/seed/{seed}/600/400"
            else:
                # Alternate between event and club theme colors
                all_colors = event_theme['colors'] + club_theme['colors']
                color = all_colors[i % len(all_colors)]
                url = f"https://via.placeholder.com/600x400/{color}/ffffff?text=Gallery+{i+1}"
            urls.append(url)
        
        return urls

    def generate_profile_picture_url(self, user_id: str, gender: str = 'Nam') -> str:
        """Generate realistic profile picture URL"""
        if self.use_real_images:
            return self._generate_cloudinary_url('profiles', f'user_{user_id}', 400, 400)
        elif self.use_placeholder_service:
            # Use gender-appropriate placeholder with consistent seed
            seed = int(hashlib.md5(user_id.encode()).hexdigest()[:8], 16)
            return f"https://picsum.photos/seed/{seed}/400/400"
        else:
            # Use avatar placeholder service
            return f"https://ui-avatars.com/api/?name={user_id}&size=400&background=random"

    def _generate_cloudinary_url(self, folder: str, public_id: str, width: int, height: int) -> str:
        """Generate Cloudinary URL with transformations"""
        base_url = f"https://res.cloudinary.com/{self.cloud_name}/image/upload"
        transformation = f"c_fill,w_{width},h_{height},q_auto,f_auto"
        full_public_id = f"club_management/{folder}/{public_id}"
        return f"{base_url}/{transformation}/{full_public_id}.jpg"

    def get_thematic_keywords(self, category: str, event_category: str = None) -> List[str]:
        """Get thematic keywords for category and event type"""
        club_theme = self.get_category_theme(category)
        keywords = club_theme['keywords'].copy()
        
        if event_category:
            event_theme = self.get_event_theme(event_category)
            keywords.extend(event_theme['keywords'])
        
        return keywords

    def get_suggested_colors(self, category: str, event_category: str = None) -> List[str]:
        """Get suggested color palette for category and event type"""
        club_theme = self.get_category_theme(category)
        colors = club_theme['colors'].copy()
        
        if event_category:
            event_theme = self.get_event_theme(event_category)
            colors.extend(event_theme['colors'])
        
        return list(set(colors))  # Remove duplicates


# Global instance for easy import
thematic_generator = ThematicImageGenerator()


# Convenience functions for direct use
def generate_thematic_club_logo_url(club_id: str, club_name: str, category: str) -> str:
    return thematic_generator.generate_club_logo_url(club_id, club_name, category)


def generate_thematic_club_cover_url(club_id: str, club_name: str, category: str) -> str:
    return thematic_generator.generate_club_cover_url(club_id, club_name, category)


def generate_thematic_event_image_url(event_id: str, event_title: str, event_category: str, club_category: str) -> str:
    return thematic_generator.generate_event_image_url(event_id, event_title, event_category, club_category)


def generate_thematic_event_logo_url(event_id: str, event_title: str, event_category: str, club_category: str) -> str:
    return thematic_generator.generate_event_logo_url(event_id, event_title, event_category, club_category)


def generate_thematic_event_gallery_urls(event_id: str, event_category: str, club_category: str, count: int = 3) -> List[str]:
    return thematic_generator.generate_event_gallery_urls(event_id, event_category, club_category, count)


if __name__ == "__main__":
    # Test the thematic generator
    print("🎨 Testing Thematic Image Generator...")
    print("Club Logo (Tech):", generate_thematic_club_logo_url("club123", "CLB Công nghệ", "Công nghệ"))
    print("Club Cover (Sports):", generate_thematic_club_cover_url("club456", "CLB Bóng đá", "Thể thao"))
    print("Event Image (Workshop+Tech):", generate_thematic_event_image_url("event789", "Workshop React", "Workshop", "Công nghệ"))
    print("Event Gallery (Competition+Sports):", generate_thematic_event_gallery_urls("event101", "Competition", "Thể thao", 2))
    print("Keywords (Culture+Performance):", thematic_generator.get_thematic_keywords("Văn hóa", "Performance"))
    print("Colors (Business+Seminar):", thematic_generator.get_suggested_colors("Kinh doanh", "Seminar"))

