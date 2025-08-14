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
import { eventService } from "@/services/event.service"

interface Registration {
  _id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar?: string
  registration_date: string
  status: "registered" | "attended" | "cancelled"
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
  const [eventTitle, setEventTitle] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(20)
  const [total, setTotal] = useState<number>(0)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  useEffect(() => {
    loadRegistrations()
    loadEventTitle()
  }, [eventId, page, limit])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter])

  const loadRegistrations = async () => {
    setIsLoading(true)
    try {
      const query: any = { page, limit }
      if (statusFilter !== 'all') query.status = statusFilter
      const res = await eventService.getEventRegistrations(eventId as string, query)
      if (res && res.success && res.data) {
        const items = (res.data.registrations || []).map((r: any) => ({
          _id: r._id || r.id,
          user_id: r.user_id,
          user_name: r.user_name || r.user?.name || 'Unknown',
          user_email: r.user_email || r.user?.email || 'unknown@example.com',
          user_avatar: r.user_avatar || r.user?.avatar,
          registration_date: r.registered_at || r.created_at || r.registration_date,
          status: (r.status === 'approved' ? 'registered' : r.status) as Registration['status'],
          payment_status: r.payment_status || 'pending',
          notes: r.notes,
          emergency_contact: r.emergency_contact,
        })) as Registration[]
        setRegistrations(items)
        const meta = (res.data as any).meta || {}
        setTotal(meta.total || items.length)
        if (meta.limit) setLimit(meta.limit)
        if (meta.page) setPage(meta.page)
      } else {
        setRegistrations([])
        setTotal(0)
      }
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

  const loadEventTitle = async () => {
    try {
      const ev = await eventService.getEvent(eventId as string)
      if (ev.success && ev.data?.title) setEventTitle(ev.data.title)
    } catch {}
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

  const handleStatusChange = async (registrationId: string, newStatus: Registration['status']) => {
    setIsLoading(true)
    try {
      const res = await eventService.updateRegistrationStatus(eventId as string, registrationId, newStatus)
      if (!res || !res.success) {
        throw new Error('Cập nhật thất bại')
      }

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

  const getStatusBadge = (status: Registration['status']) => {
    const statusConfig: Record<Registration['status'], { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
      registered: { 
        label: "Đã đăng ký", 
        variant: "default",
        className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
      },
      attended: { 
        label: "Đã điểm danh", 
        variant: "secondary",
        className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      },
      cancelled: { 
        label: "Đã hủy", 
        variant: "outline",
        className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      },
    }
    const config = statusConfig[status] || { label: String(status), variant: "secondary" }
    return (
      <Badge 
        variant={config.variant} 
        className={config.className}
      >
        {config.label}
      </Badge>
    )
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

  const getStatusLabel = (status: Registration['status']) => {
    const statusConfig: Record<Registration['status'], string> = {
      registered: "Đã đăng ký",
      attended: "Đã điểm danh",
      cancelled: "Đã hủy",
    }
    return statusConfig[status] || String(status)
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

  const getAvailableActions = (status: Registration['status']) => {
    const actions: Array<'view' | 'mark_attended' | 'mark_registered' | 'cancel'> = ['view']
    switch (status) {
      case 'registered':
        actions.push('mark_attended', 'cancel')
        break
      case 'attended':
        actions.push('mark_registered')
        break
      case 'cancelled':
        actions.push('mark_registered')
        break
    }
    return actions
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    return (parts[0]?.[0] || 'U').toUpperCase()
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
              <p className="mt-2 text-gray-600">{eventTitle || 'Sự kiện'}</p>
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
              <SelectItem value="registered">Đã đăng ký</SelectItem>
              <SelectItem value="attended">Đã điểm danh</SelectItem>
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
                  <p className="text-sm text-gray-600">Đã đăng ký</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === "registered").length}
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
                   <p className="text-sm text-gray-600">Đã điểm danh</p>
                  <p className="text-2xl font-bold">
                     {registrations.filter(r => r.status === "attended").length}
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
                   <p className="text-sm text-gray-600">Đã hủy</p>
                  <p className="text-2xl font-bold">
                     {registrations.filter(r => r.status === "cancelled").length}
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
                                <AvatarFallback>{getInitials(registration.user_name)}</AvatarFallback>
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
                                  case "mark_attended":
                                    return (
                                      <DropdownMenuItem
                                        key={action}
                                        onClick={() => handleStatusChange(registration._id, "attended")}
                                        disabled={isLoading}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Đánh dấu đã điểm danh
                                      </DropdownMenuItem>
                                    )
                                  case "mark_registered":
                                    return (
                                      <DropdownMenuItem
                                        key={action}
                                        onClick={() => handleStatusChange(registration._id, "registered")}
                                        disabled={isLoading}
                                      >
                                        <Users className="h-4 w-4 mr-2" />
                                        Đánh dấu đã đăng ký
                                      </DropdownMenuItem>
                                    )
                                  case "cancel":
                                    return (
                                      <DropdownMenuItem
                                        key={action}
                                        onClick={() => handleStatusChange(registration._id, "cancelled")}
                                        disabled={isLoading}
                                        className="text-red-600"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Hủy đăng ký
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Trang {page} / {totalPages} • Tổng {total}
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Trang trước
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages || isLoading} onClick={() => setPage((p) => p + 1)}>
              Trang sau
            </Button>
          </div>
        </div>

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
                  {selectedRegistration.status === "registered" && (
                    <>
                      <Button
                        onClick={() => {
                          handleStatusChange(selectedRegistration._id, "attended")
                          setShowDetailDialog(false)
                        }}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Đánh dấu đã điểm danh
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleStatusChange(selectedRegistration._id, "cancelled")
                          setShowDetailDialog(false)
                        }}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Hủy đăng ký
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