type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogMetadata {
  [key: string]: any;
}

export interface Logger {
  debug(message: string, meta?: LogMetadata): void;
  info(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  error(message: string, meta?: LogMetadata): void;
}

/**
 * Creates a logger instance for a microservice.
 * 
 * @param serviceName - Service identifier (e.g., 'auth-service', 'course-service')
 * @returns Logger with structured logging capabilities
 */
export function createLogger(serviceName: string): Logger {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  function log(level: LogLevel, message: string, meta?: LogMetadata): void {
    const timestamp = new Date().toISOString();

    if (isDevelopment) {
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      console.log(`[${timestamp}] [${serviceName}] [${level}] ${message}${metaStr}`);
    } else {
      const logEntry = {
        timestamp,
        service: serviceName,
        level,
        message,
        ...(meta && { meta }),
      };
      console.log(JSON.stringify(logEntry));
    }
  }

  return {
    debug: (message: string, meta?: LogMetadata) => log('DEBUG', message, meta),
    info: (message: string, meta?: LogMetadata) => log('INFO', message, meta),
    warn: (message: string, meta?: LogMetadata) => log('WARN', message, meta),
    error: (message: string, meta?: LogMetadata) => log('ERROR', message, meta),
  };
}
