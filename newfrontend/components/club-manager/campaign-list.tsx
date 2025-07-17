"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar, Users, Edit, Trash2, Play, Pause, CheckCircle, MoreHorizontal, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Campaign {
  _id: string
  title: string
  status: string
  start_date: string
  end_date: string
  total_applications: number
  max_applications?: number
}

interface CampaignListProps {
  campaigns: Campaign[]
  clubId: string
  onCampaignUpdate: (campaigns: Campaign[]) => void
}

export function CampaignList({ campaigns, clubId, onCampaignUpdate }: CampaignListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCampaigns = campaigns.filter((campaign) => {
    return statusFilter === "all" || campaign.status === statusFilter
  })

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

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

      onCampaignUpdate(updatedCampaigns)

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái chiến dịch.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái chiến dịch.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedCampaigns = campaigns.filter((campaign) => campaign._id !== campaignId)
      onCampaignUpdate(updatedCampaigns)

      toast({
        title: "Thành công",
        description: "Đã xóa chiến dịch.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa chiến dịch.",
        variant: "destructive",
      })
    }
  }

  const getAvailableActions = (status: string) => {
    switch (status) {
      case "draft":
        return ["publish", "edit", "delete"]
      case "published":
        return ["pause", "complete", "edit", "view"]
      case "paused":
        return ["resume", "complete", "edit", "view"]
      case "completed":
        return ["view"]
      default:
        return []
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="paused">Tạm dừng</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có chiến dịch nào.</p>
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
                      <Button variant="ghost" size="sm">
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
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Xuất bản
                              </DropdownMenuItem>
                            )
                          case "pause":
                            return (
                              <DropdownMenuItem key={action} onClick={() => handleStatusChange(campaign._id, "pause")}>
                                <Pause className="h-4 w-4 mr-2" />
                                Tạm dừng
                              </DropdownMenuItem>
                            )
                          case "resume":
                            return (
                              <DropdownMenuItem key={action} onClick={() => handleStatusChange(campaign._id, "resume")}>
                                <Play className="h-4 w-4 mr-2" />
                                Tiếp tục
                              </DropdownMenuItem>
                            )
                          case "complete":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleStatusChange(campaign._id, "complete")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Hoàn thành
                              </DropdownMenuItem>
                            )
                          case "edit":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/${campaign._id}/edit`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )
                          case "view":
                            return (
                              <DropdownMenuItem
                                key={action}
                                onClick={() =>
                                  router.push(`/clubs/${clubId}/manage/campaigns/${campaign._id}/applications`)
                                }
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
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCampaign(campaign._id)}
                                      className="bg-red-600 hover:bg-red-700"
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
                      onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/${campaign._id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    {campaign.status === "published" || campaign.status === "completed" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/${campaign._id}/applications`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem đơn
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
