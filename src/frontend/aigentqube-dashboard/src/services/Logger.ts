export class Logger {
  private static instance: Logger;
  private logHistory: string[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${level.toUpperCase()}] ${timestamp}: ${message}`;
    
    console.log(logEntry);
    
    this.logHistory.push(logEntry);
  }

  public getLogHistory(): string[] {
    return [...this.logHistory];
  }
}
