import { X2jOptions, XMLParser } from 'fast-xml-parser';
import he from 'he';
import { VMixApiError, VMixConnectionError, VMixTimeoutError } from './errors';
import { FunctionOptions, VMixConfig, VMixInput, VMixState } from './types';

export class VMix {
  private staticState?: VMixState = undefined;
  public readonly options: VMixConfig;

  constructor(newOptions?: VMixConfig) {
    if (!newOptions) {
      this.options = {
        apiUrl: process.env['VMIX_API_URL'] ?? 'http://localhost:8088/api/',
        timeout: 60000,
      };
    } else {
      this.options = newOptions;

      if (this.options.staticState) {
        this.staticState = this.options.staticState;
      }
    }
  }

  public async getCurrentState(): Promise<VMixState | null> {
    if (this.staticState) {
      return this.staticState;
    }

    const timeout = this.options.timeout ?? 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.options.apiUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.text();
        const options: X2jOptions = {
          allowBooleanAttributes: true,
          ignoreAttributes: false,
          attributeNamePrefix: '',
          parseAttributeValue: true,
          parseTagValue: true,
          tagValueProcessor: (name: string, val: string) => {
            if (val === 'False') {
              return false;
            }
            if (val === 'True') {
              return true;
            }
            return he.decode(val);
          },
          attributeValueProcessor: (name: string, val: string) => {
            if (val === 'False') {
              return false;
            }
            if (val === 'True') {
              return true;
            }
            return he.decode(val, { isAttributeValue: true });
          },
        };
        const parser = new XMLParser(options);
        const state = parser.parse(data);
        return state as VMixState;
      }

      throw new VMixApiError(this.options.apiUrl, response.status, response.statusText);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof VMixApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new VMixTimeoutError(this.options.apiUrl, timeout);
      }

      throw new VMixConnectionError(this.options.apiUrl, error instanceof Error ? error : undefined);
    }
  }

  public async getAllInputs(): Promise<VMixInput[] | null> {
    const state = await this.getCurrentState();
    if (!state) {
      return null;
    }
    if (Array.isArray(state.vmix.inputs.input)) {
      return state.vmix.inputs.input;
    } else {
      return [state.vmix.inputs.input];
    }
  }

  /**
   * Execute a vMix function
   * @param functionName - The vMix function to execute
   * @param options - Optional parameters for the function
   */
  public async executeFunction(functionName: string, options?: FunctionOptions): Promise<void> {
    if (this.staticState) {
      return;
    }

    const params = new URLSearchParams();
    params.set('Function', functionName);

    if (options?.input !== undefined) {
      params.set('Input', String(options.input));
    }
    if (options?.value !== undefined) {
      params.set('Value', options.value);
    }
    if (options?.selectedName !== undefined) {
      params.set('SelectedName', options.selectedName);
    }
    if (options?.selectedIndex !== undefined) {
      params.set('SelectedIndex', String(options.selectedIndex));
    }
    if (options?.duration !== undefined) {
      params.set('Duration', String(options.duration));
    }

    const url = `${this.options.apiUrl}?${params.toString()}`;
    const timeout = this.options.timeout ?? 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new VMixApiError(url, response.status, response.statusText);
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof VMixApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new VMixTimeoutError(url, timeout);
      }

      throw new VMixConnectionError(url, error instanceof Error ? error : undefined);
    }
  }
}

// Re-export types for convenience
export type { FunctionOptions, VMixConfig, VMixInput, VMixState } from './types';
export { isVMixRecordingNode, isVMixStreamingNode, type VMixRecordingNode, type VMixStreamingNode } from './types';
