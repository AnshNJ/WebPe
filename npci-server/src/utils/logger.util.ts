const log = (level: string, message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (args.length > 0) {
    console.log(logMessage, ...args);
  } else {
    console.log(logMessage);
  }
};

const logger = {
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
};

export default logger;

