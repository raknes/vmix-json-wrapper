export class VMixError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VMixError';
  }
}

export class VMixConnectionError extends VMixError {
  public readonly url: string;
  public readonly cause?: Error;

  constructor(url: string, cause?: Error) {
    super(`Failed to connect to vMix at ${url}`);
    this.name = 'VMixConnectionError';
    this.url = url;
    this.cause = cause;
  }
}

export class VMixTimeoutError extends VMixError {
  public readonly url: string;
  public readonly timeoutMs: number;

  constructor(url: string, timeoutMs: number) {
    super(`Request to vMix timed out after ${timeoutMs}ms: ${url}`);
    this.name = 'VMixTimeoutError';
    this.url = url;
    this.timeoutMs = timeoutMs;
  }
}

export class VMixApiError extends VMixError {
  public readonly url: string;
  public readonly status: number;
  public readonly statusText: string;

  constructor(url: string, status: number, statusText: string) {
    super(`vMix API error ${status} (${statusText}): ${url}`);
    this.name = 'VMixApiError';
    this.url = url;
    this.status = status;
    this.statusText = statusText;
  }
}
