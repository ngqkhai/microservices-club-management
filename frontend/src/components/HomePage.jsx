import GuestLayout from "../layouts/GuestLayout"
import "../styles/HomePage.css"
import heroBg from "../assets/Home-bg.jpeg"

export default function HomePage() {
  // Mock data for clubs - sẽ thay thế bằng data từ database
  const topClubs = [
    { id: 1, name: "Photography Club", image: "/placeholder.svg?height=200&width=300", members: 150 },
    { id: 2, name: "Music Club", image: "/placeholder.svg?height=200&width=300", members: 200 },
    { id: 3, name: "Dance Club", image: "/placeholder.svg?height=200&width=300", members: 120 },
    { id: 4, name: "Tech Club", image: "/placeholder.svg?height=200&width=300", members: 180 },
  ]

  // Mock data for events - sẽ thay thế bằng data từ database
  const upcomingEvents = [
    {
      id: 1,
      title: "Photography Workshop",
      date: "2025-01-15",
      image: "/placeholder.svg?height=200&width=300",
      club: "Photography Club",
    },
    {
      id: 2,
      title: "Music Festival",
      date: "2025-01-20",
      image: "/placeholder.svg?height=200&width=300",
      club: "Music Club",
    },
    {
      id: 3,
      title: "Dance Competition",
      date: "2025-01-25",
      image: "/placeholder.svg?height=200&width=300",
      club: "Dance Club",
    },
    {
      id: 4,
      title: "Tech Talk",
      date: "2025-01-30",
      image: "/placeholder.svg?height=200&width=300",
      club: "Tech Club",
    },
  ]

  return (
    <GuestLayout>
      {/* Hero Section */}
      <section className="home-hero">
        <img src={heroBg || "/placeholder.svg"} alt="UniVibe Hero" className="home-hero-bg" />
        <div className="home-hero-overlay"></div>
        <h1 className="home-hero-title">Khám phá đam mê – Kết nối cộng đồng – Sống hết mình với UniVibe</h1>
      </section>

      {/* Main Content */}
      <div className="home-main-dark">
        {/* Top Clubs Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Top Clubs</h2>
            <button className="view-all-btn">Xem tất cả</button>
          </div>
          <div className="clubs-grid">
            {topClubs.map((club) => (
              <div key={club.id} className="club-card">
                <div className="club-image-container">
                  <img src={club.image || "/placeholder.svg"} alt={club.name} className="club-image" />
                </div>
                <div className="club-info">
                  <h3 className="club-name">{club.name}</h3>
                  <p className="club-members">{club.members} thành viên</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Sự kiện sắp tới</h2>
            <button className="view-all-btn">Xem tất cả</button>
          </div>
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image-container">
                  <img src={event.image || "/placeholder.svg"} alt={event.title} className="event-image" />
                </div>
                <div className="event-info">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-club">{event.club}</p>
                  <p className="event-date">{new Date(event.date).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </GuestLayout>
  )
}
