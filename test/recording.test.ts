import { assert } from 'console';
import { vi } from 'vitest';
import { isVMixRecordingNode, VMix } from '../src/vmix';

import { recordingFile1, recordingFile2, vmixDefaultResponse } from './fixtures';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Recording', () => {
  it('should find 2 recordings', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(vmixDefaultResponse),
    });

    const vmix = new VMix();
    const state = await vmix.getCurrentState();
    assert(state !== null);

    expect(state).not.toBeNull();
    if (state == null) {
      expect(false).toBeTruthy();
      return;
    }

    const recordingNode = state.vmix.recording;
    if (isVMixRecordingNode(recordingNode)) {
      expect(recordingNode.duration).toEqual(12);
      expect(recordingNode.filename1).not.toBeNull();
      expect(recordingNode.filename2).not.toBeNull();
      expect(recordingNode.filename1).toEqual(recordingFile1);
      expect(recordingNode.filename2).toEqual(recordingFile2);
    }
  });
});
