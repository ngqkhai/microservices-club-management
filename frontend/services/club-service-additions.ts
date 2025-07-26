// // Add these new methods to the existing ClubService class

// /**
//  * Get basic club information (lightweight version)
//  */
// async getClubBasicInfo(id: string): Promise<ApiResponse<Partial<ClubDetail>>> {
//   const response = await api.get<Partial<ClubDetail>>(`/api/clubs/${id}/basic`, { skipAuth: true })
//   return response;
// }

// /**
//  * Get club campaigns summary (without full details)
//  */
// async getClubCampaignsSummary(clubId: string): Promise<ApiResponse<any[]>> {
//   return api.get<any[]>(`/api/clubs/${clubId}/campaigns/summary`);
// }
