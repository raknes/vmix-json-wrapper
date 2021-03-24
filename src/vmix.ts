import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export class VMix {
  public readonly options: VMixConfig;
  constructor(newOptions?: VMixConfig) {
    if (!newOptions) {
      this.options = {
        apiUrl: process.env['VMIX_API_URL'] ?? 'http://localhost:8088/api/',
      };
    } else {
      this.options = newOptions;
    }
  }

  public async getCurrentState(): Promise<VMixState | null> {
    const response = await axios.get(this.options.apiUrl);
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

  public async executeFunction(functionName: string, input?: number, value?: string): Promise<void> {
    const url = `${this.options.apiUrl}?Function=${encodeURIComponent(functionName)}${
      input ? `&Input=${encodeURIComponent(input)}` : ''
    }${value ? `&Value=${encodeURIComponent(value)}` : ''}`;

    await axios.get(url);
  }
}

export interface VMixConfig {
  apiUrl: string;
}

export interface VMixInput {
  key: string;
  number: number;
  type: string;
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
    streaming: string;
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
