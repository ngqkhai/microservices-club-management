"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { FileText, ArrowLeft, Filter, Search } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { applicationService, Application } from "@/services/application.service"
import { ApplicationDetailDialog } from "@/components/application-detail-dialog"
import Link from "next/link"

export default function ApplicationsPage() {
  const { user, isInitialized } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [applicationDetailOpen, setApplicationDetailOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isInitialized) return

    if (!user) {
      router.push("/login")
      return
    }

    loadApplications()
  }, [user, isInitialized, currentPage, statusFilter])

  const loadApplications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await applicationService.getUserApplications(user.id, {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter === "all" ? undefined : statusFilter
      })

      if (response.success) {
        setApplications(response.data.applications)
        setTotalPages(response.data.pagination.total_pages)
        setTotalItems(response.data.pagination.total_items)
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể tải danh sách đơn ứng tuyển.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      const response = await applicationService.withdrawApplication(applicationId)
      if (response.success) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'withdrawn' as const }
            : app
        ))
        toast({
          title: "Rút đơn thành công",
          description: "Đơn ứng tuyển của bạn đã được rút.",
        })
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể rút đơn ứng tuyển.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể rút đơn ứng tuyển.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      active: "default",
      rejected: "destructive",
      withdrawn: "outline"
    } as const

    const labels = {
      pending: "Đang xử lý",
      active: "Được chấp nhận",
      rejected: "Bị từ chối",
      withdrawn: "Đã rút"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const filteredApplications = applications.filter(app => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        app.club?.name?.toLowerCase().includes(searchLower) ||
        app.campaign?.title?.toLowerCase().includes(searchLower)
      )
      if (!matchesSearch) return false
    }
    
    // Filter by status (if not "all")
    if (statusFilter && statusFilter !== "all") {
      return app.status === statusFilter
    }
    
    return true
  })

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đơn ứng tuyển của tôi</h1>
              <p className="text-gray-600 mt-2">Theo dõi tất cả đơn ứng tuyển của bạn</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên CLB hoặc chiến dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Đang xử lý</SelectItem>
                    <SelectItem value="active">Được chấp nhận</SelectItem>
                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                    <SelectItem value="withdrawn">Đã rút</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || (statusFilter && statusFilter !== "all") ? "Không tìm thấy đơn ứng tuyển" : "Bạn chưa có đơn ứng tuyển nào"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || (statusFilter && statusFilter !== "all")
                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Bắt đầu ứng tuyển vào các câu lạc bộ để thấy đơn ứng tuyển ở đây"
                  }
                </p>
                {!searchTerm && (!statusFilter || statusFilter === "all") && (
                  <Button asChild>
                    <Link href="/clubs">Khám phá câu lạc bộ</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {application.club?.name || 'Không xác định'}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-gray-600 mb-1">
                        {application.campaign?.title || 'Ứng tuyển thành viên'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Nộp ngày {formatDate(application.submitted_at)}
                      </p>
                      {application.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">
                          Lý do từ chối: {application.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedApplicationId(application.id)
                          setApplicationDetailOpen(true)
                        }}
                      >
                        Chi tiết
                      </Button>
                      {application.club?.id && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/clubs/${application.club.id}`}>
                            Xem CLB
                          </Link>
                        </Button>
                      )}
                      {application.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleWithdrawApplication(application.id)}
                        >
                          Rút đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Hiển thị {filteredApplications.length} trong tổng số {totalItems} đơn ứng tuyển
        </div>
      </div>

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        applicationId={selectedApplicationId}
        open={applicationDetailOpen}
        onOpenChange={setApplicationDetailOpen}
        onApplicationUpdated={(updatedApplication) => {
          setApplications(prev => 
            prev.map(app => 
              app.id === updatedApplication.id ? updatedApplication : app
            )
          )
        }}
      />
    </div>
  )
}
