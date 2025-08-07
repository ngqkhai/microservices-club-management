from pymongo import MongoClient

# Check club and event categories
club_client = MongoClient('mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/club_service_db?retryWrites=true&w=majority')
club_db = club_client.club_service_db

event_client = MongoClient('mongodb+srv://ngqkhai:byNceAIfBWS8xDvT@club-management-cluster.jgzkju5.mongodb.net/event_service_db?retryWrites=true&w=majority')
event_db = event_client.event_service_db

print('=== CLUB CATEGORIES ===')
clubs = list(club_db.clubs.find({}, {'name': 1, 'category': 1}))
for club in clubs[:10]:  # Show first 10
    name = club.get('name', 'N/A')
    category = club.get('category', 'N/A')
    print(f'{name}: {category}')
print(f'... and {len(clubs)-10} more clubs')

print()
print('=== EVENT CATEGORIES ===')
events = list(event_db.events.find({}, {'title': 1, 'category': 1, 'club_id': 1}))
for event in events[:10]:  # Show first 10
    title = event.get('title', 'N/A')
    category = event.get('category', 'N/A')
    print(f'{title}: {category}')
print(f'... and {len(events)-10} more events')

print()
print('=== CLUB-EVENT MISMATCH EXAMPLES ===')
# Find some mismatches
for event in events[:5]:
    club_id = event.get('club_id')
    club = club_db.clubs.find_one({'_id': club_id})
    if club:
        club_name = club.get('name', 'N/A')
        club_category = club.get('category', 'N/A')
        event_title = event.get('title', 'N/A')
        event_category = event.get('category', 'N/A')
        print(f'Club: {club_name} ({club_category})')
        print(f'Event: {event_title} ({event_category})')
        print('---')

club_client.close()
event_client.close()
