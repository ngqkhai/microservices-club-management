"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  MapPin,
  ArrowLeft,
  Download,
  Mail,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Registration {
  _id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar?: string
  registration_date: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  payment_status: "pending" | "paid" | "refunded"
  notes?: string
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
}

export default function EventRegistrationsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clubId = params.club_id as string
  const eventId = params.event_id as string

  const [isLoading, setIsLoading] = useState(true)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadRegistrations()
  }, [eventId])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter])

  const loadRegistrations = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock registrations data
      const mockRegistrations: Registration[] = [
        {
          _id: "reg-1",
          user_id: "user-1",
          user_name: "Nguyễn Văn A",
          user_email: "nguyenvana@example.com",
          user_avatar: "/placeholder-user.jpg",
          registration_date: "2024-03-10T10:30:00Z",
          status: "approved",
          payment_status: "paid",
          notes: "Sinh viên năm 3",
          emergency_contact: {
            name: "Nguyễn Thị B",
            phone: "0123456789",
            relationship: "Mẹ",
          },
        },
        {
          _id: "reg-2",
          user_id: "user-2",
          user_name: "Trần Thị C",
          user_email: "tranthic@example.com",
          user_avatar: "/placeholder-user.jpg",
          registration_date: "2024-03-11T14:20:00Z",
          status: "pending",
          payment_status: "pending",
          notes: "Sinh viên năm 2",
          emergency_contact: {
            name: "Trần Văn D",
            phone: "0987654321",
            relationship: "Bố",
          },
        },
        {
          _id: "reg-3",
          user_id: "user-3",
          user_name: "Lê Văn E",
          user_email: "levane@example.com",
          user_avatar: "/placeholder-user.jpg",
          registration_date: "2024-03-12T09:15:00Z",
          status: "rejected",
          payment_status: "refunded",
          notes: "Đã hủy do lý do cá nhân",
        },
      ]

      setRegistrations(mockRegistrations)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đăng ký.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = registrations

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === statusFilter)
    }

    setFilteredRegistrations(filtered)
  }

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedRegistrations = registrations.map((reg) =>
        reg._id === registrationId ? { ...reg, status: newStatus as any } : reg
      )
      setRegistrations(updatedRegistrations)

      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Đăng ký đã được ${getStatusLabel(newStatus).toLowerCase()}.`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" as const },
      approved: { label: "Đã duyệt", variant: "default" as const },
      rejected: { label: "Từ chối", variant: "destructive" as const },
      cancelled: { label: "Đã hủy", variant: "outline" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ thanh toán", variant: "secondary" as const },
      paid: { label: "Đã thanh toán", variant: "default" as const },
      refunded: { label: "Đã hoàn tiền", variant: "outline" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusLabel = (status: string) => {
    const statusConfig = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      cancelled: "Đã hủy",
    }

    return statusConfig[status as keyof typeof statusConfig] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAvailableActions = (status: string) => {
    const actions = []
    
    // Always available actions
    actions.push("view")
    
    // Status-specific actions
    switch (status) {
      case "pending":
        actions.push("approve", "reject")
        break
      case "approved":
        actions.push("reject")
        break
      case "rejected":
        actions.push("approve")
        break
    }
    
    return actions
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/clubs">Câu lạc bộ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/clubs/${clubId}`}>Club Detail</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/clubs/${clubId}/manage`}>Quản lý</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý đăng ký</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý đăng ký sự kiện</h1>
              <p className="mt-2 text-gray-600">Spring Concert 2024</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất danh sách
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Gửi email
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Tổng đăng ký</p>
                  <p className="text-2xl font-bold">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Đã duyệt</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Từ chối</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đăng ký ({filteredRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Không có đăng ký nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người đăng ký</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thanh toán</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={registration.user_avatar} alt={registration.user_name} />
                              <AvatarFallback>{registration.user_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{registration.user_name}</div>
                              <div className="text-sm text-gray-500">{registration.user_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(registration.registration_date)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(registration.payment_status)}</TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {registration.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {getAvailableActions(registration.status).map((action) => {
                                switch (action) {
                                  case "view":
                                    return (
                                      <DropdownMenuItem
                                        key={action}
                                        onClick={() => {
                                          setSelectedRegistration(registration)
                                          setShowDetailDialog(true)
                                        }}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Xem chi tiết
                                      </DropdownMenuItem>
                                    )
                                  case "approve":
                                    return (
                                      <DropdownMenuItem
                                        key={action}
                                        onClick={() => handleStatusChange(registration._id, "approved")}
                                        disabled={isLoading}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Duyệt
                                      </DropdownMenuItem>
                                    )
                                  case "reject":
                                    return (
                                      <DropdownMenuItem
                                        key={action}
                                        onClick={() => handleStatusChange(registration._id, "rejected")}
                                        disabled={isLoading}
                                        className="text-red-600"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Từ chối
                                      </DropdownMenuItem>
                                    )
                                  default:
                                    return null
                                }
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đăng ký</DialogTitle>
              <DialogDescription>Thông tin chi tiết về đăng ký sự kiện</DialogDescription>
            </DialogHeader>
            {selectedRegistration && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedRegistration.user_avatar} alt={selectedRegistration.user_name} />
                    <AvatarFallback>{selectedRegistration.user_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRegistration.user_name}</h3>
                    <p className="text-gray-600">{selectedRegistration.user_email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày đăng ký</label>
                    <p className="text-sm">{formatDate(selectedRegistration.registration_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Thanh toán</label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedRegistration.payment_status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                    <p className="text-sm">{selectedRegistration.notes || "-"}</p>
                  </div>
                </div>

                {selectedRegistration.emergency_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Liên hệ khẩn cấp</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Tên:</span> {selectedRegistration.emergency_contact.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">SĐT:</span> {selectedRegistration.emergency_contact.phone}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Quan hệ:</span> {selectedRegistration.emergency_contact.relationship}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                    Đóng
                  </Button>
                  {selectedRegistration.status === "pending" && (
                    <>
                      <Button
                        onClick={() => {
                          handleStatusChange(selectedRegistration._id, "approved")
                          setShowDetailDialog(false)
                        }}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleStatusChange(selectedRegistration._id, "rejected")
                          setShowDetailDialog(false)
                        }}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 