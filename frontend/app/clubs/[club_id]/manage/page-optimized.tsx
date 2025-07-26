// "use client"

// import { useState, useEffect, Suspense, lazy } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { Users, Calendar, Settings, BarChart3, Plus } from "lucide-react"
// import { useAuthStore } from "@/stores/auth-store"
// import { useToast } from "@/hooks/use-toast"
// import { AddMemberForm } from "@/components/club-manager/add-member-form"
// import { clubService, type ClubDetail } from "@/services/club.service"

// // Lazy load heavy components
// const ClubStats = lazy(() => import("@/components/club-manager/club-stats").then(module => ({ default: module.ClubStats })))
// const MemberList = lazy(() => import("@/components/club-manager/member-list").then(module => ({ default: module.MemberList })))
// const CampaignList = lazy(() => import("@/components/club-manager/campaign-list").then(module => ({ default: module.CampaignList })))

// // Loading components
// const TabLoadingSpinner = () => (
//   <div className="flex items-center justify-center min-h-[300px]">
//     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//   </div>
// )

// export default function ClubManagerDashboard() {
//   const params = useParams()
//   const router = useRouter()
//   const { user, isInitialized } = useAuthStore()
//   const { toast } = useToast()

//   const clubId = params.club_id as string

//   // Split state for different data types
//   const [basicClubInfo, setBasicClubInfo] = useState<Partial<ClubDetail> | null>(null)
//   const [members, setMembers] = useState(null)
//   const [campaigns, setCampaigns] = useState(null)
//   const [fullClubData, setFullClubData] = useState<ClubDetail | null>(null)
  
//   const [isBasicLoading, setIsBasicLoading] = useState(true)
//   const [showAddMemberForm, setShowAddMemberForm] = useState(false)
//   const [activeTab, setActiveTab] = useState("overview")
  
//   // Track which tabs have been loaded
//   const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set())

//   useEffect(() => {
//     if (!isInitialized) return
//     if (!user) {
//       router.push("/login")
//       return
//     }
//     fetchBasicClubInfo()
//   }, [clubId, user, isInitialized])

//   // Fetch minimal club info first
//   const fetchBasicClubInfo = async () => {
//     setIsBasicLoading(true)
//     try {
//       // Create a lightweight version that only gets essential info
//       const response = await clubService.getClubBasicInfo(clubId) // New API endpoint needed
//       if (response.success && response.data) {
//         setBasicClubInfo(response.data)
//       }
//     } catch (error: any) {
//       console.error("Error fetching basic club info:", error)
//       toast({
//         title: "Lỗi",
//         description: "Không thể tải thông tin cơ bản của câu lạc bộ.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsBasicLoading(false)
//     }
//   }

//   // Load data when tab is accessed
//   const loadTabData = async (tabName: string) => {
//     if (loadedTabs.has(tabName)) return

//     try {
//       switch (tabName) {
//         case "overview":
//           if (!fullClubData) {
//             const clubResponse = await clubService.getClubDetail(clubId)
//             if (clubResponse.success && clubResponse.data) {
//               setFullClubData(clubResponse.data)
//             }
//           }
//           break

//         case "members":
//           if (!members) {
//             const membersResponse = await clubService.getClubMembers(clubId)
//             if (membersResponse.success && membersResponse.data) {
//               setMembers(membersResponse.data)
//             }
//           }
//           break

//         case "campaigns":
//           if (!campaigns) {
//             // Use lightweight campaigns endpoint
//             const campaignsResponse = await clubService.getClubCampaignsSummary(clubId) // New API endpoint needed
//             if (campaignsResponse.success && campaignsResponse.data) {
//               setCampaigns(campaignsResponse.data)
//             }
//           }
//           break
//       }
      
//       setLoadedTabs(prev => new Set([...prev, tabName]))
//     } catch (error: any) {
//       console.error(`Error loading ${tabName} data:`, error)
//       toast({
//         title: "Lỗi",
//         description: `Không thể tải dữ liệu ${tabName}.`,
//         variant: "destructive",
//       })
//     }
//   }

//   // Handle tab change
//   const handleTabChange = (tabName: string) => {
//     setActiveTab(tabName)
//     loadTabData(tabName)
//   }

//   // Load initial tab data
//   useEffect(() => {
//     if (!isBasicLoading && basicClubInfo) {
//       loadTabData(activeTab)
//     }
//   }, [activeTab, isBasicLoading, basicClubInfo])

//   // ... rest of your handler functions remain the same ...

//   if (!isInitialized) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (isBasicLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="animate-pulse">
//             <div className="h-4 bg-gray-200 rounded mb-8 w-96"></div>
//             <div className="h-64 bg-gray-200 rounded mb-8"></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (!basicClubInfo) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-gray-900">Không thể tải thông tin câu lạc bộ</h1>
//             <p className="mt-2 text-gray-600">Vui lòng thử lại sau.</p>
//             <Button onClick={() => router.push('/clubs')} className="mt-4">
//               Quay lại danh sách câu lạc bộ
//             </Button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Breadcrumb - using basic info */}
//         <Breadcrumb className="mb-8">
//           <BreadcrumbList>
//             <BreadcrumbItem>
//               <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink href="/clubs">Câu lạc bộ</BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink href={`/clubs/${clubId}`}>{basicClubInfo.name}</BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbPage>Quản lý</BreadcrumbPage>
//             </BreadcrumbItem>
//           </BreadcrumbList>
//         </Breadcrumb>

