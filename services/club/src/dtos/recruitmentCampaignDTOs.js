/**
 * Data Transfer Objects for Recruitment Campaign
 * Used to standardize API responses
 */

/**
 * DTO for creating a campaign (validation)
 */
class CreateCampaignDTO {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.max_participants = data.max_participants;
    this.requirements = data.requirements;
    this.status = data.status || 'draft';
  }

  validate() {
    const errors = [];
    if (!this.title) errors.push('Title is required');
    if (!this.start_date) errors.push('Start date is required');
    if (!this.end_date) errors.push('End date is required');
    return errors.length > 0 ? errors : null;
  }
}

/**
 * DTO for updating a campaign (validation)
 */
class UpdateCampaignDTO {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.max_participants = data.max_participants;
    this.requirements = data.requirements;
    this.status = data.status;
  }
}

/**
 * DTO for campaign response (single campaign)
 */
class CampaignResponseDTO {
  constructor(campaign) {
    if (!campaign) return null;
    
    this.id = campaign._id || campaign.id;
    this.club_id = campaign.club_id;
    this.title = campaign.title;
    this.description = campaign.description;
    this.short_description = campaign.short_description;
    this.start_date = campaign.start_date;
    this.end_date = campaign.end_date;
    this.status = campaign.status;
    this.max_participants = campaign.max_participants;
    this.current_participants = campaign.current_participants || 0;
    this.requirements = campaign.requirements;
    this.application_form = campaign.application_form;
    this.review_criteria = campaign.review_criteria;
    this.created_by = campaign.created_by;
    this.created_at = campaign.created_at;
    this.updated_at = campaign.updated_at;
    
    // Include club info if populated
    if (campaign.club) {
      this.club = {
        id: campaign.club._id || campaign.club.id,
        name: campaign.club.name,
        logo_url: campaign.club.logo_url
      };
    }
  }
}

/**
 * DTO for campaign list response (with pagination)
 */
class CampaignListResponseDTO {
  constructor(campaigns, pagination) {
    this.campaigns = (campaigns || []).map(c => new CampaignResponseDTO(c));
    this.pagination = pagination || {
      current_page: 1,
      total_pages: 1,
      total_items: campaigns?.length || 0,
      items_per_page: campaigns?.length || 0
    };
  }
}

module.exports = {
  CreateCampaignDTO,
  UpdateCampaignDTO,
  CampaignResponseDTO,
  CampaignListResponseDTO
};

