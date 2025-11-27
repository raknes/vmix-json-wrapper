import { vi } from 'vitest';
import { VMix, isVMixStreamingNode } from '../src/vmix';
import { vmixDefaultResponse, vmixResponse1OutputStream } from './fixtures';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('VMix API', () => {
  it('should get default vmix state', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(vmixDefaultResponse),
    });
    const vmix = new VMix({
      apiUrl: 'http://my.host1:8088',
    });
    const state = await vmix.getCurrentState();
    expect(state).not.toBeNull();

    if (state == null) {
      expect(false).toBeTruthy();
      return;
    }
    expect(state.vmix.version).toBe('24.0.0.51');
    expect(state.vmix.inputs.input[0].type).toBe('Blank');
    expect(state.vmix.active).toBe(1);
    expect(state.vmix.streaming).toBe(false);
  });
  it('should get 1 stream channel', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(vmixResponse1OutputStream),
    });
    const vmix = new VMix({
      apiUrl: 'http://my.host1:8088',
    });
    const state = await vmix.getCurrentState();
    expect(state).not.toBeNull();

    if (state == null) {
      expect(false).toBeTruthy();
      return;
    }
    if (isVMixStreamingNode(state.vmix.streaming)) {
      expect(state.vmix.streaming.channel1).toBe(true);
    } else {
      expect(false).toBeTruthy();
    }
  });
});