//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Quản lý câu lạc bộ</h1>
//               <p className="mt-2 text-gray-600">{basicClubInfo.name}</p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <Button variant="outline" onClick={() => router.push(`/clubs/${clubId}`)}>
//                 Xem trang câu lạc bộ
//               </Button>
//               <Button
//                 onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/new`)}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Tạo chiến dịch mới
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Main Content Area */}
//           <div className="lg:col-span-3">
//             <Card>
//               <CardContent className="p-0">
//                 <Tabs value={activeTab} onValueChange={handleTabChange}>
//                   <div className="border-b">
//                     <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent rounded-none">
//                       <TabsTrigger
//                         value="overview"
//                         className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
//                       >
//                         <BarChart3 className="h-4 w-4 mr-2" />
//                         Tổng quan
//                       </TabsTrigger>
//                       <TabsTrigger
//                         value="members"
//                         className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
//                       >
//                         <Users className="h-4 w-4 mr-2" />
//                         Thành viên
//                       </TabsTrigger>
//                       <TabsTrigger
//                         value="campaigns"
//                         className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
//                       >
//                         <Calendar className="h-4 w-4 mr-2" />
//                         Chiến dịch
//                       </TabsTrigger>
//                     </TabsList>
//                   </div>

//                   <TabsContent value="overview" className="p-6">
//                     <Suspense fallback={<TabLoadingSpinner />}>
//                       {fullClubData && members && (
//                         <ClubStats 
//                           club={fullClubData} 
//                           members={members} 
//                           campaigns={fullClubData.current_recruitments} 
//                         />
//                       )}
//                     </Suspense>
//                   </TabsContent>

//                   <TabsContent value="members" className="p-6">
//                     <div className="flex items-center justify-between mb-6">
//                       <h3 className="text-lg font-semibold">Quản lý thành viên</h3>
//                       <Button onClick={() => setShowAddMemberForm(true)} className="bg-blue-600 hover:bg-blue-700">
//                         <Plus className="h-4 w-4 mr-2" />
//                         Thêm thành viên
//                       </Button>
//                     </div>
//                     <Suspense fallback={<TabLoadingSpinner />}>
//                       {members && (
//                         <MemberList
//                           members={members.map(member => ({
//                             user_id: member.user_id,
//                             name: member.user_full_name || `User ${member.user_id}`, 
//                             email: member.user_email || `${member.user_id}@example.com`, 
//                             role: member.role,
//                             joined_at: member.joined_at,
//                           }))}
//                           onRemoveMember={handleRemoveMember}
//                           onUpdateMemberRole={handleUpdateMemberRole}
//                         />
//                       )}
//                     </Suspense>
//                   </TabsContent>

//                   <TabsContent value="campaigns" className="p-6">
//                     <div className="flex items-center justify-between mb-6">
//                       <h3 className="text-lg font-semibold">Quản lý chiến dịch</h3>
//                       <Button
//                         onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/new`)}
//                         className="bg-blue-600 hover:bg-blue-700"
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Tạo chiến dịch
//                       </Button>
//                     </div>
//                     <Suspense fallback={<TabLoadingSpinner />}>
//                       {campaigns && (
//                         <CampaignList 
//                           campaigns={campaigns.map(campaign => ({
//                             _id: campaign.id,
//                             title: campaign.title,
//                             status: campaign.status,
//                             start_date: campaign.start_date,
//                             end_date: campaign.end_date,
//                             total_applications: campaign.applications_count,
//                             max_applications: campaign.max_applications,
//                           }))} 
//                           clubId={clubId} 
//                           onCampaignUpdate={(updatedCampaigns) => {
//                             setCampaigns(updatedCampaigns.map(campaign => ({
//                               id: campaign._id,
//                               title: campaign.title,
//                               description: campaign.title,
//                               requirements: [],
//                               start_date: campaign.start_date,
//                               end_date: campaign.end_date,
//                               max_applications: campaign.max_applications || 0,
//                               applications_count: campaign.total_applications,
//                               status: campaign.status,
//                             })))
//                           }} 
//                         />
//                       )}
//                     </Suspense>
//                   </TabsContent>
//                 </Tabs>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar - using basic info */}
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <Settings className="h-5 w-5 mr-2" />
//                   Thông tin câu lạc bộ
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <img
//                     src={basicClubInfo.logo_url || "/placeholder.svg"}
//                     alt={basicClubInfo.name}
//                     className="h-12 w-12 rounded-full object-cover"
//                   />
//                   <div>
//                     <h4 className="font-semibold">{basicClubInfo.name}</h4>
//                     <Badge variant="secondary">{basicClubInfo.category}</Badge>
//                   </div>
//                 </div>
//                 <Separator />
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Số thành viên:</span>
//                     <span className="font-medium">{basicClubInfo.member_count}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Địa điểm:</span>
//                     <span className="font-medium text-right">{basicClubInfo.location}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Thao tác nhanh</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start bg-transparent"
//                   onClick={() => setShowAddMemberForm(true)}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Thêm thành viên
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start bg-transparent"
//                   onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/new`)}
//                 >
//                   <Calendar className="h-4 w-4 mr-2" />
//                   Tạo chiến dịch
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start bg-transparent"
//                   onClick={() => handleTabChange("members")}
//                 >
//                   <Users className="h-4 w-4 mr-2" />
//                   Xem thành viên
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* Add Member Form Modal */}
//       {showAddMemberForm && <AddMemberForm onClose={() => setShowAddMemberForm(false)} onAddMember={handleAddMember} />}
//     </div>
//   )
// }
