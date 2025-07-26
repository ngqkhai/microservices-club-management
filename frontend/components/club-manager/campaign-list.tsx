"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, Edit, Trash2, Play, Pause, CheckCircle, MoreHorizontal, Eye, Filter, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { clubService, type Campaign } from "@/services/club.service"

interface CampaignListItem {
  _id: string
  title: string
  status: string
  start_date: string
  end_date: string
  total_applications: number
  max_applications?: number
}

interface CampaignListProps {
  campaigns: CampaignListItem[]
  clubId: string
  onCampaignUpdate: (campaigns: CampaignListItem[]) => void
}

export function CampaignList({ campaigns: initialCampaigns, clubId, onCampaignUpdate }: CampaignListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>(initialCampaigns)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false)
  const [applicationDetailModalOpen, setApplicationDetailModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaignApplications, setCampaignApplications] = useState<any[]>([])
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState<any>(null)
  const [loadingModal, setLoadingModal] = useState(false)

  // Available status options
  const statusOptions = [
    { value: 'draft', label: 'Bản nháp', color: 'bg-gray-500' },
    { value: 'published', label: 'Đã xuất bản', color: 'bg-green-600' },
    { value: 'paused', label: 'Tạm dừng', color: 'bg-yellow-600' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-blue-600' }
  ]

  // Update campaigns when initialCampaigns changes
  useEffect(() => {
    setCampaigns(initialCampaigns)
  }, [initialCampaigns])

  // Load campaigns with status filter
  const loadCampaigns = async (statuses?: string[]) => {
    setIsLoading(true)
    try {
      // If no statuses selected, load all campaigns
      const statusParam = statuses && statuses.length > 0 ? statuses.join(',') : undefined
      
      const response = await clubService.getClubCampaigns(clubId, {
        status: statusParam,
        page: 1,
        limit: 50
      })

      if (response.success && response.data) {
        const transformedCampaigns = response.data.campaigns.map(campaign => ({
          _id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          total_applications: campaign.statistics?.total_applications || 0,
          max_applications: campaign.max_applications,
        }))
        
        setCampaigns(transformedCampaigns)
        onCampaignUpdate(transformedCampaigns)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách chiến dịch.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle status filter change
  const handleStatusFilterChange = (statuses: string[]) => {
    setSelectedStatuses(statuses)
    loadCampaigns(statuses)
  }

  // Handle individual status toggle
  const handleStatusToggle = (status: string, checked: boolean) => {
    let newStatuses: string[]
    if (checked) {
      newStatuses = [...selectedStatuses, status]
    } else {
      newStatuses = selectedStatuses.filter(s => s !== status)
    }
    handleStatusFilterChange(newStatuses)
  }

  // Clear all filters
  const clearFilters = () => {
    handleStatusFilterChange([])
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    return selectedStatuses.length === 0 || selectedStatuses.includes(campaign.status)
  })

  // Handle campaign edit modal
  const handleEditCampaign = async (campaignId: string) => {
    setLoadingModal(true)
    try {
      const response = await clubService.getCampaignDetail(clubId, campaignId)
      if (response.success && response.data) {
        setSelectedCampaign(response.data)
        setEditModalOpen(true)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin chiến dịch.",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  // Handle view applications modal
  const handleViewApplications = async (campaignId: string) => {
    setLoadingModal(true)
    try {
      // Get campaign details first
      const campaignResponse = await clubService.getCampaignDetail(clubId, campaignId)
      if (campaignResponse.success && campaignResponse.data) {
        setSelectedCampaign(campaignResponse.data)
      }

      // Get applications using the API endpoint from documentation
      const response = await clubService.getCampaignApplications(clubId, campaignId, {
        page: 1,
        limit: 50
      })
      
      if (response.success && response.data) {
        setCampaignApplications(response.data.applications || [])
        setApplicationsModalOpen(true)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  // Handle campaign update
  const handleUpdateCampaign = async (updatedData: Partial<Campaign>) => {
    if (!selectedCampaign) return

    setLoadingModal(true)
    try {
      const response = await clubService.updateCampaign(clubId, selectedCampaign.id, updatedData)
      
      if (response.success && response.data) {
        // Update local campaigns list
        const updatedCampaigns = campaigns.map(campaign => 
          campaign._id === selectedCampaign.id 
            ? {
                ...campaign,
                title: response.data.title,
                status: response.data.status,
                start_date: response.data.start_date,
                end_date: response.data.end_date,
                total_applications: response.data.statistics?.total_applications || campaign.total_applications,
                max_applications: response.data.max_applications
              }
            : campaign
        )
        
        setCampaigns(updatedCampaigns)
        onCampaignUpdate(updatedCampaigns)
        setEditModalOpen(false)
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin chiến dịch.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật chiến dịch.",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  // Handle view application detail
  const handleViewApplicationDetail = async (applicationId: string) => {
    if (!selectedCampaign) return
    
    setLoadingModal(true)
    try {
      const response = await clubService.getApplicationDetail(clubId, selectedCampaign.id, applicationId)
      
      if (response.success && response.data) {
        setSelectedApplicationDetail(response.data)
        setApplicationDetailModalOpen(true)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  // Handle approve application
  const handleApproveApplication = async (applicationId: string) => {
    setLoadingModal(true)
    try {
      const response = await clubService.approveApplication(clubId, applicationId, {
        role: 'member',
        notes: 'Đơn ứng tuyển đã được duyệt.'
      })

      if (response.success) {
        // Update the application status in the local state
        setSelectedApplicationDetail({
          ...selectedApplicationDetail,
          status: 'approved'
        })

        // Refresh the applications list
        if (selectedCampaign) {
          await handleViewApplications(selectedCampaign.id)
        }

        toast({
          title: "Thành công",
          description: "Đã duyệt đơn ứng tuyển và thêm thành viên vào câu lạc bộ.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể duyệt đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  // Handle reject application
  const handleRejectApplication = async (applicationId: string, reason?: string) => {
    setLoadingModal(true)
    try {
      const response = await clubService.rejectApplication(clubId, applicationId, {
        reason: reason || 'other',
        notes: 'Đơn ứng tuyển không đáp ứng yêu cầu của câu lạc bộ.'
      })

      if (response.success) {
        // Update the application status in the local state
        setSelectedApplicationDetail({
          ...selectedApplicationDetail,
          status: 'rejected'
        })

        // Refresh the applications list
        if (selectedCampaign) {
          await handleViewApplications(selectedCampaign.id)
        }

        toast({
          title: "Thành công",
          description: "Đã từ chối đơn ứng tuyển.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể từ chối đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setLoadingModal(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-600">Đã xuất bản</Badge>
      case "draft":
        return <Badge variant="secondary">Bản nháp</Badge>
      case "paused":
        return <Badge variant="outline">Tạm dừng</Badge>
      case "completed":
        return <Badge className="bg-blue-600">Hoàn thành</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleStatusChange = async (campaignId: string, action: string) => {
    try {
      setIsLoading(true)
      
      // Call API to update campaign status
      const response = await clubService.updateCampaignStatus(
        clubId, 
        campaignId, 
        action as 'publish' | 'pause' | 'resume' | 'complete'
      )

      if (response.success) {
        // Update local state
        const updatedCampaigns = campaigns.map((campaign) => {
          if (campaign._id === campaignId) {
            let newStatus = campaign.status
            switch (action) {
              case "publish":
                newStatus = "published"
                break
              case "pause":
                newStatus = "paused"
                break
              case "resume":
                newStatus = "published"
                break
              case "complete":
                newStatus = "completed"
                break
            }
            return { ...campaign, status: newStatus }
          }
          return campaign
        })

        setCampaigns(updatedCampaigns)
        onCampaignUpdate(updatedCampaigns)

        toast({
          title: "Thành công",
          description: "Đã cập nhật trạng thái chiến dịch.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái chiến dịch.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      setIsLoading(true)
      
      // Call API to delete campaign
      const response = await clubService.deleteCampaign(clubId, campaignId)

      if (response.success) {
        const updatedCampaigns = campaigns.filter((campaign) => campaign._id !== campaignId)
        setCampaigns(updatedCampaigns)
        onCampaignUpdate(updatedCampaigns)

        toast({
          title: "Thành công",
          description: "Đã xóa chiến dịch.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa chiến dịch.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailableActions = (status: string) => {
    switch (status) {
      case "draft":
        return ["publish", "edit", "view", "delete"]
      case "published":
        return ["pause", "complete", "edit", "view"]
      case "paused":
        return ["resume", "complete", "edit", "view"]
      case "completed":
        return ["view"]
      default:
        return ["view"] // Always show "Xem đơn" for all campaigns
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
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
                  <h4 className="font-medium text-sm">Trạng thái chiến dịch</h4>
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

      {/* Campaign List */}
      <div className="space-y-4">
        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Hiển thị {filteredCampaigns.length} chiến dịch
            {selectedStatuses.length > 0 && (
              <span> (đã lọc từ {campaigns.length} chiến dịch)</span>
            )}
          </span>
          {isLoading && (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Đang tải...</span>
            </span>
          )}
        </div>

        {!isLoading && filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {selectedStatuses.length > 0 ? (
                <div>
                  <p>Không có chiến dịch nào với trạng thái đã chọn.</p>
                  <Button 
                    variant="link" 
                    className="mt-2 p-0 h-auto text-blue-600"
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc để xem tất cả chiến dịch
                  </Button>
                </div>
              ) : (
                <p>Chưa có chiến dịch nào.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {getAvailableActions(campaign.status).map((action) => {
                        switch (action) {
                          case "publish":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleStatusChange(campaign._id, "publish")}
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
                                onClick={() => handleStatusChange(campaign._id, "pause")}
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
                                onClick={() => handleStatusChange(campaign._id, "resume")}
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
                                onClick={() => handleStatusChange(campaign._id, "complete")}
                                disabled={isLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Hoàn thành
                              </DropdownMenuItem>
                            )
                          case "edit":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleEditCampaign(campaign._id)}
                                disabled={isLoading || loadingModal}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )
                          case "view":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleViewApplications(campaign._id)}
                                disabled={isLoading || loadingModal}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem đơn ứng tuyển
                              </DropdownMenuItem>
                            )
                          case "delete":
                            return (
                              <AlertDialog key={action}>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-600"
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa chiến dịch</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa chiến dịch "{campaign.title}"? Hành động này không thể
                                      hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCampaign(campaign._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={isLoading}
                                    >
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
                      {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {campaign.total_applications}
                      {campaign.max_applications && ` / ${campaign.max_applications}`} đơn ứng tuyển
                    </span>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading || loadingModal}
                      onClick={() => handleEditCampaign(campaign._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading || loadingModal}
                      onClick={() => handleViewApplications(campaign._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem đơn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Campaign Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chiến dịch</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Tiêu đề chiến dịch</label>
                  <Input 
                    value={selectedCampaign.title}
                    onChange={(e) => setSelectedCampaign({...selectedCampaign, title: e.target.value})}
                    placeholder="Nhập tiêu đề chiến dịch"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea 
                    value={selectedCampaign.description}
                    onChange={(e) => setSelectedCampaign({...selectedCampaign, description: e.target.value})}
                    placeholder="Nhập mô tả chiến dịch"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ngày bắt đầu</label>
                    <Input 
                      type="datetime-local"
                      value={selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setSelectedCampaign({...selectedCampaign, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ngày kết thúc</label>
                    <Input 
                      type="datetime-local"
                      value={selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setSelectedCampaign({...selectedCampaign, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Số lượng đơn tối đa</label>
                  <Input 
                    type="number"
                    value={selectedCampaign.max_applications || ''}
                    onChange={(e) => setSelectedCampaign({...selectedCampaign, max_applications: parseInt(e.target.value) || undefined})}
                    placeholder="Không giới hạn"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select 
                    value={selectedCampaign.status}
                    onChange={(e) => setSelectedCampaign({...selectedCampaign, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={loadingModal}>
                  Hủy
                </Button>
                <Button onClick={() => handleUpdateCampaign(selectedCampaign)} disabled={loadingModal}>
                  {loadingModal ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Applications Modal */}
      <Dialog open={applicationsModalOpen} onOpenChange={setApplicationsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? `Đơn ứng tuyển - ${selectedCampaign.title}` : 'Đơn ứng tuyển'}
            </DialogTitle>
          </DialogHeader>
          {campaignApplications.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Tổng số đơn: {campaignApplications.length}
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {campaignApplications.map((application: any, index: number) => (
                    <div key={application.id || index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{application.user_full_name || 'Ẩn danh'}</h4>
                          <p className="text-sm text-gray-600">{application.user_email || 'Email không có'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            application.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.status === 'active' ? 'Được duyệt' : 
                             application.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplicationDetail(application.id)}
                            disabled={loadingModal}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                      {application.application_message && (
                        <div className="mt-2">
                          <p className="text-sm"><strong>Thông điệp:</strong></p>
                          <p className="text-sm text-gray-700">{application.application_answers.application_message}</p>
                        </div>
                      )}
                      {application.application_answers && application.application_answers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Câu trả lời:</p>
                          <div className="space-y-1">
                            {application.application_answers.answers.map((qa: any, i: number) => (
                              <div key={i} className="text-sm">
                                <p className="font-medium">{qa.question}</p>
                                <p className="text-gray-700 ml-2">{qa.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Nộp lúc: {new Date(application.submitted_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có đơn ứng tuyển nào</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail Modal */}
      <Dialog open={applicationDetailModalOpen} onOpenChange={setApplicationDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn ứng tuyển</DialogTitle>
          </DialogHeader>
          {selectedApplicationDetail ? (
            <div className="space-y-6">
              {/* User Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Thông tin ứng viên</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>User ID:</strong> {selectedApplicationDetail.user_id}
                  </div>
                  <div>
                    <strong>Vai trò:</strong> {selectedApplicationDetail.role || 'member'}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedApplicationDetail.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedApplicationDetail.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplicationDetail.status === 'active' ? 'Được duyệt' : 
                       selectedApplicationDetail.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <div>
                    <strong>Ngày nộp:</strong> {new Date(selectedApplicationDetail.submitted_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Application Message */}
              {selectedApplicationDetail.application_answers?.application_message && (
                <div>
                  <h3 className="font-semibold mb-2">Thông điệp ứng tuyển</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedApplicationDetail.application_answers.application_message}
                  </p>
                </div>
              )}

              {/* Application Answers */}
              {selectedApplicationDetail.application_answers?.answers && 
               selectedApplicationDetail.application_answers.answers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Câu trả lời</h3>
                  <div className="space-y-3">
                    {selectedApplicationDetail.application_answers.answers.map((answerItem: any, index: number) => {
                      // Find the corresponding question from the selected campaign
                      const question = selectedCampaign?.application_questions?.find(
                        q => q.id === answerItem.question_id
                      );
                      
                      return (
                        <div key={index} className="border rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            {question?.question || `Câu hỏi ${answerItem.question_id}`}
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {answerItem.answer}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  {selectedApplicationDetail && selectedApplicationDetail.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApproveApplication(selectedApplicationDetail.id)}
                        disabled={loadingModal}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {loadingModal ? 'Đang xử lý...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleRejectApplication(selectedApplicationDetail.id)}
                        disabled={loadingModal}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {loadingModal ? 'Đang xử lý...' : 'Reject'}
                      </Button>
                    </>
                  )}
                </div>
                <Button 
                  onClick={() => setApplicationDetailModalOpen(false)}
                  variant="outline"
                  disabled={loadingModal}
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
