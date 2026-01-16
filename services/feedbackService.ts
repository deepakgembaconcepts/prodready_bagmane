/**
 * Feedback & Survey Service - CSAT & NPS Management
 * Handles automated and manual survey triggers, data collection, and dashboard population
 */

export interface CSATSurvey {
  id: string;
  surveyId: string;
  ticketId: string;
  tenantPoC: string;
  tenantEmail: string;
  building: string;
  surveyLink: string;
  status: 'Sent' | 'Pending' | 'Completed' | 'Failed';
  sentDate: Date;
  completedDate?: Date;
  lastSentDate?: Date;
  autoTriggerNextDue?: Date; // 6 months from completion
  responses?: CSATResponse;
  emailsSent: number;
  lastEmailSentAt?: Date;
}

export interface CSATResponse {
  overallSatisfaction: number; // 1-5
  serviceQuality: number; // 1-5
  responseTime: number; // 1-5
  professionalismScore: number; // 1-5
  comments?: string;
  nps?: number; // 0-10
}

export interface NPSSurvey {
  id: string;
  surveyId: string;
  administratorId: string;
  administratorEmail: string;
  recipientEmails: string[];
  building: string;
  surveyLink: string;
  triggerType: 'Manual' | 'Automatic';
  status: 'Sent' | 'Pending' | 'Completed' | 'Failed';
  sentDate: Date;
  completedDate?: Date;
  responses?: NPSResponse[];
  emailsSent: number;
  lastEmailSentAt?: Date;
  scheduledNextTrigger?: Date; // 12 months from last completion
}

export interface NPSResponse {
  respondentId: string;
  respondentName: string;
  respondentEmail: string;
  score: number; // 0-10
  category?: 'Promoter' | 'Passive' | 'Detractor'; // Score: 9-10=Promoter, 7-8=Passive, 0-6=Detractor
  feedback?: string;
  responseDate?: Date;
}

export interface FeedbackDashboardMetrics {
  csat: {
    averageScore: number;
    totalResponses: number;
    lastMonthAverage?: number;
    trend?: 'Up' | 'Down' | 'Stable';
    byBuilding?: { [building: string]: number };
    byCategory?: {
      overallSatisfaction: number;
      serviceQuality: number;
      responseTime: number;
      professionalismScore: number;
    };
  };
  nps: {
    currentNPS: number; // % Promoters - % Detractors
    totalRespondents: number;
    promotersPercent: number;
    passivePercent: number;
    detractorsPercent: number;
    trend?: 'Up' | 'Down' | 'Stable';
    byBuilding?: { [building: string]: number };
  };
  automationStatus: {
    nextCSATTrigger?: Date;
    nextNPSTrigger?: Date;
    failedEmailCount: number;
    pendingSurveys: number;
  };
}

/**
 * CSAT Service - Automated 6-month trigger
 */
export class CSATService {
  /**
   * Get all CSAT surveys
   */
  static async getAllSurveys(): Promise<CSATSurvey[]> {
    const response = await fetch('/api/csat/surveys');
    if (!response.ok) throw new Error('Failed to fetch CSAT surveys');
    return response.json();
  }

  /**
   * Get CSAT survey by ID
   */
  static async getSurveyById(surveyId: string): Promise<CSATSurvey> {
    const response = await fetch(`/api/csat/surveys/${surveyId}`);
    if (!response.ok) throw new Error('Failed to fetch CSAT survey');
    return response.json();
  }

