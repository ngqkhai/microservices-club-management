// "use client"

// import { useState, useEffect, useMemo } from "react"
// import { FixedSizeList as List } from "react-window"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { Search, UserMinus, UserCheck, Crown, User } from "lucide-react"

// interface Member {
//   user_id: string
//   name: string
//   email: string
//   role: string
//   joined_at: string
// }

// interface MemberListProps {
//   members: Member[]
//   onRemoveMember: (userId: string) => void
//   onUpdateMemberRole: (userId: string, newRole: string) => void
// }

// interface MemberRowProps {
//   index: number
//   style: React.CSSProperties
//   data: {
//     filteredMembers: Member[]
//     onRemoveMember: (userId: string) => void
//     onUpdateMemberRole: (userId: string, newRole: string) => void
//     getRoleIcon: (role: string) => JSX.Element
//     getRoleBadge: (role: string) => JSX.Element
//     formatDate: (dateString: string) => string
//   }
// }

// const MemberRow = ({ index, style, data }: MemberRowProps) => {
//   const member = data.filteredMembers[index]
  
//   return (
//     <div style={style}>
//       <Card className="mb-2">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 {data.getRoleIcon(member.role)}
//                 <div>
//                   <h4 className="font-semibold">{member.name}</h4>
//                   <p className="text-sm text-gray-600">{member.email}</p>
//                 </div>
//               </div>
//               <div className="text-center">
//                 {data.getRoleBadge(member.role)}
//                 <p className="text-xs text-gray-500 mt-1">
//                   Tham gia: {data.formatDate(member.joined_at)}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Select
//                 value={member.role}
//                 onValueChange={(newRole) => data.onUpdateMemberRole(member.user_id, newRole)}
//               >
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="member">Thành viên</SelectItem>
//                   <SelectItem value="organizer">Tổ chức</SelectItem>
//                   <SelectItem value="club_manager">Quản lý</SelectItem>
//                 </SelectContent>
//               </Select>
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
//                     <UserMinus className="h-4 w-4" />
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent>
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       Bạn có chắc chắn muốn xóa {member.name} khỏi câu lạc bộ không?
//                       Hành động này không thể hoàn tác.
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>Hủy</AlertDialogCancel>
//                     <AlertDialogAction
//                       onClick={() => data.onRemoveMember(member.user_id)}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       Xóa
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               </AlertDialog>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export function VirtualizedMemberList({ members, onRemoveMember, onUpdateMemberRole }: MemberListProps) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [roleFilter, setRoleFilter] = useState("all")

//   const filteredMembers = useMemo(() => {
//     return members.filter((member) => {
//       const matchesSearch =
//         member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         member.email.toLowerCase().includes(searchTerm.toLowerCase())
//       const matchesRole = roleFilter === "all" || member.role === roleFilter
//       return matchesSearch && matchesRole
//     })
//   }, [members, searchTerm, roleFilter])

//   const getRoleIcon = (role: string) => {
//     switch (role) {
//       case "club_manager":
//         return <Crown className="h-4 w-4" />
//       case "organizer":
//         return <UserCheck className="h-4 w-4" />
//       default:
//         return <User className="h-4 w-4" />
//     }
//   }

//   const getRoleBadge = (role: string) => {
//     switch (role) {
//       case "club_manager":
//         return (
//           <Badge variant="default" className="bg-blue-600">
//             Quản lý
//           </Badge>
//         )
//       case "organizer":
//         return <Badge variant="secondary">Tổ chức</Badge>
//       default:
//         return <Badge variant="outline">Thành viên</Badge>
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("vi-VN", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   const rowData = {
//     filteredMembers,
//     onRemoveMember,
//     onUpdateMemberRole,
//     getRoleIcon,
//     getRoleBadge,
//     formatDate
//   }

//   return (
//     <div className="space-y-4">
//       {/* Search and Filter */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             placeholder="Tìm kiếm theo tên hoặc email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Select value={roleFilter} onValueChange={setRoleFilter}>
//           <SelectTrigger className="w-full sm:w-48">
//             <SelectValue placeholder="Lọc theo vai trò" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">Tất cả vai trò</SelectItem>
//             <SelectItem value="club_manager">Quản lý</SelectItem>
//             <SelectItem value="organizer">Tổ chức</SelectItem>
//             <SelectItem value="member">Thành viên</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Member Count */}
//       <div className="text-sm text-gray-600">
//         Hiển thị {filteredMembers.length} / {members.length} thành viên
//       </div>

//       {/* Virtualized List */}
//       <div className="border rounded-lg">
//         {filteredMembers.length > 0 ? (
//           <List
//             height={600} // Adjust height as needed
//             itemCount={filteredMembers.length}
//             itemSize={120} // Height of each member row
//             itemData={rowData}
//           >
//             {MemberRow}
//           </List>
//         ) : (
//           <div className="p-8 text-center text-gray-500">
//             {searchTerm || roleFilter !== "all" 
//               ? "Không tìm thấy thành viên nào phù hợp với bộ lọc."
//               : "Chưa có thành viên nào trong câu lạc bộ."
//             }
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
