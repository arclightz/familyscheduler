import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { z } from 'zod';
import type { CalendarEvent } from './google-calendar';

/**
 * Microsoft Graph OAuth configuration
 */
export const MicrosoftCalendarConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  tenantId: z.string().default('common'),
  redirectUri: z.string().url(),
});

export type MicrosoftCalendarConfig = z.infer<typeof MicrosoftCalendarConfigSchema>;

/**
 * Microsoft Graph event schema
 */
export const MicrosoftGraphEventSchema = z.object({
  id: z.string(),
  subject: z.string().optional(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string().optional(),
  }),
  isAllDay: z.boolean().optional(),
  bodyPreview: z.string().optional(),
});

export type MicrosoftGraphEvent = z.infer<typeof MicrosoftGraphEventSchema>;

/**
 * Microsoft Calendar OAuth service
 */
export class MicrosoftCalendarService {
  private config: MicrosoftCalendarConfig;
  private client?: Client;

  constructor(config: MicrosoftCalendarConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      response_mode: 'query',
      scope: 'offline_access Calendars.Read User.Read',
      state: Math.random().toString(36).substring(7),
    });

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }> {
    const tokenEndpoint = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get tokens: ${error}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  }

  /**
   * Set access token and initialize Graph client
   */
  setAccessToken(accessToken: string): void {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Fetch calendar events for a date range
   */
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.client) {
      throw new Error('Client not initialized. Call setAccessToken first.');
    }

    const response = await this.client
      .api('/me/calendarview')
      .query({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        $select: 'subject,start,end,isAllDay,bodyPreview',
        $orderby: 'start/dateTime',
      })
      .get();

    const events = response.value || [];

    const calendarEvents: CalendarEvent[] = [];

    for (const event of events) {
      try {
        const validated = MicrosoftGraphEventSchema.parse(event);

        calendarEvents.push({
          id: validated.id,
          provider: 'microsoft',
          title: validated.subject || '(No title)',
          start_at: new Date(validated.start.dateTime),
          end_at: new Date(validated.end.dateTime),
          is_all_day: validated.isAllDay || false,
          description: validated.bodyPreview,
        });
      } catch {
        // Skip invalid events
      }
    }

    return calendarEvents;
  }

  /**
   * Get user email from Microsoft account
   */
  async getUserEmail(): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized. Call setAccessToken first.');
    }

    const response = await this.client.api('/me').select('mail,userPrincipalName').get();

    return response.mail || response.userPrincipalName;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in?: number;
  }> {
    const tokenEndpoint = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  }
}

/**
 * Create Microsoft Calendar service instance from environment variables
 */
export function createMicrosoftCalendarService(): MicrosoftCalendarService {
  const config = MicrosoftCalendarConfigSchema.parse({
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/calendar/connect/microsoft/callback`,
  });

  return new MicrosoftCalendarService(config);
}
