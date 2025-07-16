import apiClient from './api';

export const searchClubs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/api/clubs?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data,
      meta: response.data.meta
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search clubs',
      data: []
    };
  }
};

export const getClubById = async (clubId) => {
  try {
    const response = await apiClient.get(`/api/clubs/${clubId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get club information'
    };
  }
};

export const getClubCategories = async () => {
  try {
    const response = await apiClient.get('/api/clubs/categories');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      data: []
    };
  }
};

export const getClubLocations = async () => {
  try {
    const response = await apiClient.get('/api/clubs/locations');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      data: []
    };
  }
};

export const getClubRecruitments = async (clubId) => {
  try {
    const response = await apiClient.get(`/api/clubs/${clubId}/recruitments`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get recruitment campaigns',
      data: []
    };
  }
};
