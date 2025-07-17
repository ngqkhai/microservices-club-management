"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Info, Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter, Award } from "lucide-react"

interface ClubAboutProps {
  clubId: string
}

// Mock club detailed info
const mockClubInfo = {
  "tech-club": {
    description: `Câu lạc bộ Công nghệ Thông tin là nơi quy tụ những sinh viên đam mê công nghệ, lập trình và đổi mới sáng tạo. 
    
    Chúng tôi tổ chức các hoạt động đa dạng từ workshop kỹ thuật, hackathon, tech talk với các chuyên gia trong ngành, đến các dự án thực tế giúp thành viên phát triển kỹ năng và kinh nghiệm.
    
    Tại đây, bạn sẽ được học hỏi từ những người bạn cùng chí hướng, tham gia các dự án thú vị và xây dựng mạng lưới kết nối trong cộng đồng công nghệ.`,
    mission:
      "Tạo ra một cộng đồng học tập và phát triển công nghệ, nơi mọi thành viên có thể khám phá đam mê, nâng cao kỹ năng và cùng nhau xây dựng tương lai số.",
    vision:
      "Trở thành câu lạc bộ công nghệ hàng đầu tại trường, đào tạo ra những lập trình viên và chuyên gia công nghệ tài năng.",
    founded: "2018",
    categories: ["Lập trình", "AI/ML", "Web Development", "Mobile App", "DevOps"],
    contact: {
      email: "tech.club@university.edu.vn",
      phone: "+84 123 456 789",
      address: "Phòng 201, Tòa nhà Công nghệ, Trường Đại học",
      website: "https://techclub.university.edu.vn",
    },
    social: {
      facebook: "https://facebook.com/techclub.university",
      instagram: "https://instagram.com/techclub_university",
      twitter: "https://twitter.com/techclub_uni",
    },
    achievements: [
      "Giải Nhất Hackathon Quốc gia 2023",
      "Top 3 Cuộc thi Lập trình ACM 2023",
      "Chứng nhận Câu lạc bộ Xuất sắc 2022-2023",
    ],
    stats: {
      totalMembers: 78,
      activeProjects: 12,
      eventsThisYear: 24,
      graduatedMembers: 156,
    },
  },
}

export function ClubAbout({ clubId }: ClubAboutProps) {
  const clubInfo = mockClubInfo[clubId as keyof typeof mockClubInfo]

  if (!clubInfo) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy thông tin câu lạc bộ</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Giới thiệu
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Về chúng tôi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {clubInfo.description.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-3">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sứ mệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{clubInfo.mission}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tầm nhìn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{clubInfo.vision}</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Lĩnh vực hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {clubInfo.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{clubInfo.stats.totalMembers}</div>
                <div className="text-sm text-gray-600">Thành viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{clubInfo.stats.activeProjects}</div>
                <div className="text-sm text-gray-600">Dự án đang thực hiện</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{clubInfo.stats.eventsThisYear}</div>
                <div className="text-sm text-gray-600">Sự kiện năm nay</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{clubInfo.stats.graduatedMembers}</div>
                <div className="text-sm text-gray-600">Cựu thành viên</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Thành tích nổi bật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {clubInfo.achievements.map((achievement, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{clubInfo.contact.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Điện thoại</p>
                  <p className="font-medium">{clubInfo.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-medium">{clubInfo.contact.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a href={clubInfo.contact.website} className="font-medium text-blue-600 hover:underline">
                    {clubInfo.contact.website}
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-gray-600 mb-3">Mạng xã hội</p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={clubInfo.social.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={clubInfo.social.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={clubInfo.social.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