  /**
   * Create new CSAT survey (after ticket resolution)
   * Automatically triggered 6 months after completion
   */
  static async createAutoSurvey(ticketId: string, tenantPoC: string, tenantEmail: string, building: string): Promise<CSATSurvey> {
    const response = await fetch('/api/csat/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId,
        tenantPoC,
        tenantEmail,
        building,
        status: 'Pending',
        autoTriggerNextDue: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
      }),
    });
    if (!response.ok) throw new Error('Failed to create CSAT survey');
    return response.json();
  }

  /**
   * Send CSAT survey link
   */
  static async sendSurveyLink(surveyId: string, email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/csat/surveys/${surveyId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send CSAT survey link');
    return response.json();
  }

  /**
   * Resend CSAT survey (manual retry)
   */
  static async retrySendSurvey(surveyId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/csat/surveys/${surveyId}/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to resend CSAT survey');
    return response.json();
  }

  /**
   * Submit CSAT responses (from external form)
   */
  static async submitResponse(surveyId: string, response: CSATResponse): Promise<CSATSurvey> {
    const apiResponse = await fetch(`/api/csat/surveys/${surveyId}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
    if (!apiResponse.ok) throw new Error('Failed to submit CSAT response');
    return apiResponse.json();
  }

  /**
   * Get CSAT metrics for dashboard
   */
  static async getDashboardMetrics(): Promise<FeedbackDashboardMetrics> {
    const response = await fetch('/api/csat/metrics');
    if (!response.ok) throw new Error('Failed to fetch CSAT metrics');
    return response.json();
  }

  /**
   * Trigger pending CSAT surveys (auto-send every 6 months)
   */
  static async triggerPendingSurveys(): Promise<{ triggered: number; failed: number }> {
    const response = await fetch('/api/csat/trigger-pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to trigger pending CSAT surveys');
    return response.json();
  }
}

/**
 * NPS Service - Manual admin trigger with 12-month schedule
 */
export class NPSService {
  /**
   * Get all NPS surveys
   */
  static async getAllSurveys(): Promise<NPSSurvey[]> {
    const response = await fetch('/api/nps/surveys');
    if (!response.ok) throw new Error('Failed to fetch NPS surveys');
    return response.json();
  }

  /**
   * Get NPS survey by ID
   */
  static async getSurveyById(surveyId: string): Promise<NPSSurvey> {
    const response = await fetch(`/api/nps/surveys/${surveyId}`);
    if (!response.ok) throw new Error('Failed to fetch NPS survey');
    return response.json();
  }

  /**
   * Create and send NPS survey (manual trigger by admin)
   */
  static async createAndSendSurvey(
    administratorId: string,
    administratorEmail: string,
    recipientEmails: string[],
    building: string
  ): Promise<NPSSurvey> {
    const response = await fetch('/api/nps/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        administratorId,
        administratorEmail,
        recipientEmails,
        building,
        triggerType: 'Manual',
        status: 'Sent',
        sentDate: new Date(),
        scheduledNextTrigger: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months
      }),
    });
    if (!response.ok) throw new Error('Failed to create NPS survey');
    return response.json();
  }

  /**
   * Send NPS survey link to recipients
   */
  static async sendSurveyLink(surveyId: string, emails: string[]): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/nps/surveys/${surveyId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    });
    if (!response.ok) throw new Error('Failed to send NPS survey links');
    return response.json();
  }

  /**
   * Submit NPS response (from external form)
   */
  static async submitResponse(surveyId: string, response: NPSResponse): Promise<NPSSurvey> {
    const apiResponse = await fetch(`/api/nps/surveys/${surveyId}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
    if (!apiResponse.ok) throw new Error('Failed to submit NPS response');
    return apiResponse.json();
  }

  /**
   * Get NPS metrics for dashboard
   */
  static async getDashboardMetrics(): Promise<FeedbackDashboardMetrics> {
    const response = await fetch('/api/nps/metrics');
    if (!response.ok) throw new Error('Failed to fetch NPS metrics');
    return response.json();
  }

  /**
   * Get list of admin-trigger opportunities (every 12 months per building)
   */
  static async getTriggerOpportunities(): Promise<Array<{ building: string; lastTrigger?: Date; nextAvailable?: Date }>> {
    const response = await fetch('/api/nps/trigger-opportunities');
    if (!response.ok) throw new Error('Failed to fetch trigger opportunities');
    return response.json();
  }
}

/**
 * Combined Feedback Dashboard Metrics
 */
export class FeedbackService {
  static async getCombinedMetrics(): Promise<FeedbackDashboardMetrics> {
    const [csat, nps] = await Promise.all([
      CSATService.getDashboardMetrics(),
      NPSService.getDashboardMetrics(),
    ]);

    return {
      csat: csat.csat,
      nps: nps.nps,
      automationStatus: {
        ...csat.automationStatus,
        ...nps.automationStatus,
      },
    };
  }
}
