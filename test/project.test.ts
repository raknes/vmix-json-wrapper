import { describe, it, expect } from 'vitest';
import { VMixProject } from '../src/project';
import { VMixState, VMixInput } from '../src/types';

const createTestState = (): VMixState => ({
  vmix: {
    version: '24.0.0.51',
    edition: '4K',
    preset: '',
    inputs: {
      input: [
        {
          key: 'input-key-1',
          number: 1,
          type: 'Blank',
          title: 'Input 1',
          shortTitle: 'In1',
          state: 'Paused',
        },
        {
          key: 'input-key-2',
          number: 2,
          type: 'Video',
          title: 'Input 2',
          shortTitle: 'In2',
          state: 'Running',
        },
      ],
    },
    overlays: {
      overlay: [{ number: 1 }],
    },
    preview: 2,
    active: 1,
    recording: 'True',
    external: 'False',
    streaming: 'False',
    playlist: 'False',
    multiCorder: 'False',
    fullscreen: false,
    audio: {
      master: {
        volume: 80,
        muted: false,
      },
    },
  },
});

describe('VMixProject', () => {
  describe('constructor and getState', () => {
    it('should create a deep copy of the initial state', () => {
      const initialState = createTestState();
      const project = new VMixProject(initialState);

      // Modify original state
      initialState.vmix.version = 'modified';

      // Project state should be unaffected
      const projectState = project.getState();
      expect(projectState.vmix.version).toBe('24.0.0.51');
    });

    it('should return an immutable copy from getState', () => {
      const project = new VMixProject(createTestState());
      const state1 = project.getState();
      state1.vmix.version = 'modified';

      const state2 = project.getState();
      expect(state2.vmix.version).toBe('24.0.0.51');
    });
  });

  describe('getInputs', () => {
    it('should return all inputs as an array', () => {
      const project = new VMixProject(createTestState());
      const inputs = project.getInputs();

      expect(inputs).toHaveLength(2);
      expect(inputs[0].title).toBe('Input 1');
      expect(inputs[1].title).toBe('Input 2');
    });

    it('should handle single input (non-array)', () => {
      const state = createTestState();
      state.vmix.inputs.input = state.vmix.inputs.input[0] as unknown as VMixInput[];
      const project = new VMixProject(state);

      const inputs = project.getInputs();
      expect(inputs).toHaveLength(1);
      expect(inputs[0].title).toBe('Input 1');
    });
  });

  describe('getInputByNumber', () => {
    it('should find input by number', () => {
      const project = new VMixProject(createTestState());

      const input = project.getInputByNumber(2);
      expect(input).toBeDefined();
      expect(input?.title).toBe('Input 2');
    });

    it('should return undefined for non-existent number', () => {
      const project = new VMixProject(createTestState());

      const input = project.getInputByNumber(99);
      expect(input).toBeUndefined();
    });
  });

  describe('getInputByKey', () => {
    it('should find input by key', () => {
      const project = new VMixProject(createTestState());

      const input = project.getInputByKey('input-key-2');
      expect(input).toBeDefined();
      expect(input?.title).toBe('Input 2');
    });

    it('should return undefined for non-existent key', () => {
      const project = new VMixProject(createTestState());

      const input = project.getInputByKey('non-existent-key');
      expect(input).toBeUndefined();
    });
  });

  describe('addInput', () => {
    it('should add a new input', () => {
      const project = new VMixProject(createTestState());
      const newInput: VMixInput = {
        key: 'input-key-3',
        number: 3,
        type: 'Image',
        title: 'Input 3',
        state: 'Paused',
      };

      project.addInput(newInput);
      const inputs = project.getInputs();

      expect(inputs).toHaveLength(3);
      expect(inputs[2].title).toBe('Input 3');
    });

    it('should convert single input to array when adding', () => {
      const state = createTestState();
      state.vmix.inputs.input = state.vmix.inputs.input[0] as unknown as VMixInput[];
      const project = new VMixProject(state);

      const newInput: VMixInput = {
        key: 'input-key-new',
        number: 2,
        type: 'Video',
        title: 'New Input',
        state: 'Paused',
      };

      project.addInput(newInput);
      const inputs = project.getInputs();

      expect(inputs).toHaveLength(2);
    });
  });

  describe('removeInputByNumber', () => {
    it('should remove input by number and return true', () => {
      const project = new VMixProject(createTestState());

      const result = project.removeInputByNumber(1);

      expect(result).toBe(true);
      expect(project.getInputs()).toHaveLength(1);
      expect(project.getInputByNumber(1)).toBeUndefined();
    });

    it('should return false for non-existent number', () => {
      const project = new VMixProject(createTestState());

      const result = project.removeInputByNumber(99);

      expect(result).toBe(false);
      expect(project.getInputs()).toHaveLength(2);
    });
  });

  describe('removeInputByKey', () => {
    it('should remove input by key and return true', () => {
      const project = new VMixProject(createTestState());

      const result = project.removeInputByKey('input-key-1');

      expect(result).toBe(true);
      expect(project.getInputs()).toHaveLength(1);
      expect(project.getInputByKey('input-key-1')).toBeUndefined();
    });

    it('should return false for non-existent key', () => {
      const project = new VMixProject(createTestState());

      const result = project.removeInputByKey('non-existent');

      expect(result).toBe(false);
      expect(project.getInputs()).toHaveLength(2);
    });
  });

  describe('updateInput', () => {
    it('should update input properties and return true', () => {
      const project = new VMixProject(createTestState());

      const result = project.updateInput(1, { title: 'Updated Title', type: 'Camera' });

      expect(result).toBe(true);
      const input = project.getInputByNumber(1);
      expect(input?.title).toBe('Updated Title');
      expect(input?.type).toBe('Camera');
      expect(input?.key).toBe('input-key-1'); // Unchanged properties preserved
    });

    it('should preserve the original input number', () => {
      const project = new VMixProject(createTestState());

      project.updateInput(1, { number: 99 } as Partial<VMixInput>);

      const input = project.getInputByNumber(1);
      expect(input).toBeDefined();
      expect(input?.number).toBe(1);
    });

    it('should return false for non-existent number', () => {
      const project = new VMixProject(createTestState());

      const result = project.updateInput(99, { title: 'New Title' });

      expect(result).toBe(false);
    });
  });

  describe('getActiveInput', () => {
    it('should return the active input number', () => {
      const project = new VMixProject(createTestState());

      expect(project.getActiveInput()).toBe(1);
    });
  });

  describe('getPreviewInput', () => {
    it('should return the preview input number', () => {
      const project = new VMixProject(createTestState());

      expect(project.getPreviewInput()).toBe(2);
    });
  });

  describe('isRecording', () => {
    it('should return true when recording is "True" string', () => {
      const project = new VMixProject(createTestState());

      expect(project.isRecording()).toBe(true);
    });

    it('should return false when recording is "False" string', () => {
      const state = createTestState();
      state.vmix.recording = 'False';
      const project = new VMixProject(state);

      expect(project.isRecording()).toBe(false);
    });

    it('should handle recording node object with True', () => {
      const state = createTestState();
      state.vmix.recording = { _: 'True', duration: 100, filename1: 'test.mp4' };
      const project = new VMixProject(state);

      expect(project.isRecording()).toBe(true);
    });

    it('should handle recording node object with False', () => {
      const state = createTestState();
      state.vmix.recording = { _: 'False', duration: 0 };
      const project = new VMixProject(state);

      expect(project.isRecording()).toBe(false);
    });
  });

  describe('isStreaming', () => {
    it('should return false when streaming is "False" string', () => {
      const project = new VMixProject(createTestState());

      expect(project.isStreaming()).toBe(false);
    });

    it('should return true when streaming is "True" string', () => {
      const state = createTestState();
      state.vmix.streaming = 'True';
      const project = new VMixProject(state);

      expect(project.isStreaming()).toBe(true);
    });

    it('should handle streaming node object with True', () => {
      const state = createTestState();
      state.vmix.streaming = { _: 'True', channel1: 'active' };
      const project = new VMixProject(state);

      expect(project.isStreaming()).toBe(true);
    });
  });

  describe('getMasterVolume', () => {
    it('should return the master volume', () => {
      const project = new VMixProject(createTestState());

      expect(project.getMasterVolume()).toBe(80);
    });
  });

  describe('isMasterMuted', () => {
    it('should return false when not muted', () => {
      const project = new VMixProject(createTestState());

      expect(project.isMasterMuted()).toBe(false);
    });

    it('should return true when muted', () => {
      const state = createTestState();
      state.vmix.audio.master.muted = true;
      const project = new VMixProject(state);

      expect(project.isMasterMuted()).toBe(true);
    });
  });
});
