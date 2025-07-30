"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Reply, MoreHorizontal, Flag, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  user: {
    id: string
    name: string
    avatar_url?: string
    role?: string
  }
  content: string
  created_at: string
  updated_at?: string
  likes: number
  is_liked: boolean
  replies: Comment[]
  is_edited: boolean
}

interface EventCommentsProps {
  eventId: string
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "Nguyễn Thị Mai",
      avatar_url: "/placeholder.svg?height=40&width=40",
      role: "Sinh viên năm 3",
    },
    content:
      "Sự kiện này có vẻ rất thú vị! Tôi đã đăng ký và rất mong chờ được tham gia. Có ai biết chương trình chi tiết không?",
    created_at: "2024-03-20T10:30:00Z",
    likes: 12,
    is_liked: false,
    replies: [
      {
        id: "1-1",
        user: {
          id: "user2",
          name: "Trần Văn Nam",
          avatar_url: "/placeholder.svg?height=40&width=40",
          role: "Thành viên CLB",
        },
        content:
          "Chào Mai! Chương trình chi tiết đã được cập nhật trong phần tài liệu đính kèm. Bạn có thể tải về để xem nhé!",
        created_at: "2024-03-20T11:15:00Z",
        likes: 5,
        is_liked: true,
        replies: [],
        is_edited: false,
      },
    ],
    is_edited: false,
  },
  {
    id: "2",
    user: {
      id: "user3",
      name: "Lê Hoàng Minh",
      avatar_url: "/placeholder.svg?height=40&width=40",
      role: "Cựu thành viên",
    },
    content:
      "Năm ngoái tôi cũng tham gia sự kiện tương tự và thực sự rất ấn tượng. Chất lượng biểu diễn rất cao và không khí rất sôi động. Chúc mừng CLB đã tổ chức được sự kiện tuyệt vời như vậy!",
    created_at: "2024-03-19T15:45:00Z",
    likes: 8,
    is_liked: false,
    replies: [],
    is_edited: false,
  },
  {
    id: "3",
    user: {
      id: "user4",
      name: "Phạm Thị Lan",
      avatar_url: "/placeholder.svg?height=40&width=40",
      role: "Sinh viên năm 2",
    },
    content:
      "Mình có thể mang bạn không phải sinh viên trường đến tham gia không? Bạn mình rất thích âm nhạc và muốn đến nghe.",
    created_at: "2024-03-19T09:20:00Z",
    likes: 3,
    is_liked: false,
    replies: [
      {
        id: "3-1",
        user: {
          id: "organizer1",
          name: "Nguyễn Thị Lan Anh",
          avatar_url: "/placeholder.svg?height=40&width=40",
          role: "Ban tổ chức",
        },
        content:
          "Chào Lan! Sự kiện này chỉ dành cho sinh viên và giảng viên trong trường thôi. Tuy nhiên, bạn có thể theo dõi fanpage để cập nhật các sự kiện mở rộng trong tương lai nhé!",
        created_at: "2024-03-19T14:30:00Z",
        likes: 7,
        is_liked: false,
        replies: [],
        is_edited: false,
      },
    ],
    is_edited: false,
  },
]

export function EventComments({ eventId }: EventCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call to load comments
    setTimeout(() => {
      setComments(mockComments)
      setIsLoading(false)
    }, 1000)
  }, [eventId])

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để bình luận.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Nội dung trống",
        description: "Vui lòng nhập nội dung bình luận.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          id: user.id,
          name: user.full_name || user.email,
          avatar_url: user.profile_picture_url,
          role: "Sinh viên",
        },
        content: newComment,
        created_at: new Date().toISOString(),
        likes: 0,
        is_liked: false,
        replies: [],
        is_edited: false,
      }

      setComments((prev) => [comment, ...prev])
      setNewComment("")

      toast({
        title: "Bình luận thành công",
        description: "Bình luận của bạn đã được đăng.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để trả lời bình luận.",
        variant: "destructive",
      })
      return
    }

    if (!replyContent.trim()) {
      toast({
        title: "Nội dung trống",
        description: "Vui lòng nhập nội dung trả lời.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const reply: Comment = {
        id: `${parentId}-${Date.now()}`,
        user: {
          id: user.id,
          name: user.full_name || user.email,
          avatar_url: user.profile_picture_url,
          role: "Sinh viên",
        },
        content: replyContent,
        created_at: new Date().toISOString(),
        likes: 0,
        is_liked: false,
        replies: [],
        is_edited: false,
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
        ),
      )

      setReplyContent("")
      setReplyingTo(null)

      toast({
        title: "Trả lời thành công",
        description: "Trả lời của bạn đã được đăng.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng trả lời. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string, isReply = false, parentId?: string) => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để thích bình luận.",
        variant: "destructive",
      })
      return
    }

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          is_liked: !reply.is_liked,
                          likes: reply.is_liked ? reply.likes - 1 : reply.likes + 1,
                        }
                      : reply,
                  ),
                }
              : comment,
          ),
        )
      } else {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  is_liked: !comment.is_liked,
                  likes: comment.is_liked ? comment.likes - 1 : comment.likes + 1,
                }
              : comment,
          ),
        )
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thích bình luận. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Vừa xong"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return date.toLocaleDateString("vi-VN")
  }

  const CommentItem = ({
    comment,
    isReply = false,
    parentId,
  }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`flex space-x-3 ${isReply ? "ml-12 mt-4" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} alt={comment.user.name} />
        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{comment.user.name}</span>
              {comment.user.role && (
                <Badge variant="secondary" className="text-xs">
                  {comment.user.role}
                </Badge>
              )}
              {comment.is_edited && <span className="text-xs text-gray-500">(đã chỉnh sửa)</span>}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user && user.id === comment.user.id ? (
                  <>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Báo cáo
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span>{formatTimeAgo(comment.created_at)}</span>

          <button
            onClick={() => handleLikeComment(comment.id, isReply, parentId)}
            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
              comment.is_liked ? "text-red-500" : ""
            }`}
          >
            <Heart className={`h-3 w-3 ${comment.is_liked ? "fill-current" : ""}`} />
            <span>{comment.likes}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
            >
              <Reply className="h-3 w-3" />
              <span>Trả lời</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết trả lời..."
              rows={2}
              className="text-sm"
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? "Đang gửi..." : "Trả lời"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Bình luận
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Bình luận ({comments.length})
        </CardTitle>
        <CardDescription>Chia sẻ ý kiến và đặt câu hỏi về sự kiện</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận"}
            rows={3}
            disabled={!user}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim() || !user}>
              {isSubmitting ? "Đang đăng..." : "Đăng bình luận"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có bình luận nào</p>
              <p className="text-sm">Hãy là người đầu tiên bình luận về sự kiện này!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
