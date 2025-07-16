import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-4">UniVibe</div>
            <p className="text-gray-300 mb-4 max-w-md">
              Kết nối sinh viên đại học thông qua các câu lạc bộ, sự kiện và những trải nghiệm ý nghĩa. Tham gia cộng đồng của chúng tôi và khám phá đam mê của bạn.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/clubs" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Duyệt câu lạc bộ
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Sự kiện sắp tới
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Hồ sơ của tôi
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Tham gia ngay
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-gray-300">hello.univibe@gmail.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-gray-300">227 Nguyễn Văn Cừ, Phường, Chợ Quán, Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 University Club Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
