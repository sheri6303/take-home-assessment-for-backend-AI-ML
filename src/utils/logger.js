class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  formatMessage(level, message, requestId, ...args) {
    const timestamp = new Date().toISOString();
    const requestIdPart = requestId ? `[${requestId}]` : '';
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${requestIdPart ? ` ${requestIdPart}` : ''}`;
    
    if (args.length === 0) {
      return `${prefix} ${message}`;
    }
    
    if (this.isDevelopment || level === 'error') {
      try {
        const argsStr = args.map(arg => 
          arg instanceof Error ? { message: arg.message, stack: arg.stack } : arg
        );
        return `${prefix} ${message} ${JSON.stringify(argsStr)}`;
      } catch {
        return `${prefix} ${message} [Unable to stringify arguments]`;
      }
    }
    
    return `${prefix} ${message}`;
  }

  // Helper to detect if second arg is a requestId (UUID format) or regular arg
  _extractRequestId(...args) {
    if (args.length > 0 && typeof args[0] === 'string' && args[0].match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return { requestId: args[0], remainingArgs: args.slice(1) };
    }
    return { requestId: undefined, remainingArgs: args };
  }

  debug(message, ...args) {
    if (this.isDevelopment) {
      const { requestId, remainingArgs } = this._extractRequestId(...args);
      console.debug(this.formatMessage('debug', message, requestId, ...remainingArgs));
    }
  }

  info(message, ...args) {
    const { requestId, remainingArgs } = this._extractRequestId(...args);
    console.info(this.formatMessage('info', message, requestId, ...remainingArgs));
  }

  warn(message, ...args) {
    const { requestId, remainingArgs } = this._extractRequestId(...args);
    console.warn(this.formatMessage('warn', message, requestId, ...remainingArgs));
  }

  error(message, ...args) {
    // For error, first arg after message might be Error or requestId
    let requestId = undefined;
    let remainingArgs = args;
    
    if (args.length > 0 && typeof args[0] === 'string' && args[0].match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      requestId = args[0];
      remainingArgs = args.slice(1);
    }
    
    console.error(this.formatMessage('error', message, requestId, ...remainingArgs));
  }
}

export const logger = new Logger();
