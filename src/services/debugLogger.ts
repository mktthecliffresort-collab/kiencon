export interface DebugLogEntry {
  id: string;
  timestamp: string;
  category: 'AUTH' | 'API' | 'SUPABASE' | 'SMTP' | 'SYSTEM' | 'ERROR';
  message: string;
  details?: any;
  level: 'info' | 'warn' | 'error' | 'success';
}

const LOG_STORAGE_KEY = 'kienhoc_production_logs_v1';
const MAX_LOGS = 150;

class DebugLoggerService {
  private logs: DebugLogEntry[] = [];
  private listeners: Array<(logs: DebugLogEntry[]) => void> = [];

  constructor() {
    this.loadPersistedLogs();
    if (typeof window !== 'undefined') {
      (window as any).__KIENHOC_LOGGER__ = this;
      (window as any).__KIENHOC_LOGS__ = () => this.getLogs();
    }
  }

  private loadPersistedLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(LOG_STORAGE_KEY);
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      }
    } catch {
      this.logs = [];
    }
  }

  private persistLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
      }
    } catch {
      // ignore quota errors
    }
  }

  public log(
    category: DebugLogEntry['category'],
    message: string,
    details?: any,
    level: DebugLogEntry['level'] = 'info'
  ) {
    const entry: DebugLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0'),
      category,
      message,
      details,
      level,
    };

    // Format console output for DevTools
    const styleMap = {
      info: 'color: #3b82f6; font-weight: bold;',
      success: 'color: #10b981; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
    };

    console.log(
      `%c[${entry.category}] %c${entry.timestamp} %c${message}`,
      styleMap[level] || styleMap.info,
      'color: #888; font-size: 10px;',
      'color: inherit;',
      details !== undefined ? details : ''
    );

    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }
    this.persistLogs();
    this.notify();
  }

  public success(category: DebugLogEntry['category'], message: string, details?: any) {
    this.log(category, message, details, 'success');
  }

  public warn(category: DebugLogEntry['category'], message: string, details?: any) {
    this.log(category, message, details, 'warn');
  }

  public error(category: DebugLogEntry['category'], message: string, details?: any) {
    this.log(category, message, details, 'error');
  }

  public getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(LOG_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(callback: (logs: DebugLogEntry[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getLogs());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    const copy = this.getLogs();
    this.listeners.forEach((cb) => cb(copy));
  }

  public exportAsText(): string {
    return this.logs
      .map((l) => `[${l.timestamp}] [${l.category}] [${l.level.toUpperCase()}] ${l.message} ${l.details ? JSON.stringify(l.details) : ''}`)
      .join('\n');
  }
}

export const debugLogger = new DebugLoggerService();
