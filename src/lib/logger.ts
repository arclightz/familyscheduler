/**
 * Simple logger utility
 * In production, replace with Pino or Winston
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, ...args);
        }
        break;
      case 'info':
      default:
        console.log(prefix, message, ...args);
    }
  }

  info(message: string | Record<string, any>, ...args: unknown[]) {
    if (typeof message === 'object') {
      this.log('info', JSON.stringify(message), ...args);
    } else {
      this.log('info', message, ...args);
    }
  }

  warn(message: string | Record<string, any>, ...args: unknown[]) {
    if (typeof message === 'object') {
      this.log('warn', JSON.stringify(message), ...args);
    } else {
      this.log('warn', message, ...args);
    }
  }

  error(message: string | Record<string, any>, ...args: unknown[]) {
    if (typeof message === 'object') {
      this.log('error', JSON.stringify(message), ...args);
    } else {
      this.log('error', message, ...args);
    }
  }

  debug(message: string | Record<string, any>, ...args: unknown[]) {
    if (typeof message === 'object') {
      this.log('debug', JSON.stringify(message), ...args);
    } else {
      this.log('debug', message, ...args);
    }
  }
}

export const logger = new Logger();
