import axios from 'axios';
import { assert } from 'console';
import { isVMixRecordingNode, VMix } from '../src/vmix';

import { vmixDefaultResponse } from './vmix.test';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('', () => {
  it('should find 2 recordings', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: vmixDefaultResponse,
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
      expect(recordingNode.duration).toEqual('12');
      expect(recordingNode.filename1).not.toBeNull();
      expect(recordingNode.filename2).not.toBeNull();
    }
  });
});
