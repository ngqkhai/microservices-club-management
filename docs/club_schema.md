# Club Management System Schema

This document outlines the database schema for the various services within the Club Management System.

## Auth Service (PostgreSQL - Sequelize)

The Auth service is responsible for user authentication and management.

### `users` table

Stores user account and profile information.

| Column                | Data Type                                       | Constraints                                                  | Description                                                                 |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `id`                  | `UUID`                                          | Primary Key, Not Null, Default: `uuidv4()`                   | Unique identifier for the user.                                             |
| `email`               | `VARCHAR(255)`                                  | Not Null, Unique                                             | User's email address, used for login.                                       |
| `full_name`           | `VARCHAR(255)`                                  | Not Null                                                     | User's full name.                                                           |
| `password_hash`       | `VARCHAR(255)`                                  | Not Null                                                     | Hashed password for the user.                                               |
| `role`                | `ENUM('user', 'admin')`                         | Not Null, Default: `'user'`                                  | User's role in the system.                                                  |
| `email_verified`      | `BOOLEAN`                                       | Default: `false`                                             | Flag indicating if the user's email has been verified.                      |
| `email_verified_at`   | `TIMESTAMP WITH TIME ZONE`                      |                                                              | Timestamp when the email was verified.                                      |
| `phone`               | `VARCHAR(20)`                                   | Unique                                                       | User's phone number.                                                        |
| `profile_picture_url` | `VARCHAR(500)`                                  |                                                              | URL for the user's profile picture.                                         |
| `bio`                 | `TEXT`                                          |                                                              | A short biography of the user.                                              |
| `date_of_birth`       | `DATE`                                          |                                                              | User's date of birth.                                                       |
| `gender`              | `ENUM('Nam', 'Nữ', 'Khác', 'Không muốn nói')`   |                                                              | User's gender.                                                              |
| `address`             | `TEXT`                                          |                                                              | User's physical address.                                                    |
| `social_links`        | `JSONB`                                         | Default: `{}`                                                | JSON object containing links to social media profiles (e.g., facebook, twitter). |
| `created_at`          | `TIMESTAMP WITH TIME ZONE`                      | Not Null                                                     | Timestamp of user creation.                                                 |
| `updated_at`          | `TIMESTAMP WITH TIME ZONE`                      | Not Null                                                     | Timestamp of last user update.                                              |
| `deleted_at`          | `TIMESTAMP WITH TIME ZONE`                      |                                                              | Timestamp for soft deletion.                                                |

---

## Club Service (MongoDB - Mongoose)

The Club service manages clubs and their related activities.

### `clubs` collection

Stores information about each club.

| Field           | Data Type                               | Constraints                               | Description                                                                                             |
| --------------- | --------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `_id`           | `ObjectId`                              | Primary Key                               | Unique identifier for the club.                                                                         |
| `name`          | `String`                                | Required, Unique                          | The official name of the club.                                                                          |
| `description`   | `String`                                | MaxLength: 5000                           | A detailed description of the club's mission and activities.                                            |
| `category`      | `String`                                |                                           | The category the club belongs to (e.g., 'Academic', 'Sports', 'Arts').                                  |
| `location`      | `String`                                |                                           | Physical location or main campus of the club.                                                           |
| `contact_email` | `String`                                |                                           | Public contact email for the club.                                                                      |
| `contact_phone` | `String`                                |                                           | Public contact phone number for the club.                                                               |
| `logo_url`      | `String`                                |                                           | URL for the club's logo.                                                                                |
| `website_url`   | `String`                                |                                           | URL for the club's official website.                                                                    |
| `social_links`  | `Map` of `String` to `String`           |                                           | Key-value pairs for social media links (e.g., `facebook: "url"`).                                       |
| `settings`      | `Object`                                |                                           | Club settings: `is_public` (Boolean), `requires_approval` (Boolean), `max_members` (Number).            |
| `status`        | `String`                                | Enum: `ACTIVE`, `INACTIVE`, `DELETED`     | The current status of the club.                                                                         |
| `member_count`  | `Number`                                | Min: 0                                    | The total number of members in the club.                                                                |
| `created_by`    | `String` (UUID)                         | Required                                  | The `id` of the user who created the club.                                                              |
| `manager`       | `String` (UUID)                         |                                           | The `id` of the user who is the current manager of the club.                                            |
| `created_at`    | `Date`                                  | Default: `Date.now`                       | Timestamp of club creation.                                                                             |
| `updated_at`    | `Date`                                  | Default: `Date.now`                       | Timestamp of last club update.                                                                          |
| `deleted_at`    | `Date`                                  |                                           | Timestamp for soft deletion.                                                                            |

### `recruitment_campaigns` collection

Stores details about club recruitment campaigns.

