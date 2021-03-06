import axios, { AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';

export class VMix {
  public readonly options: VMixConfig;

  constructor(newOptions?: VMixConfig) {
    if (!newOptions) {
      this.options = {
        apiUrl: process.env['VMIX_API_URL'] ?? 'http://localhost:8088/api/',
        timeout: 60000,
      };
    } else {
      this.options = newOptions;
    }
  }

  public async getCurrentState(): Promise<VMixState | null> {
    const response = await axios.get(this.options.apiUrl, {
      timeout: this.options.timeout,
    });
    if (response && response.status === 200) {
      const state = await parseStringPromise(response.data, {
        mergeAttrs: true,
        explicitArray: false,
      });
      return state as VMixState;
    }
    return null;
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

  public async executeFunction(
    functionName: string,
    input?: number,
    value?: string,
    selectedName?: string,
    selectedIndex?: number,
    duration?: number,
  ): Promise<void> {
    const url = `${this.options.apiUrl}?Function=${functionName}${input ? `&Input=${input}` : ''}${
      value ? `&Value=${value}` : ''
    }${selectedName ? `&SelectedName=${selectedName}` : ''}${selectedIndex ? `&SelectedIndex=${selectedIndex}` : ''}${
      duration ? `&Duration=${duration}` : ''
    }`;

    await axios.get(url, {
      timeout: this.options.timeout,
    });
  }
}

export interface VMixConfig {
  apiUrl: string;
  timeout?: number;
}

export interface VMixInput {
  key: string;
  number: number;
  type: string;
  title: string;
  state: string;
  position?: number;
  duration?: number;
  loop?: boolean;
}

export interface VMixStreamingNode {
  _: string;

  channel1?: string;
  channel2?: string;
  channel3?: string;
}

export function isVMixStreamingNode(obj: unknown): obj is VMixStreamingNode {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return '_' in obj;
}

export interface VMixState {
  vmix: {
    version: string;
    editions: string;
    inputs: {
      input: VMixInput[];
    };
    overlays: {
      overlay: [
        {
          number: number;
        },
      ];
    };
    preview: string;
    active: string;
    recording: string;
    external: string;
    streaming: string | VMixStreamingNode;
    playlist: string;
    multiCorder: string;
    fullscreen: string;
    audio: {
      master: {
        volume: number;
        muted: boolean;
      };
    };
  };
}
