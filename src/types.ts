export interface VMixConfig {
  apiUrl: string;
  timeout?: number;
  staticState?: VMixState;
}

export interface FunctionOptions {
  input?: number;
  value?: string;
  selectedName?: string;
  selectedIndex?: number;
  duration?: number;
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
