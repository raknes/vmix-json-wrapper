import { VMixInput, VMixState } from './types';

/**
 * VMixProject provides a mutable wrapper around VMixState for dynamic manipulation.
 * Use this class to programmatically modify vMix project state before applying changes.
 */
export class VMixProject {
  private state: VMixState;

  constructor(initialState: VMixState) {
    this.state = structuredClone(initialState);
  }

  /**
   * Returns the current state (immutable copy)
   */
  getState(): VMixState {
    return structuredClone(this.state);
  }

  /**
   * Returns all inputs
   */
  getInputs(): VMixInput[] {
    const inputs = this.state.vmix.inputs.input;
    return Array.isArray(inputs) ? [...inputs] : [inputs];
  }

  /**
   * Get an input by its number
   */
  getInputByNumber(number: number): VMixInput | undefined {
    const inputs = this.getInputs();
    return inputs.find((input) => input.number === number);
  }

  /**
   * Get an input by its key
   */
  getInputByKey(key: string): VMixInput | undefined {
    const inputs = this.getInputs();
    return inputs.find((input) => input.key === key);
  }

  /**
   * Add a new input to the project
   */
  addInput(input: VMixInput): void {
    if (!Array.isArray(this.state.vmix.inputs.input)) {
      this.state.vmix.inputs.input = [this.state.vmix.inputs.input];
    }
    this.state.vmix.inputs.input.push(input);
  }

  /**
   * Remove an input by its number
   */
  removeInputByNumber(number: number): boolean {
    const inputs = this.getInputs();
    const index = inputs.findIndex((input) => input.number === number);
    if (index === -1) return false;

    inputs.splice(index, 1);
    this.state.vmix.inputs.input = inputs;
    return true;
  }

  /**
   * Remove an input by its key
   */
  removeInputByKey(key: string): boolean {
    const inputs = this.getInputs();
    const index = inputs.findIndex((input) => input.key === key);
    if (index === -1) return false;

    inputs.splice(index, 1);
    this.state.vmix.inputs.input = inputs;
    return true;
  }

  /**
   * Update an input by its number
   */
  updateInput(number: number, updates: Partial<VMixInput>): boolean {
    const inputs = this.getInputs();
    const index = inputs.findIndex((input) => input.number === number);
    if (index === -1) return false;

    inputs[index] = { ...inputs[index], ...updates, number: inputs[index].number };
    this.state.vmix.inputs.input = inputs;
    return true;
  }

  /**
   * Get the active input number
   */
  getActiveInput(): number {
    return this.state.vmix.active;
  }

  /**
   * Get the preview input number
   */
  getPreviewInput(): number {
    return this.state.vmix.preview;
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    const recording = this.state.vmix.recording;
    if (typeof recording === 'string') {
      return recording === 'True' || recording === 'true';
    }
    return recording._ === 'True' || recording._ === 'true';
  }

  /**
   * Check if streaming is active
   */
  isStreaming(): boolean {
    const streaming = this.state.vmix.streaming;
    if (typeof streaming === 'string') {
      return streaming === 'True' || streaming === 'true';
    }
    return streaming._ === 'True' || streaming._ === 'true';
  }

  /**
   * Get master audio volume (0-100)
   */
  getMasterVolume(): number {
    return this.state.vmix.audio.master.volume;
  }

  /**
   * Check if master audio is muted
   */
  isMasterMuted(): boolean {
    return this.state.vmix.audio.master.muted;
  }
}
