import axios from 'axios';
import { vi, type Mocked } from 'vitest';
import { VMix } from '../src/vmix';

import { vmixDefaultResponse } from './fixtures';

vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('', () => {
  it('should find 2 inputs', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: vmixDefaultResponse,
    });

    const vmix = new VMix();
    const inputs = await vmix.getAllInputs();
    expect(inputs != null).toBeTruthy();
    if (inputs == null) {
      expect(false).toBeTruthy();
      return;
    }
    expect(inputs.length).toBe(2);
  });
});
