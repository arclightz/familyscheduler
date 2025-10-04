import { google } from 'googleapis';
import { z } from 'zod';

/**
 * Google Calendar OAuth configuration
 */
export const GoogleCalendarConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  redirectUri: z.string().url(),
});

export type GoogleCalendarConfig = z.infer<typeof GoogleCalendarConfigSchema>;

/**
 * Calendar event schema from Google
 */
export const GoogleCalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
  status: z.string().optional(),
  description: z.string().optional(),
});

export type GoogleCalendarEvent = z.infer<typeof GoogleCalendarEventSchema>;

/**
 * Normalized calendar event for our system
 */
export interface CalendarEvent {
  id: string;
  provider: 'google' | 'microsoft';
  title: string;
  start_at: Date;
  end_at: Date;
  is_all_day: boolean;
  description?: string;
}

/**
 * Google Calendar OAuth service
 */
export class GoogleCalendarService {
  private oauth2Client;

  constructor(config: GoogleCalendarConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined,
    };
  }

  /**
   * Set credentials and refresh if needed
   */
  setCredentials(tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  }): void {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Fetch calendar events for a date range
   */
  async fetchEvents(
    startDate: Date,
    endDate: Date,
    calendarId = 'primary'
  ): Promise<CalendarEvent[]> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    const calendarEvents: CalendarEvent[] = [];

    for (const event of events) {
      try {
        const validated = GoogleCalendarEventSchema.parse(event);

        const start = validated.start.dateTime || validated.start.date;
        const end = validated.end.dateTime || validated.end.date;

        if (!start || !end) continue;

        const isAllDay = !validated.start.dateTime;

        calendarEvents.push({
          id: validated.id,
          provider: 'google',
          title: validated.summary || '(No title)',
          start_at: new Date(start),
          end_at: new Date(end),
          is_all_day: isAllDay,
          description: validated.description,
        });
      } catch {
        // Skip invalid events
      }
    }

    return calendarEvents;
  }

  /**
   * Get user email from Google account
   */
  async getUserEmail(): Promise<string> {
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const response = await oauth2.userinfo.get();
    return response.data.email!;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<{
    access_token: string;
    expiry_date?: number;
  }> {
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return {
      access_token: credentials.access_token!,
      expiry_date: credentials.expiry_date || undefined,
    };
  }
}

/**
 * Create Google Calendar service instance from environment variables
 */
export function createGoogleCalendarService(): GoogleCalendarService {
  const config = GoogleCalendarConfigSchema.parse({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/calendar/connect/google/callback`,
  });

  return new GoogleCalendarService(config);
}
