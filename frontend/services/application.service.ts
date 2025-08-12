import { api } from '@/lib/api'

export interface Application {
  id: string
  status: 'pending' | 'active' | 'rejected' | 'withdrawn'
  role?: 'member' | 'organizer'
  application_message?: string
  application_answers?: any
  submitted_at: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  campaign?: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    status: string
  }
  club?: {
    id: string
    name: string
    description: string
    logo?: string
  }
}

export interface ApplicationsResponse {
  success: boolean
  message: string
  data: {
    applications: Application[]
    pagination: {
      current_page: number
      total_pages: number
      total_items: number
      items_per_page: number
    }
  }
}

export interface ApplicationDetailResponse {
  success: boolean
  message: string
  data: Application
}

class ApplicationService {
  /**
   * Lấy tất cả đơn ứng tuyển của user
   */
  async getUserApplications(userId: string, options?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApplicationsResponse> {
    const params = new URLSearchParams()
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.status) params.append('status', options.status)

    const response = await api.get(`/users/${userId}/applications?${params.toString()}`)
    return response.data
  }

  /**
   * Lấy chi tiết một đơn ứng tuyển cụ thể
   */
  async getApplication(applicationId: string): Promise<ApplicationDetailResponse> {
    const response = await api.get(`/applications/${applicationId}`)
    return response.data
  }

  /**
   * Cập nhật đơn ứng tuyển
   */
  async updateApplication(applicationId: string, data: {
    answers?: any[]
    message?: string
  }): Promise<ApplicationDetailResponse> {
    const response = await api.put(`/applications/${applicationId}`, data)
    return response.data
  }

  /**
   * Rút đơn ứng tuyển
   */
  async withdrawApplication(applicationId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/applications/${applicationId}`)
    return response.data
  }
}

export const applicationService = new ApplicationService()
