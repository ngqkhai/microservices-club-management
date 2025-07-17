"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Pin, ImageIcon, BarChart3 } from "lucide-react"

interface ClubDiscussionProps {
  clubId: string
}

// Mock discussion posts
const mockPosts = [
  {
    id: "1",
    type: "announcement",
    author: {
      name: "Nguyễn Văn Admin",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "manager",
    },
    content: "Chào mừng tất cả thành viên mới! Hãy tham gia buổi orientation vào thứ 6 tới.",
    timestamp: "2 giờ trước",
    isPinned: true,
    likes: 12,
    comments: 3,
  },
  {
    id: "2",
    type: "post",
    author: {
      name: "Trần Thị Bình",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
    },
    content: "Mình vừa hoàn thành project React đầu tiên! Cảm ơn mọi người đã hỗ trợ 🎉",
    timestamp: "5 giờ trước",
    isPinned: false,
    likes: 8,
    comments: 5,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    type: "poll",
    author: {
      name: "Lê Minh Cường",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
    },
    content: "Chúng ta nên tổ chức workshop về chủ đề gì tiếp theo?",
    timestamp: "1 ngày trước",
    isPinned: false,
    likes: 15,
    comments: 8,
    poll: {
      options: [
        { text: "Machine Learning", votes: 12 },
        { text: "Web Development", votes: 8 },
        { text: "Mobile App", votes: 5 },
      ],
    },
  },
]

export function ClubDiscussion({ clubId }: ClubDiscussionProps) {
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState(mockPosts)

  const handleSubmitPost = () => {
    if (!newPost.trim()) return

    const post = {
      id: Date.now().toString(),
      type: "post" as const,
      author: {
        name: "Bạn",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member" as const,
      },
      content: newPost,
      timestamp: "Vừa xong",
      isPinned: false,
      likes: 0,
      comments: 0,
    }

    setPosts([post, ...posts])
    setNewPost("")
  }

  const getRoleColor = (role: string) => {
    return role === "manager" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Thảo luận
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Post Creation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Chia sẻ suy nghĩ của bạn..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Ảnh
                    </Button>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Bình chọn
                    </Button>
                  </div>
                  <Button onClick={handleSubmitPost} disabled={!newPost.trim()} size="sm">
                    Đăng
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => (
          <Card key={post.id} className={post.isPinned ? "border-yellow-200 bg-yellow-50" : ""}>
            <CardContent className="p-4">
              {post.isPinned && (
                <div className="flex items-center mb-3 text-yellow-700">
                  <Pin className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Tin ghim</span>
                </div>
              )}

              <div className="flex space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{post.author.name}</span>
                    <Badge className={getRoleColor(post.author.role)} variant="secondary">
                      {post.author.role === "manager" ? "Quản lý" : "Thành viên"}
                    </Badge>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                  </div>

                  <p className="text-gray-700 mb-3">{post.content}</p>

                  {post.image && (
                    <div className="mb-3">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post image"
                        className="rounded-lg max-w-md w-full h-auto"
                      />
                    </div>
                  )}

                  {post.poll && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        {post.poll.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{option.text}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(option.votes / Math.max(...post.poll!.options.map((o) => o.votes))) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500">{option.votes}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-gray-500">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                      <Share2 className="h-4 w-4 mr-1" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
