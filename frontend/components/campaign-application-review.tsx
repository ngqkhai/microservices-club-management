// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogDescription, 
//   DialogHeader, 
//   DialogTitle,
//   DialogFooter
// } from "@/components/ui/dialog"
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { 
//   Calendar, 
//   Clock, 
//   Users, 
//   CheckCircle, 
//   XCircle, 
//   Clock as ClockIcon,
//   UserCheck,
//   UserX,
//   Eye,
//   MessageSquare
// } from "lucide-react"
// import { campaignService, CampaignApplication, Campaign } from "@/services/campaign.service"
// import { useToast } from "@/hooks/use-toast"

// interface ApplicationReviewProps {
//   clubId: string
//   campaign: Campaign
// }

// interface ApplicationCardProps {
//   application: CampaignApplication
//   onApprove: (application: CampaignApplication) => void
//   onReject: (application: CampaignApplication) => void
//   onViewDetails: (application: CampaignApplication) => void
// }

// function ApplicationCard({ application, onApprove, onReject, onViewDetails }: ApplicationCardProps) {
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString("vi-VN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "pending":
//         return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>
//       case "approved":
//         return <Badge variant="default" className="bg-green-600">Đã duyệt</Badge>
//       case "rejected":
//         return <Badge variant="destructive">Từ chối</Badge>
//       default:
//         return <Badge variant="secondary">Không xác định</Badge>
//     }
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "pending":
//         return <ClockIcon className="h-4 w-4 text-yellow-600" />
//       case "approved":
//         return <CheckCircle className="h-4 w-4 text-green-600" />
//       case "rejected":
//         return <XCircle className="h-4 w-4 text-red-600" />
//       default:
//         return <ClockIcon className="h-4 w-4 text-gray-600" />
//     }
//   }

//   const getInitials = (email: string) => {
//     return email.substring(0, 2).toUpperCase()
//   }

//   return (
//     <Card className="border-l-4 border-l-blue-600">
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <div className="flex items-start gap-3 flex-1 min-w-0">
//             <Avatar className="h-10 w-10">
//               <AvatarFallback>{getInitials(application.user_email)}</AvatarFallback>
//             </Avatar>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 {getStatusIcon(application.status)}
//                 <h3 className="font-semibold text-lg truncate">{application.user_email}</h3>
//               </div>
//               <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
//                 <span className="flex items-center gap-1">
//                   <Calendar className="h-4 w-4" />
//                   {formatDate(application.submitted_at)}
//                 </span>
//                 {application.updated_at !== application.submitted_at && (
//                   <span className="flex items-center gap-1">
//                     <Clock className="h-4 w-4" />
//                     Cập nhật {formatDate(application.updated_at)}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//           {getStatusBadge(application.status)}
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {/* Application Message Preview */}
//           {application.application_message && (
//             <div>
//               <p className="text-sm text-gray-700 line-clamp-3">
//                 {application.application_message}
//               </p>
//             </div>
//           )}

//           {/* Review Notes */}
//           {application.review_notes && (
//             <div className="p-3 bg-gray-50 rounded-lg">
//               <p className="text-sm font-medium text-gray-900 mb-1">Ghi chú đánh giá:</p>
//               <p className="text-sm text-gray-700">{application.review_notes}</p>
//               {application.reviewed_by && application.reviewed_at && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   Bởi {application.reviewed_by} lúc {formatDate(application.reviewed_at)}
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Actions */}
//           <div className="flex flex-wrap gap-2 pt-2 border-t">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => onViewDetails(application)}
//               className="flex-1 sm:flex-none"
//             >
//               <Eye className="h-4 w-4 mr-2" />
//               Xem chi tiết
//             </Button>
            
//             {application.status === "pending" && (
//               <>
//                 <Button
//                   variant="default"
//                   size="sm"
//                   onClick={() => onApprove(application)}
//                   className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
//                 >
//                   <UserCheck className="h-4 w-4 mr-2" />
//                   Duyệt
//                 </Button>
                
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => onReject(application)}
//                   className="flex-1 sm:flex-none"
//                 >
//                   <UserX className="h-4 w-4 mr-2" />
//                   Từ chối
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export function CampaignApplicationReview({ clubId, campaign }: ApplicationReviewProps) {
//   const { toast } = useToast()
//   const [applications, setApplications] = useState<CampaignApplication[]>([])
//   const [loading, setLoading] = useState(false)
//   const [selectedTab, setSelectedTab] = useState("all")
//   const [viewingApplication, setViewingApplication] = useState<CampaignApplication | null>(null)
//   const [reviewingApplication, setReviewingApplication] = useState<{
//     application: CampaignApplication;
//     action: 'approve' | 'reject';
//   } | null>(null)
//   const [reviewNotes, setReviewNotes] = useState("")
//   const [memberRole, setMemberRole] = useState("member")

//   const loadApplications = async () => {
//     setLoading(true)
//     try {
//       const response = await campaignService.getCampaignApplications(clubId, campaign.id)
//       if (response.success && response.data) {
//         setApplications(response.data.data || [])
//       }
//     } catch (error: any) {
//       toast({
//         title: "Lỗi",
//         description: "Không thể tải danh sách đơn ứng tuyển",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadApplications()
//   }, [clubId, campaign.id])

//   const handleApprove = (application: CampaignApplication) => {
//     setReviewingApplication({ application, action: 'approve' })
//     setReviewNotes("")
//     setMemberRole("member")
//   }

//   const handleReject = (application: CampaignApplication) => {
//     setReviewingApplication({ application, action: 'reject' })
//     setReviewNotes("")
//   }

//   const handleConfirmReview = async () => {
//     if (!reviewingApplication) return

//     const { application, action } = reviewingApplication
    
//     try {
//       if (action === 'approve') {
//         await campaignService.approveApplication(clubId, campaign.id, application.id, {
//           role: memberRole as 'member',
//           notes: reviewNotes || undefined
//         })
//         toast({
//           title: "Thành công",
//           description: "Đã duyệt đơn ứng tuyển và thêm thành viên vào câu lạc bộ",
//         })
//       } else {
//         await campaignService.rejectApplication(clubId, campaign.id, application.id, {
//           notes: reviewNotes || undefined
//         })
//         toast({
//           title: "Thành công",
//           description: "Đã từ chối đơn ứng tuyển",
//         })
//       }
      
//       // Reload applications
//       await loadApplications()
//       setReviewingApplication(null)
//       setReviewNotes("")
      
//     } catch (error: any) {
//       toast({
//         title: "Lỗi",
//         description: error.message || `Không thể ${action === 'approve' ? 'duyệt' : 'từ chối'} đơn ứng tuyển`,
//         variant: "destructive",
//       })
//     }
//   }

//   const handleViewDetails = (application: CampaignApplication) => {
//     setViewingApplication(application)
//   }

//   const filteredApplications = applications.filter(app => {
//     switch (selectedTab) {
//       case "pending":
//         return app.status === "pending"
//       case "approved":
//         return app.status === "approved"
//       case "rejected":
//         return app.status === "rejected"
//       default:
//         return true
//     }
//   })

//   const getTabCount = (status: string) => {
//     if (status === "all") return applications.length
//     return applications.filter(app => app.status === status).length
//   }

//   if (loading && !applications.length) {
//     return (
//       <div className="space-y-4">
//         {[...Array(3)].map((_, i) => (
//           <Card key={i} className="animate-pulse">
//             <CardContent className="p-6">
//               <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//               <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
//               <div className="h-3 bg-gray-200 rounded w-2/3"></div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold">Đánh giá đơn ứng tuyển</h2>
//           <p className="text-gray-600 mt-1">{campaign.title}</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Badge variant="secondary">
//             {applications.length} đơn ứng tuyển
//           </Badge>
//           {campaign.max_applications && (
//             <Badge variant="outline">
//               Tối đa: {campaign.max_applications}
//             </Badge>
//           )}
//         </div>
//       </div>

//       {/* Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-blue-600" />
//               <div>
//                 <p className="text-2xl font-bold">{getTabCount("all")}</p>
//                 <p className="text-sm text-gray-600">Tổng số</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <ClockIcon className="h-5 w-5 text-yellow-600" />
//               <div>
//                 <p className="text-2xl font-bold">{getTabCount("pending")}</p>
//                 <p className="text-sm text-gray-600">Đang chờ</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="h-5 w-5 text-green-600" />
//               <div>
//                 <p className="text-2xl font-bold">{getTabCount("approved")}</p>
//                 <p className="text-sm text-gray-600">Đã duyệt</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <XCircle className="h-5 w-5 text-red-600" />
//               <div>
//                 <p className="text-2xl font-bold">{getTabCount("rejected")}</p>
//                 <p className="text-sm text-gray-600">Từ chối</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Tabs value={selectedTab} onValueChange={setSelectedTab}>
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="all">
//             Tất cả ({getTabCount("all")})
//           </TabsTrigger>
//           <TabsTrigger value="pending">
//             Đang chờ ({getTabCount("pending")})
//           </TabsTrigger>
//           <TabsTrigger value="approved">
//             Đã duyệt ({getTabCount("approved")})
//           </TabsTrigger>
//           <TabsTrigger value="rejected">
//             Từ chối ({getTabCount("rejected")})
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value={selectedTab} className="space-y-4 mt-6">
//           {filteredApplications.length === 0 ? (
//             <Card>
//               <CardContent className="p-8 text-center">
//                 <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">
//                   Chưa có đơn ứng tuyển nào
//                 </h3>
//                 <p className="text-gray-600">
//                   {selectedTab === "all" 
//                     ? "Chưa có ai nộp đơn ứng tuyển cho chiến dịch này."
//                     : `Chưa có đơn ứng tuyển nào ở trạng thái ${
//                         selectedTab === "pending" ? "đang chờ" :
//                         selectedTab === "approved" ? "đã duyệt" : "từ chối"
//                       }.`
//                   }
//                 </p>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="space-y-4">
//               {filteredApplications.map((application) => (
//                 <ApplicationCard
//                   key={application.id}
//                   application={application}
//                   onApprove={handleApprove}
//                   onReject={handleReject}
//                   onViewDetails={handleViewDetails}
//                 />
//               ))}
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>

//       {/* Review Dialog */}
//       {reviewingApplication && (
//         <Dialog open={!!reviewingApplication} onOpenChange={() => setReviewingApplication(null)}>
//           <DialogContent className="max-w-lg">
//             <DialogHeader>
//               <DialogTitle>
//                 {reviewingApplication.action === 'approve' ? 'Duyệt' : 'Từ chối'} đơn ứng tuyển
//               </DialogTitle>
//               <DialogDescription>
//                 {reviewingApplication.action === 'approve' 
//                   ? 'Duyệt đơn ứng tuyển và thêm thành viên vào câu lạc bộ'
//                   : 'Từ chối đơn ứng tuyển với lý do'
//                 }
//               </DialogDescription>
//             </DialogHeader>
            
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm text-gray-600 mb-2">Ứng viên: {reviewingApplication.application.user_email}</p>
//               </div>

//               {reviewingApplication.action === 'approve' && (
//                 <div>
//                   <Label htmlFor="role">Vai trò trong câu lạc bộ</Label>
//                   <Select value={memberRole} onValueChange={setMemberRole}>
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="member">Thành viên</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}

