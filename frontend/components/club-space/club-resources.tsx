"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, ExternalLink, Folder, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ClubResourcesProps {
  clubId: string
}

// Mock resources data
const mockResources = [
  {
    id: "1",
    name: "Handbook CLB Công nghệ",
    type: "pdf",
    size: "2.5 MB",
    uploadDate: "2024-03-01",
    category: "Tài liệu chính thức",
    downloadCount: 45,
    url: "#",
  },
  {
    id: "2",
    name: "Biên bản họp tháng 3",
    type: "docx",
    size: "1.2 MB",
    uploadDate: "2024-03-15",
    category: "Biên bản",
    downloadCount: 23,
    url: "#",
  },
  {
    id: "3",
    name: "Slide React Workshop",
    type: "pptx",
    size: "8.7 MB",
    uploadDate: "2024-03-20",
    category: "Presentation",
    downloadCount: 67,
    url: "#",
  },
  {
    id: "4",
    name: "Code Examples Repository",
    type: "link",
    size: "External",
    uploadDate: "2024-03-10",
    category: "Code",
    downloadCount: 89,
    url: "https://github.com/club-tech/examples",
  },
  {
    id: "5",
    name: "Learning Resources",
    type: "link",
    size: "External",
    uploadDate: "2024-02-28",
    category: "Tài liệu học tập",
    downloadCount: 156,
    url: "https://notion.so/club-tech/resources",
  },
]

export function ClubResources({ clubId }: ClubResourcesProps) {
  const [resources] = useState(mockResources)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "pptx":
        return <FileText className="h-5 w-5 text-orange-500" />
      case "link":
        return <ExternalLink className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "Tài liệu chính thức": "bg-blue-100 text-blue-800",
      "Biên bản": "bg-green-100 text-green-800",
      Presentation: "bg-purple-100 text-purple-800",
      Code: "bg-yellow-100 text-yellow-800",
      "Tài liệu học tập": "bg-pink-100 text-pink-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            Tài liệu & Tài nguyên
          </h1>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(resource.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{resource.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{resource.size}</span>
                        <span>•</span>
                        <span>{formatDate(resource.uploadDate)}</span>
                        <span>•</span>
                        <span>{resource.downloadCount} lượt tải</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getCategoryColor(resource.category)} variant="secondary">
                      {resource.category}
                    </Badge>

                    {resource.type === "link" ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Mở
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Không tìm thấy tài liệu nào</p>
            <p className="text-sm">Thử điều chỉnh từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  )
}
