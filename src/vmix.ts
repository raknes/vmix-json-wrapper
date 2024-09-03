import axios from 'axios';
import { X2jOptions, XMLParser } from 'fast-xml-parser';
import he from 'he';
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
    const response = await axios.get(this.options.apiUrl, {
      timeout: this.options.timeout,
    });
    if (response && response.status === 200) {
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
      const state = parser.parse(response.data);
      return state as VMixState;
    }
    throw new Error();
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
    if (this.staticState) {
      return;
    }
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
  staticState?: VMixState;
}

export interface VMixInput {
  key: string;
  number: number;
  type: string;
  title: string;
  shortTitle?: string;
  state: string;
  position?: string;
  duration?: string;
  markIn?: number;
  markOut?: number;
  loop?: boolean;
  muted?: string;
  volume?: number;
}

export interface VMixStreamingNode {
  _: string;

  channel1?: string;
  channel2?: string;
  channel3?: string;
}

export interface VMixRecordingNode {
  _: string;

  duration?: number;
  filename1?: string;
  filename2?: string;
}

export function isVMixStreamingNode(obj: unknown): obj is VMixStreamingNode {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return 'channel1' in obj || 'channel2' in obj || 'channel3' in obj;
}
export function isVMixRecordingNode(obj: unknown): obj is VMixRecordingNode {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return 'filename1' in obj || 'filename2' in obj;
}

export interface VMixState {
  vmix: {
    version: string;
    edition: string;
    preset: string;
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
    preview: number;
    active: number;
    recording: string | VMixRecordingNode;
    external: string;
    streaming: string | VMixStreamingNode;
    playlist: string;
    multiCorder: string;
    fullscreen: boolean;
    audio: {
      master: {
        volume: number;
        muted: boolean;
      };
    };
  };
}
