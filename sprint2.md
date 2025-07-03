✅ Task Assignment – Club & Event Management (Sprint 2)

👨‍💻 Developers

Khải – Club Creation & Update + Admin-level Event Management

Thuận – Event Creation & Update

Kiệt + Phát – Event Participation & Event Browsing Enhancements

🏛️ Khải – Club Creation & Management (US-010, US-011)

US-010 – Create Club (POST /api/clubs)

{
  "method": "POST",
  "path": "/api/clubs",
  "security": "Bearer JWT (Admin or Club Manager)",
  "requestBody": {
    "name": "string",
    "description": "string",
    "type": "string",
    "logo_url": "string",
    "website_url": "string",
    "status": "active | inactive"
  },
  "response": {
    "201": {
      "id": "uuid",
      "name": "string",
      "status": "active"
    },
    "400": {
      "status": 400,
      "error": "VALIDATION_ERROR",
      "message": "Missing required fields"
    }
  }
}

US-011 – Update Club Info (PUT /api/clubs/{id})

{
  "method": "PUT",
  "path": "/api/clubs/{id}",
  "security": "Bearer JWT (Admin or Club Manager)",
  "requestBody": {
    "name": "string",
    "description": "string",
    "type": "string",
    "logo_url": "string",
    "website_url": "string",
    "status": "active | inactive"
  },
  "response": {
    "200": "Club updated successfully",
    "404": {
      "status": 404,
      "error": "CLUB_NOT_FOUND",
      "message": "Club not found"
    }
  }
}

🎉 Thuận – Event Creation & Update (US-012, US-013)

US-012 – Create Event (POST /api/events)

{
  "method": "POST",
  "path": "/api/events",
  "security": "Bearer JWT (Club Manager)",
  "requestBody": {
    "club_id": "uuid",
    "title": "string",
    "description": "string",
    "start_at": "ISO 8601 datetime",
    "end_at": "ISO 8601 datetime",
    "location": "string",
    "status": "upcoming | ongoing | finished"
  },
  "response": {
    "201": {
      "id": "uuid",
      "title": "string",
      "status": "upcoming"
    },
    "400": {
      "status": 400,
      "error": "VALIDATION_ERROR",
      "message": "Invalid or missing fields"
    }
  }
}

US-013 – Update Event (PUT /api/events/{id})

{
  "method": "PUT",
  "path": "/api/events/{id}",
  "security": "Bearer JWT (Club Manager)",
  "requestBody": {
    "title": "string",
    "description": "string",
    "start_at": "ISO 8601 datetime",
    "end_at": "ISO 8601 datetime",
    "location": "string",
    "status": "upcoming | ongoing | finished"
  },
  "response": {
    "200": "Event updated successfully",
    "404": {
      "status": 404,
      "error": "EVENT_NOT_FOUND",
      "message": "Event not found"
    }
  }
}

👥 Kiệt + Phát – Event Participation & Browsing Extensions (US-014, US-015)

US-014 – Join Event (POST /api/events/{id}/join)

{
  "method": "POST",
  "path": "/api/events/{id}/join",
  "security": "Bearer JWT (User)",
  "response": {
    "200": "Joined event successfully",
    "400": {
      "status": 400,
      "error": "ALREADY_JOINED",
      "message": "You already joined this event"
    },
    "404": {
      "status": 404,
      "error": "EVENT_NOT_FOUND",
      "message": "Event not found"
    }
  }
}

US-015 – Leave Event (DELETE /api/events/{id}/leave)

{
  "method": "DELETE",
  "path": "/api/events/{id}/leave",
  "security": "Bearer JWT (User)",
  "response": {
    "200": "Left event successfully",
    "404": {
      "status": 404,
      "error": "EVENT_NOT_FOUND",
      "message": "Event not found"
    }
  }
}

🛠️ Khải – Admin Event Controls (US-016)

US-016 – Delete Event (DELETE /api/events/{id})

{
  "method": "DELETE",
  "path": "/api/events/{id}",
  "security": "Bearer JWT (Admin or Club Manager)",
  "response": {
    "204": "Event deleted",
    "404": {
      "status": 404,
      "error": "EVENT_NOT_FOUND",
      "message": "Event not found"
    }
  }
}

✅ Tổng kết mục tiêu Sprint 2:

Khải: CRUD cho Club + Delete Event (Admin)

Thuận: CRUD cho Event

Kiệt + Phát: Event Participation (Join/Leave), có thể bổ sung thêm các API filter/search Event chi tiết hơn nếu kịp thời gian.