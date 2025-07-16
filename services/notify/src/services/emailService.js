const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');
const { getEmailConfig, isEmailConfigured } = require('../config/email');

/**
 * Email Service for sending various types of emails
 * Supports multiple email providers and template rendering
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.templateCache = new Map();
    this.config = getEmailConfig();
    this.templateDir = this.config.templates.dir;
    this.templateCacheTTL = this.config.templates.cacheTTL;
    this.isConfigured = false;
    this.stats = {
      sent: 0,
      failed: 0,
      retries: 0
    };
    
    this.setupTransporter();
  }

  /**
   * Setup email transporter based on configuration
   */
  setupTransporter() {
    try {
      const nodeEnv = process.env.NODE_ENV || 'development';

      // Check if email service is properly configured
      if (!isEmailConfigured()) {
        if (nodeEnv === 'development') {
          logger.email('Email service not configured - emails will be logged only', {
            mode: 'development'
          });
          this.isConfigured = false;
          return;
        } else {
          throw new Error('Email service configuration is incomplete for production');
        }
      }

      let transporterConfig;

      if (this.config.service && this.config.service !== 'custom') {
        // Use predefined service (gmail, yahoo, etc.)
        transporterConfig = {
          service: this.config.service,
          auth: {
            user: this.config.auth.user,
            pass: this.config.auth.pass
          }
        };
      } else {
        // Use custom SMTP configuration
        transporterConfig = {
          host: this.config.smtp.host,
          port: this.config.smtp.port,
          secure: this.config.smtp.secure,
          auth: {
            user: this.config.auth.user,
            pass: this.config.auth.pass
          }
        };
      }

      this.transporter = nodemailer.createTransport(transporterConfig);
      this.isConfigured = true;

      logger.email('Email service configured successfully', {
        service: this.config.service || 'custom',
        host: transporterConfig.host,
        port: transporterConfig.port
      });

    } catch (error) {
      logger.error('Failed to setup email transporter:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Load and compile email template
   * @param {string} templateName - Name of the template directory
   * @param {string} type - Type of template (html, txt)
   */
  async loadTemplate(templateName, type = 'html') {
    const cacheKey = `${templateName}_${type}`;
    
    // Check cache first
    if (process.env.ENABLE_TEMPLATE_CACHING !== 'false') {
      const cached = this.templateCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.templateCacheTTL)) {
        return cached.template;
      }
    }

    try {
      const templatePath = path.join(__dirname, '..', this.templateDir, templateName, `index.${type}`);
      
      if (!await fs.pathExists(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      const templateContent = await fs.readFile(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);

      // Cache the compiled template
      if (process.env.ENABLE_TEMPLATE_CACHING !== 'false') {
        this.templateCache.set(cacheKey, {
          template: compiledTemplate,
          timestamp: Date.now()
        });
      }

      logger.template(`Template loaded: ${templateName}.${type}`);
      return compiledTemplate;

    } catch (error) {
      logger.error(`Failed to load template ${templateName}.${type}:`, error);
      throw error;
    }
  }

  /**
   * Load template metadata
   * @param {string} templateName - Name of the template directory
   */
  async loadTemplateMeta(templateName) {
    try {
      const metaPath = path.join(__dirname, '..', this.templateDir, templateName, 'meta.json');
      
      if (await fs.pathExists(metaPath)) {
        const meta = await fs.readJson(metaPath);
        return meta;
      }

      return {};
    } catch (error) {
      logger.error(`Failed to load template metadata for ${templateName}:`, error);
      return {};
    }
  }

  /**
   * Send email with retry logic
   * @param {Object} emailOptions - Email configuration
   * @param {number} attempt - Current attempt number
   */
  async sendEmail(emailOptions, attempt = 1) {
    const maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3;
    const retryDelay = parseInt(process.env.RETRY_DELAY_MS) || 5000;
    const exponentialBase = parseInt(process.env.RETRY_EXPONENTIAL_BASE) || 2;

    try {
      // In development mode without proper config, just log the email
      if (!this.isConfigured) {
        logger.email('Email would be sent (development mode)', emailOptions);
        return { messageId: `dev-${Date.now()}`, success: true };
      }

      // Verify transporter before sending
      if (attempt === 1) {
        await this.transporter.verify();
      }

      const mailOptions = {
        from: this.config.from,
        ...emailOptions
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.stats.sent++;
      logger.email('Email sent successfully', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: result.messageId,
        attempt
      });

      return { ...result, success: true };

    } catch (error) {
      logger.error(`Email send attempt ${attempt} failed:`, error, {
        to: emailOptions.to,
        subject: emailOptions.subject
      });

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(exponentialBase, attempt - 1);
        this.stats.retries++;
        
        logger.email(`Retrying email send in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries,
          to: emailOptions.to
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendEmail(emailOptions, attempt + 1);
      } else {
        this.stats.failed++;
        throw error;
      }
    }
  }

  /**
   * Send email verification email
   * @param {Object} data - Email data
   */
  async sendEmailVerification(data) {
    try {
      const { userId, email, link, fullName } = data;

      const [htmlTemplate, textTemplate, meta] = await Promise.all([
        this.loadTemplate('email-verification', 'html'),
        this.loadTemplate('email-verification', 'txt'),
        this.loadTemplateMeta('email-verification')
      ]);

      const templateData = {
        fullName,
        verificationLink: link,
        frontendUrl: this.config.frontend.baseUrl
      };

      const emailOptions = {
        to: email,
        subject: meta.subject || 'Verify your email address',
        html: htmlTemplate(templateData),
        text: textTemplate(templateData)
      };

      const result = await this.sendEmail(emailOptions);
      
      logger.email('Email verification sent', {
        userId,
        email,
        messageId: result.messageId
      });

      return result;

    } catch (error) {
      logger.error('Failed to send email verification:', error, { 
        userId: data.userId, 
        email: data.email 
      });
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} data - Email data
   */
  async sendPasswordReset(data) {
    try {
      const { userId, email, link, fullName } = data;

      const [htmlTemplate, textTemplate, meta] = await Promise.all([
        this.loadTemplate('password-reset', 'html'),
        this.loadTemplate('password-reset', 'txt'),
        this.loadTemplateMeta('password-reset')
      ]);

      const templateData = {
        fullName,
        resetLink: link,
        frontendUrl: this.config.frontend.baseUrl
      };

      const emailOptions = {
        to: email,
        subject: meta.subject || 'Reset your password',
        html: htmlTemplate(templateData),
        text: textTemplate(templateData)
      };

      const result = await this.sendEmail(emailOptions);
      
      logger.email('Password reset email sent', {
        userId,
        email,
        messageId: result.messageId
      });

      return result;

    } catch (error) {
      logger.error('Failed to send password reset email:', error, { 
        userId: data.userId, 
        email: data.email 
      });
      throw error;
    }
  }

  /**
   * Send RSVP invitation email
   * @param {Object} data - Email data
   */
  async sendRSVP(data) {
    try {
      const { userId, email, fullName, eventName, eventDate, eventLocation, rsvpLink } = data;

      const [htmlTemplate, textTemplate, meta] = await Promise.all([
        this.loadTemplate('rsvp', 'html'),
        this.loadTemplate('rsvp', 'txt'),
        this.loadTemplateMeta('rsvp')
      ]);

      const templateData = {
        fullName,
        eventName,
        eventDate,
        eventLocation,
        rsvpLink,
        frontendUrl: this.config.frontend.baseUrl,
        unsubscribeUrl: process.env.UNSUBSCRIBE_URL
      };

      const emailOptions = {
        to: email,
        subject: meta.subject || `RSVP: ${eventName}`,
        html: htmlTemplate(templateData),
        text: textTemplate(templateData)
      };

      const result = await this.sendEmail(emailOptions);
      
      logger.email('RSVP invitation sent', {
        userId,
        email,
        eventName,
        messageId: result.messageId
      });

      return result;

    } catch (error) {
      logger.error('Failed to send RSVP invitation:', error, { 
        userId: data.userId, 
        email: data.email,
        eventName: data.eventName
      });
      throw error;
    }
  }

  /**
   * Send announcement email
   * @param {Object} data - Email data
   */
  async sendAnnouncement(data) {
    try {
      const { recipients, title, content, priority = 'normal' } = data;

      const [htmlTemplate, textTemplate, meta] = await Promise.all([
        this.loadTemplate('announcement', 'html'),
        this.loadTemplate('announcement', 'txt'),
        this.loadTemplateMeta('announcement')
      ]);

      const results = [];

      for (const recipient of recipients) {
        try {
          const templateData = {
            fullName: recipient.fullName,
            title,
            content,
            frontendUrl: this.config.frontend.baseUrl,
            unsubscribeUrl: process.env.UNSUBSCRIBE_URL
          };

          const emailOptions = {
            to: recipient.email,
            subject: meta.subject || title,
            html: htmlTemplate(templateData),
            text: textTemplate(templateData),
            priority: priority === 'high' ? 'high' : 'normal'
          };

          const result = await this.sendEmail(emailOptions);
          results.push({ 
            email: recipient.email, 
            success: true, 
            messageId: result.messageId 
          });

        } catch (error) {
          logger.error('Failed to send announcement to recipient:', error, {
            email: recipient.email,
            title
          });
          results.push({ 
            email: recipient.email, 
            success: false, 
            error: error.message 
          });
        }
      }

      logger.email('Announcement batch sent', {
        title,
        totalRecipients: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return results;

    } catch (error) {
      logger.error('Failed to send announcement:', error, { title: data.title });
      throw error;
    }
  }

  /**
   * Get email service health status
   */
  async getHealthStatus() {
    try {
      if (!this.isConfigured) {
        return {
          healthy: false,
          configured: false,
          stats: this.stats,
          service: process.env.EMAIL_SERVICE || 'not configured'
        };
      }

      // Verify connection
      await this.transporter.verify();

      return {
        healthy: true,
        configured: true,
        stats: this.stats,
        service: process.env.EMAIL_SERVICE || 'custom'
      };

    } catch (error) {
      return {
        healthy: false,
        configured: this.isConfigured,
        error: error.message,
        stats: this.stats,
        service: process.env.EMAIL_SERVICE || 'not configured'
      };
    }
  }

  /**
   * Clear template cache
   */
  clearTemplateCache() {
    this.templateCache.clear();
    logger.template('Template cache cleared');
  }

  /**
   * Get service statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = { sent: 0, failed: 0, retries: 0 };
    logger.email('Email service statistics reset');
  }
}

module.exports = new EmailService(); 