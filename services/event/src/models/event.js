export class Event {
  constructor({ id, name, start_time, club_id }) {
    this.id = id;
    this.name = name;
    this.start_time = new Date(start_time);
    this.club_id = club_id;
  }
}