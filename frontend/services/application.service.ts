import api, { ApiResponse } from '@/lib/api'
import config from '@/config'

export interface Application {
  id: string
  status: 'pending' | 'active' | 'rejected' | 'withdrawn'
  role?: 'member' | 'organizer' | 'club_manager'
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
  applications: Application[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
}

export interface ApplicationDetailResponse {
  id: string
  status: 'pending' | 'active' | 'rejected' | 'withdrawn'
  role?: 'member' | 'organizer' | 'club_manager'
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

class ApplicationService {
  /**
   * Lấy tất cả đơn ứng tuyển của user
   */
  async getUserApplications(userId: string, options?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<ApplicationsResponse>> {
    const params = new URLSearchParams()
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.status) params.append('status', options.status)
    const endpoint = config.endpoints.campaigns.userApplications(userId)
    return api.get<ApplicationsResponse>(`${endpoint}?${params.toString()}`)
  }

  /**
   * Lấy chi tiết một đơn ứng tuyển cụ thể
   */
  async getApplication(applicationId: string): Promise<ApiResponse<ApplicationDetailResponse>> {
    const endpoint = config.endpoints.campaigns.applicationDetailDirect(applicationId)
    return api.get<ApplicationDetailResponse>(endpoint)
  }

  /**
   * Cập nhật đơn ứng tuyển
   */
  async updateApplication(applicationId: string, data: {
    answers?: any[]
    message?: string
  }): Promise<ApiResponse<ApplicationDetailResponse>> {
    const endpoint = config.endpoints.campaigns.updateApplication(applicationId)
    return api.put<ApplicationDetailResponse>(endpoint, data)
  }

  /**
   * Rút đơn ứng tuyển
   */
  async withdrawApplication(applicationId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const endpoint = config.endpoints.campaigns.withdrawApplication(applicationId)
    return api.delete<{ success: boolean; message: string }>(endpoint)
  }
}

export const applicationService = new ApplicationService()
