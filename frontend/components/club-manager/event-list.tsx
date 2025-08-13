"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  X,
  Play,
  Pause,
  CheckCircle,
  RefreshCw,
  QrCode,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { eventService } from "@/services/event.service"
import { useRouter } from "next/navigation"

interface Event {
  _id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  max_participants: number
  current_participants: number
  status: string
  fee: number
  category: string
  event_type: string
  created_at: string
  updated_at: string
}

interface EventListProps {
  events: Event[]
  clubId: string
  onEventUpdate: (updatedEvents: Event[]) => void
}

export function EventList({ events: initialEvents, clubId, onEventUpdate }: EventListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(initialEvents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [pendingStatusChange, setPendingStatusChange] = useState<{eventId: string, newStatus: string} | null>(null)
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<Event | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  // Available status options
  const statusOptions = [
    { value: 'draft', label: 'Bản nháp', color: 'bg-gray-500' },
    { value: 'published', label: 'Đã xuất bản', color: 'bg-green-600' },
    { value: 'ongoing', label: 'Đang diễn ra', color: 'bg-blue-600' },
    { value: 'completed', label: 'Đã kết thúc', color: 'bg-purple-600' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-600' },
    { value: 'hidden', label: 'Đã ẩn', color: 'bg-gray-400' }
  ]

  useEffect(() => {
    setEvents(initialEvents)
    setFilteredEvents(initialEvents)
  }, [initialEvents])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, selectedStatuses])

  const filterEvents = () => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((event) => selectedStatuses.includes(event.status))
    }

    setFilteredEvents(filtered)
  }

  const handleStatusToggle = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses(prev => [...prev, status])
    } else {
      setSelectedStatuses(prev => prev.filter(s => s !== status))
    }
  }

  const clearFilters = () => {
    setSelectedStatuses([])
    setSearchTerm("")
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/clubs/${clubId}/manage/events/${eventId}/edit`)
  }

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowViewDialog(true)
  }

  const handleManageRegistrations = (eventId: string) => {
    router.push(`/clubs/${clubId}/manage/events/${eventId}/registrations`)
  }

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      const res = await eventService.updateEvent(eventId, { /* status update */ } as any)
      if (!res.success) {
        throw new Error(res.message || 'Failed to update status')
      }

      const updatedEvents = events.map((event) =>
        event._id === eventId ? { ...event, status: newStatus } : event
      )
      setEvents(updatedEvents)
      onEventUpdate(updatedEvents)

      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Sự kiện đã được ${getStatusLabel(newStatus).toLowerCase()}.`,
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChangeRequest = (eventId: string, newStatus: string) => {
    setPendingStatusChange({ eventId, newStatus })
    setShowStatusDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return
    
    await handleStatusChange(pendingStatusChange.eventId, pendingStatusChange.newStatus)
    setShowStatusDialog(false)
    setPendingStatusChange(null)
  }

  const handleDeleteRequest = (event: Event) => {
    setPendingDeleteEvent(event)
    setDeleteConfirmText("")
    setShowDeleteDialog(true)
  }

  const confirmDeleteEvent = async () => {
    if (!pendingDeleteEvent || deleteConfirmText !== "delete") return

    setIsLoading(true)
    try {
      const res = await eventService.deleteEvent(pendingDeleteEvent._id)
      if (!res.success) {
        throw new Error(res.message || 'Failed to delete event')
      }

      const updatedEvents = events.filter((event) => event._id !== pendingDeleteEvent._id)
      setEvents(updatedEvents)
      onEventUpdate(updatedEvents)

      toast({
        title: "Xóa sự kiện thành công",
        description: "Sự kiện đã được xóa.",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa sự kiện. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setPendingDeleteEvent(null)
      setDeleteConfirmText("")
    }
  }

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    if (!option) return <Badge variant="secondary">{status}</Badge>
    
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${option.color}`} />
        <span>{option.label}</span>
      </Badge>
    )
  }

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.label : status
  }

  const getAvailableActions = (status: string) => {
    const actions = []
    
    // Always available actions
    actions.push("view", "registrations")
    
    // Status-specific actions
    switch (status) {
      case "draft":
        actions.push("publish")
        break
      case "published":
        actions.push("pause", "complete", "checkin")
        break
      case "ongoing":
        actions.push("complete", "pause", "checkin")
        break
      case "paused":
        actions.push("resume", "complete")
        break
      case "completed":
        // No additional actions
        break
      case "cancelled":
        actions.push("restore")
        break
      case "hidden":
        actions.push("restore")
        break
    }
    
    // Delete is always available except for completed events
    if (status !== "completed") {
      actions.push("delete")
    }
    
    return actions
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRegistrationProgress = (current: number, max: number) => {
    if (max === 0) return 0
    return Math.round((current / max) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={isLoading} className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>
                  Lọc trạng thái 
                  {selectedStatuses.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {selectedStatuses.length}
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Trạng thái sự kiện</h4>
                  {selectedStatuses.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Xóa tất cả
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={selectedStatuses.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleStatusToggle(option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={option.value} 
                        className="flex items-center space-x-2 text-sm font-normal cursor-pointer"
                      >
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        <span>{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Show selected filters */}
          {selectedStatuses.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Đã chọn:</span>
              <div className="flex items-center space-x-1">
                {selectedStatuses.map((status) => {
                  const option = statusOptions.find(opt => opt.value === status)
                  return option ? (
                    <Badge 
                      key={status} 
                      variant="secondary" 
                      className="text-xs px-2 py-1 flex items-center space-x-1"
                    >
                      <div className={`w-2 h-2 rounded-full ${option.color}`} />
                      <span>{option.label}</span>
                      <button
                        onClick={() => handleStatusToggle(status, false)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-4">
        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Hiển thị {filteredEvents.length} sự kiện
            {selectedStatuses.length > 0 && (
              <span> (đã lọc từ {events.length} sự kiện)</span>
            )}
          </span>
          {isLoading && (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Đang tải...</span>
            </span>
          )}
        </div>

        {!isLoading && filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {selectedStatuses.length > 0 ? (
                <div>
                  <p>Không có sự kiện nào với trạng thái đã chọn.</p>
                  <Button 
                    variant="link" 
                    className="mt-2 p-0 h-auto text-blue-600"
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc để xem tất cả sự kiện
                  </Button>
                </div>
              ) : (
                <p>Chưa có sự kiện nào.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {getStatusBadge(event.status)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {getAvailableActions(event.status).map((action) => {
                        switch (action) {
                          case "checkin":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => router.push(`/clubs/${clubId}/manage/events/${event._id}/check-in`)}
                                disabled={isLoading}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                Điểm danh (QR)
                              </DropdownMenuItem>
                            )
                          case "publish":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleStatusChangeRequest(event._id, "published")}
                                disabled={isLoading}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Xuất bản
                              </DropdownMenuItem>
                            )
                          case "pause":
                            return (
                              <DropdownMenuItem 
                                key={action} 
                                onClick={() => handleStatusChangeRequest(event._id, "paused")}
                                disabled={isLoading}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Tạm dừng
                              </DropdownMenuItem>
                            )
                          case "resume":
                            return (
                              <DropdownMenuItem 
                                key={action} 
                                onClick={() => handleStatusChangeRequest(event._id, "ongoing")}
                                disabled={isLoading}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Tiếp tục
                              </DropdownMenuItem>
                            )
                          case "complete":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleStatusChangeRequest(event._id, "completed")}
                                disabled={isLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Hoàn thành
                              </DropdownMenuItem>
                            )
                          case "restore":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleStatusChangeRequest(event._id, "published")}
                                disabled={isLoading}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Khôi phục
                              </DropdownMenuItem>
                            )
                          case "view":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => router.push(`/events/${event._id}`)}
                                disabled={isLoading}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                            )
                          case "registrations":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleManageRegistrations(event._id)}
                                disabled={isLoading}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Quản lý đăng ký
                              </DropdownMenuItem>
                            )
                          case "delete":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleDeleteRequest(event)}
                                disabled={isLoading}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            )
                          default:
                            return null
                        }
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {event.current_participants}
                      {event.max_participants && ` / ${event.max_participants}`} người đăng ký
                    </span>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleEditEvent(event._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleViewEvent(event)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Event Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sự kiện</DialogTitle>
            <DialogDescription>Thông tin chi tiết về sự kiện</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian</label>
                  <p className="text-sm">
                    {formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Địa điểm</label>
                  <p className="text-sm">{selectedEvent.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Đăng ký</label>
                  <p className="text-sm">
                    {selectedEvent.current_participants}/{selectedEvent.max_participants}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phí tham gia</label>
                  <p className="text-sm">
                    {selectedEvent.fee === 0 ? "Miễn phí" : `${selectedEvent.fee.toLocaleString("vi-VN")} VNĐ`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Danh mục</label>
                  <p className="text-sm">{selectedEvent.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại sự kiện</label>
                  <p className="text-sm">{selectedEvent.event_type}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Đóng
                </Button>
                <Button 
                  onClick={() => {
                    setShowViewDialog(false)
                    handleEditEvent(selectedEvent._id)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={pendingStatusChange?.newStatus === "completed" ? "text-green-600" : 
              pendingStatusChange?.newStatus === "paused" ? "text-orange-600" : 
              pendingStatusChange?.newStatus === "published" ? "text-green-600" : 
              pendingStatusChange?.newStatus === "ongoing" ? "text-blue-600" : "text-gray-600"}>
              Xác nhận thay đổi trạng thái
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {pendingStatusChange?.newStatus === "published" ? "xuất bản" : 
                pendingStatusChange?.newStatus === "paused" ? "tạm dừng" :
                pendingStatusChange?.newStatus === "ongoing" ? "tiếp tục" :
                pendingStatusChange?.newStatus === "completed" ? "hoàn thành" : "khôi phục"} sự kiện này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button 
              onClick={confirmStatusChange} 
              disabled={isLoading}
              className={pendingStatusChange?.newStatus === "completed" ? "bg-green-600 hover:bg-green-700" : 
                pendingStatusChange?.newStatus === "paused" ? "bg-orange-600 hover:bg-orange-700" : 
                pendingStatusChange?.newStatus === "published" ? "bg-green-600 hover:bg-green-700" : 
                pendingStatusChange?.newStatus === "ongoing" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sự kiện</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sự kiện "{pendingDeleteEvent?.title}"? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nhập "delete" để xác nhận xóa:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button 
              onClick={confirmDeleteEvent} 
              disabled={isLoading || deleteConfirmText !== "delete"}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Đang xóa..." : "Xóa sự kiện"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
} 