| Field                   | Data Type                                                     | Constraints                                               | Description                                                                                             |
| ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `_id`                   | `ObjectId`                                                    | Primary Key                                               | Unique identifier for the campaign.                                                                     |
| `club_id`               | `ObjectId`                                                    | Required, Ref: `Club`                                     | The club that owns this campaign.                                                                       |
| `title`                 | `String`                                                      | Required, MaxLength: 200                                  | The title of the recruitment campaign.                                                                  |
| `description`           | `String`                                                      | MaxLength: 2000                                           | A detailed description of the campaign.                                                                 |
| `requirements`          | `String`                                                      | MaxLength: 1000                                           | Specific requirements for applicants.                                                                   |
| `application_questions` | `Array` of `Objects`                                          |                                                           | Custom questions for the application form. Each object has `question`, `type`, `options`, `is_required`. |
| `start_date`            | `Date`                                                        | Required                                                  | The start date of the campaign.                                                                         |
| `end_date`              | `Date`                                                        | Required                                                  | The end date of the campaign.                                                                           |
| `max_applications`      | `Number`                                                      | Min: 1                                                    | Maximum number of applications accepted.                                                                |
| `status`                | `String`                                                      | Enum: `draft`, `published`, `paused`, `completed`, `archived` | The current status of the campaign.                                                                     |
| `statistics`            | `Object`                                                      |                                                           | Campaign statistics: `total_applications`, `approved_applications`, etc.                                |
| `created_at`            | `Date`                                                        | Default: `Date.now`                                       | Timestamp of campaign creation.                                                                         |
| `updated_at`            | `Date`                                                        | Default: `Date.now`                                       | Timestamp of last campaign update.                                                                      |

---

## Event Service (MongoDB - Mongoose)

The Event service is responsible for managing club events.

### `events` collection

Stores information about events organized by clubs.

| Field                   | Data Type                                                     | Constraints                                               | Description                                                                                             |
| ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `_id`                   | `ObjectId`                                                    | Primary Key                                               | Unique identifier for the event.                                                                        |
| `club_id`               | `String`                                                      | Required, Index                                           | The `_id` of the club hosting the event.                                                                |
| `title`                 | `String`                                                      | Required, MaxLength: 200                                  | The title of the event.                                                                                 |
| `description`           | `String`                                                      | MaxLength: 2000                                           | A detailed description of the event.                                                                    |
| `short_description`     | `String`                                                      | MaxLength: 500                                            | A brief summary of the event.                                                                           |
| `category`              | `String`                                                      | Enum: `workshop`, `seminar`, `competition`, etc.          | The category of the event.                                                                              |
| `location`              | `Object`                                                      |                                                           | Event location details: `location_type`, `address`, `room`, `virtual_link`, `coordinates`.              |
| `start_date`            | `Date`                                                        | Required, Index                                           | The start date and time of the event.                                                                   |
| `end_date`              | `Date`                                                        | Required                                                  | The end date and time of the event.                                                                     |
| `registration_deadline` | `Date`                                                        |                                                           | The deadline for event registration.                                                                    |
| `max_participants`      | `Number`                                                      | Min: 1                                                    | Maximum number of participants allowed.                                                                 |
| `participation_fee`     | `Number`                                                      | Min: 0, Default: 0                                        | The fee to participate in the event.                                                                    |
| `currency`              | `String`                                                      | MaxLength: 3, Default: `USD`                              | The currency for the participation fee.                                                                 |
| `requirements`          | `Array` of `String`                                           |                                                           | Any prerequisites or requirements for attendees.                                                        |
| `tags`                  | `Array` of `String`                                           |                                                           | Tags for categorizing and searching for the event.                                                      |
| `images`                | `Array` of `String`                                           |                                                           | URLs of images related to the event.                                                                    |
| `attachments`           | `Array` of `Objects`                                          |                                                           | File attachments for the event, with `filename`, `url`, `size`, `type`.                                   |
| `status`                | `String`                                                      | Enum: `draft`, `published`, `cancelled`, `completed`      | The current status of the event.                                                                        |
| `visibility`            | `String`                                                      | Enum: `public`, `club_members`                            | Who can see the event.                                                                                  |
| `organizers`            | `Array` of `Objects`                                          |                                                           | Users organizing the event, with `user_id` (UUID), `role`, and `joined_at`.                             |
| `statistics`            | `Object`                                                      |                                                           | Event statistics: `total_registrations`, `total_interested`, `total_attended`.                          |
| `created_by`            | `String` (UUID)                                               | Required                                                  | The `id` of the user who created the event.                                                             |
| `created_at`            | `Date`                                                        | Default: `Date.now`                                       | Timestamp of event creation.                                                                            |
| `updated_at`            | `Date`                                                        | Default: `Date.now`                                       | Timestamp of last event update.                                                                         |
