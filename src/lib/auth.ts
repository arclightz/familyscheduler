import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import type { Adapter } from 'next-auth/adapters';

/**
 * Check if OAuth providers are properly configured
 */
const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const hasMicrosoftCredentials = Boolean(
  process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
);

/**
 * NextAuth configuration with Prisma adapter and authentication providers.
 * Supports OAuth (Google, Microsoft) and email/password for development.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Only add OAuth providers if credentials are configured
    ...(hasGoogleCredentials
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                scope: [
                  'openid',
                  'email',
                  'profile',
                  'https://www.googleapis.com/auth/calendar.readonly',
                ].join(' '),
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          }),
        ]
      : []),
    ...(hasMicrosoftCredentials
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            tenantId: process.env.MICROSOFT_TENANT_ID ?? 'common',
            authorization: {
              params: {
                scope: 'openid email profile offline_access Calendars.Read',
              },
            },
          }),
        ]
      : []),
    // Development credentials provider (always available)
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // In development mode, accept any email/password combination
        // and create/find the user automatically
        if (process.env.NODE_ENV === 'development') {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            // Auto-create user in development
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
                emailVerified: new Date(),
              },
            });
          }

          return {
            id: user.user_id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        // In production, you should verify password against a hash
        throw new Error('Credentials authentication is only available in development mode');
      },
    }),
  ],
  session: {
    strategy: hasGoogleCredentials || hasMicrosoftCredentials ? 'database' : 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // For database sessions
        if (user) {
          session.user.id = user.id;
        }
        // For JWT sessions (credentials provider)
        else if (token?.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Export auth configuration status for use in UI
 */
export const authConfig = {
  hasGoogleCredentials,
  hasMicrosoftCredentials,
  hasOAuthProviders: hasGoogleCredentials || hasMicrosoftCredentials,
  isDevelopment: process.env.NODE_ENV === 'development',
};
