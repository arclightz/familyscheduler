import { prisma } from '@/lib/prisma';
import {
  GoogleCalendarService,
  createGoogleCalendarService,
  type CalendarEvent,
} from './google-calendar';
import {
  MicrosoftCalendarService,
  createMicrosoftCalendarService,
} from './microsoft-calendar';

/**
 * Encrypted storage for calendar tokens
 * In production, use proper encryption (e.g., @47ng/simple-e2ee or similar)
 */
function encryptTokens(tokens: any): any {
  // TODO: Implement proper encryption before production
  return tokens;
}

function decryptTokens(encrypted: any): any {
  // TODO: Implement proper decryption before production
  return encrypted;
}

/**
 * Unified calendar service that manages both Google and Microsoft calendars
 */
export class CalendarConnectionService {
  /**
   * Connect a Google Calendar account
   */
  static async connectGoogle(userId: string, authCode: string): Promise<void> {
    const googleService = createGoogleCalendarService();

    // Exchange code for tokens
    const tokens = await googleService.getTokensFromCode(authCode);
    googleService.setCredentials(tokens);

    // Get user email
    const accountId = await googleService.getUserEmail();

    // Store connection
    await prisma.calendarConnection.upsert({
      where: {
        id: `${userId}-google-${accountId}`,
      },
      update: {
        access: encryptTokens(tokens),
      },
      create: {
        id: `${userId}-google-${accountId}`,
        user_id: userId,
        provider: 'google',
        account_id: accountId,
        access: encryptTokens(tokens),
      },
    });
  }

  /**
   * Connect a Microsoft Calendar account
   */
  static async connectMicrosoft(userId: string, authCode: string): Promise<void> {
    const msService = createMicrosoftCalendarService();

    // Exchange code for tokens
    const tokens = await msService.getTokensFromCode(authCode);
    msService.setAccessToken(tokens.access_token);

    // Get user email
    const accountId = await msService.getUserEmail();

    // Calculate expiry timestamp
    const expiresAt = tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined;

    // Store connection
    await prisma.calendarConnection.upsert({
      where: {
        id: `${userId}-microsoft-${accountId}`,
      },
      update: {
        access: encryptTokens({ ...tokens, expires_at: expiresAt }),
      },
      create: {
        id: `${userId}-microsoft-${accountId}`,
        user_id: userId,
        provider: 'microsoft',
        account_id: accountId,
        access: encryptTokens({ ...tokens, expires_at: expiresAt }),
      },
    });
  }

  /**
   * Fetch events from all connected calendars for a user
   */
  static async fetchUserEvents(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const connections = await prisma.calendarConnection.findMany({
      where: { user_id: userId },
    });

    const eventPromises = connections.map(async (connection) => {
      try {
        if (connection.provider === 'google') {
          return await this.fetchGoogleEvents(connection, startDate, endDate);
        } else if (connection.provider === 'microsoft') {
          return await this.fetchMicrosoftEvents(connection, startDate, endDate);
        }
        return [];
      } catch (error) {
        console.error(
          `Failed to fetch events from ${connection.provider}:`,
          error
        );
        return [];
      }
    });

    const eventsArrays = await Promise.all(eventPromises);
    return eventsArrays.flat();
  }

  /**
   * Fetch events from a Google Calendar connection
   */
  private static async fetchGoogleEvents(
    connection: any,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const googleService = createGoogleCalendarService();
    const tokens = decryptTokens(connection.access);

    // Refresh token if expired
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      googleService.setCredentials(tokens);
      const newTokens = await googleService.refreshAccessToken();

      // Update stored tokens
      await prisma.calendarConnection.update({
        where: { id: connection.id },
        data: {
          access: encryptTokens({
            ...tokens,
            access_token: newTokens.access_token,
            expiry_date: newTokens.expiry_date,
          }),
        },
      });

      googleService.setCredentials({
        ...tokens,
        access_token: newTokens.access_token,
        expiry_date: newTokens.expiry_date,
      });
    } else {
      googleService.setCredentials(tokens);
    }

    return googleService.fetchEvents(startDate, endDate);
  }

  /**
   * Fetch events from a Microsoft Calendar connection
   */
  private static async fetchMicrosoftEvents(
    connection: any,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const msService = createMicrosoftCalendarService();
    const tokens = decryptTokens(connection.access);

    // Refresh token if expired
    if (tokens.expires_at && tokens.expires_at < Date.now()) {
      const newTokens = await msService.refreshAccessToken(tokens.refresh_token);

      const newExpiresAt = newTokens.expires_in
        ? Date.now() + newTokens.expires_in * 1000
        : undefined;

      // Update stored tokens
      await prisma.calendarConnection.update({
        where: { id: connection.id },
        data: {
          access: encryptTokens({
            ...tokens,
            access_token: newTokens.access_token,
            expires_at: newExpiresAt,
          }),
        },
      });

      msService.setAccessToken(newTokens.access_token);
    } else {
      msService.setAccessToken(tokens.access_token);
    }

    return msService.fetchEvents(startDate, endDate);
  }

  /**
   * Disconnect a calendar
   */
  static async disconnect(connectionId: string): Promise<void> {
    await prisma.calendarConnection.delete({
      where: { id: connectionId },
    });
  }

  /**
   * Get all calendar connections for a user
   */
  static async getUserConnections(userId: string) {
    return prisma.calendarConnection.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        provider: true,
        account_id: true,
      },
    });
  }
}
