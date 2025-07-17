/**
 * Data Transfer Objects for Recruitment Campaign requests
 */

class CreateCampaignDTO {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.requirements = data.requirements;
    this.application_questions = data.application_questions || [];
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.max_applications = data.max_applications;
    this.status = data.status || 'draft';
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (this.description && this.description.length > 2000) {
      errors.push('Description must be 2000 characters or less');
    }

    if (!this.start_date) {
      errors.push('Start date is required');
    }

    if (!this.end_date) {
      errors.push('End date is required');
    }

    if (this.start_date && this.end_date) {
      const startDate = new Date(this.start_date);
      const endDate = new Date(this.end_date);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    if (this.requirements && Array.isArray(this.requirements)) {
      this.requirements.forEach((requirement, index) => {
        if (typeof requirement !== 'string') {
          errors.push(`Requirement ${index + 1} must be a string`);
        } else if (requirement.length > 250) {
          errors.push(`Requirement ${index + 1} must be 250 characters or less`);
        }
      });
    } else if (this.requirements && !Array.isArray(this.requirements)) {
      errors.push('Requirements must be an array');
    }

    if (this.max_applications && this.max_applications < 1) {
      errors.push('Max applications must be positive');
    }

    if (this.status && !['draft', 'published', 'paused', 'completed'].includes(this.status)) {
      errors.push('Status must be either "draft", "published", "paused", or "completed"');
    }

    // Validate application questions
    if (this.application_questions && Array.isArray(this.application_questions)) {
      this.application_questions.forEach((question, index) => {
        if (!question.question || question.question.trim().length === 0) {
          errors.push(`Question ${index + 1} text is required`);
        }

        if (question.question && question.question.length > 500) {
          errors.push(`Question ${index + 1} text must be 500 characters or less`);
        }

        if (!question.type || !['text', 'textarea', 'select', 'checkbox'].includes(question.type)) {
          errors.push(`Question ${index + 1} must have a valid type (text, textarea, select, checkbox)`);
        }

        if ((question.type === 'select' || question.type === 'checkbox') && 
            (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
          errors.push(`Question ${index + 1} of type ${question.type} must have options`);
        }

        if (question.max_length && question.max_length < 1) {
          errors.push(`Question ${index + 1} max_length must be positive`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

class UpdateCampaignDTO {
  constructor(data) {
    // Only include fields that are provided in the update
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.requirements !== undefined) this.requirements = data.requirements;
    if (data.application_questions !== undefined) this.application_questions = data.application_questions;
    if (data.start_date !== undefined) this.start_date = data.start_date;
    if (data.end_date !== undefined) this.end_date = data.end_date;
    if (data.max_applications !== undefined) this.max_applications = data.max_applications;
    if (data.status !== undefined) this.status = data.status;
  }

  validate() {
    const errors = [];

    if (this.title !== undefined) {
      if (!this.title || this.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      }
      if (this.title.length > 200) {
        errors.push('Title must be 200 characters or less');
      }
    }

    if (this.description !== undefined) {
      if (!this.description || this.description.trim().length === 0) {
        errors.push('Description cannot be empty');
      }
      if (this.description.length > 2000) {
        errors.push('Description must be 2000 characters or less');
      }
    }

    if (this.requirements !== undefined) {
      if (Array.isArray(this.requirements)) {
        this.requirements.forEach((requirement, index) => {
          if (typeof requirement !== 'string') {
            errors.push(`Requirement ${index + 1} must be a string`);
          } else if (requirement.length > 250) {
            errors.push(`Requirement ${index + 1} must be 250 characters or less`);
          }
        });
      } else {
        errors.push('Requirements must be an array');
      }
    }

    if (this.max_applications !== undefined && this.max_applications < 1) {
      errors.push('Max applications must be positive');
    }

    if (this.status !== undefined && !['draft', 'published', 'paused', 'completed'].includes(this.status)) {
      errors.push('Status must be either "draft", "published", "paused", or "completed"');
    }

    // Validate date changes
    if (this.start_date !== undefined && this.end_date !== undefined) {
      const startDate = new Date(this.start_date);
      const endDate = new Date(this.end_date);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    // Validate application questions if provided
    if (this.application_questions !== undefined && Array.isArray(this.application_questions)) {
      this.application_questions.forEach((question, index) => {
        if (!question.question || question.question.trim().length === 0) {
          errors.push(`Question ${index + 1} text is required`);
        }

        if (question.question && question.question.length > 500) {
          errors.push(`Question ${index + 1} text must be 500 characters or less`);
        }

        if (!question.type || !['text', 'textarea', 'select', 'checkbox'].includes(question.type)) {
          errors.push(`Question ${index + 1} must have a valid type`);
        }

        if ((question.type === 'select' || question.type === 'checkbox') && 
            (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
          errors.push(`Question ${index + 1} of type ${question.type} must have options`);
        }

        if (question.max_length && question.max_length < 1) {
          errors.push(`Question ${index + 1} max_length must be positive`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

class CampaignResponseDTO {
  constructor(campaign) {
    this.id = campaign._id;
    this.club_id = campaign.club_id;
    this.title = campaign.title;
    this.description = campaign.description;
    this.requirements = campaign.requirements;
    this.application_questions = campaign.application_questions;
    this.start_date = campaign.start_date;
    this.end_date = campaign.end_date;
    this.max_applications = campaign.max_applications;
    this.status = campaign.status;
    this.statistics = campaign.statistics;
    this.created_by = campaign.created_by;
    this.created_at = campaign.created_at;
    this.updated_at = campaign.updated_at;
  }
}

class CampaignListResponseDTO {
  constructor(campaigns, pagination) {
    this.campaigns = campaigns.map(campaign => new CampaignResponseDTO(campaign));
    this.pagination = pagination;
  }
}

module.exports = {
  CreateCampaignDTO,
  UpdateCampaignDTO,
  CampaignResponseDTO,
  CampaignListResponseDTO
};
