import { useState, useEffect } from 'react'
import { applicationService, Application } from '@/services/application.service'
import { useToast } from '@/hooks/use-toast'

interface UseApplicationsOptions {
  userId: string
  page?: number
  limit?: number
  status?: string
}

interface UseApplicationsReturn {
  applications: Application[]
  loading: boolean
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
  error: string | null
  refetch: () => Promise<void>
  withdrawApplication: (applicationId: string) => Promise<void>
}

export function useApplications({
  userId,
  page = 1,
  limit = 10,
  status
}: UseApplicationsOptions): UseApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  })

  const { toast } = useToast()

  const fetchApplications = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
             const response = await applicationService.getUserApplications(userId, {
         page,
         limit,
         status: status === "all" ? undefined : status
       })

      if (response.success) {
        setApplications(response.data.applications)
        setPagination(response.data.pagination)
      } else {
        setError(response.message || 'Không thể tải danh sách đơn ứng tuyển')
        toast({
          title: "Lỗi",
          description: response.message || "Không thể tải danh sách đơn ứng tuyển.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách đơn ứng tuyển'
      setError(errorMessage)
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await applicationService.withdrawApplication(applicationId)
      if (response.success) {
        // Cập nhật local state
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
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể rút đơn ứng tuyển.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [userId, page, limit, status])

  return {
    applications,
    loading,
    pagination,
    error,
    refetch: fetchApplications,
    withdrawApplication
  }
}