//               <div>
//                 <Label htmlFor="notes">
//                   {reviewingApplication.action === 'approve' ? 'Thông điệp chào mừng (tùy chọn)' : 'Lý do từ chối (tùy chọn)'}
//                 </Label>
//                 <Textarea
//                   id="notes"
//                   value={reviewNotes}
//                   onChange={(e) => setReviewNotes(e.target.value)}
//                   placeholder={
//                     reviewingApplication.action === 'approve' 
//                       ? "Chào mừng bạn đến với câu lạc bộ! Chúng tôi rất vui được có bạn..."
//                       : "Cảm ơn bạn đã quan tâm. Tuy nhiên, chúng tôi không thể chấp nhận đơn của bạn vì..."
//                   }
//                   rows={4}
//                 />
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setReviewingApplication(null)}
//               >
//                 Hủy
//               </Button>
//               <Button
//                 onClick={handleConfirmReview}
//                 className={
//                   reviewingApplication.action === 'approve' 
//                     ? "bg-green-600 hover:bg-green-700" 
//                     : "bg-red-600 hover:bg-red-700"
//                 }
//               >
//                 {reviewingApplication.action === 'approve' ? 'Duyệt đơn' : 'Từ chối'}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* View Application Details Dialog */}
//       {viewingApplication && (
//         <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Chi tiết đơn ứng tuyển</DialogTitle>
//               <DialogDescription>
//                 Thông tin chi tiết về đơn ứng tuyển từ {viewingApplication.user_email}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <strong>Email:</strong> {viewingApplication.user_email}
//                 </div>
//                 <div>
//                   <strong>Trạng thái:</strong> 
//                   <Badge 
//                     className="ml-2"
//                     variant={
//                       viewingApplication.status === "approved" ? "default" :
//                       viewingApplication.status === "rejected" ? "destructive" : "secondary"
//                     }
//                   >
//                     {viewingApplication.status === "pending" ? "Đang chờ" :
//                      viewingApplication.status === "approved" ? "Đã duyệt" : "Từ chối"}
//                   </Badge>
//                 </div>
//                 <div>
//                   <strong>Nộp đơn:</strong> {new Date(viewingApplication.submitted_at).toLocaleString("vi-VN")}
//                 </div>
//                 {viewingApplication.reviewed_at && (
//                   <div>
//                     <strong>Đánh giá:</strong> {new Date(viewingApplication.reviewed_at).toLocaleString("vi-VN")}
//                   </div>
//                 )}
//               </div>

//               {viewingApplication.application_message && (
//                 <div>
//                   <h4 className="font-semibold mb-2">Thông điệp ứng tuyển</h4>
//                   <p className="text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">
//                     {viewingApplication.application_message}
//                   </p>
//                 </div>
//               )}

//               {viewingApplication.application_answers && 
//                Object.keys(viewingApplication.application_answers).length > 0 && (
//                 <div>
//                   <h4 className="font-semibold mb-2">Câu trả lời</h4>
//                   <div className="space-y-3">
//                     {Object.entries(viewingApplication.application_answers).map(([questionId, answer]) => (
//                       <div key={questionId} className="p-3 bg-gray-50 rounded-lg">
//                         <p className="text-sm font-medium text-gray-900 mb-1">
//                           Câu hỏi {questionId}
//                         </p>
//                         <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {viewingApplication.review_notes && (
//                 <div>
//                   <h4 className="font-semibold mb-2">Ghi chú đánh giá</h4>
//                   <p className="text-gray-700 whitespace-pre-wrap p-3 bg-blue-50 rounded-lg">
//                     {viewingApplication.review_notes}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   )
// }
