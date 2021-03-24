import axios from 'axios';
import { VMix } from '../src/vmix';

import { vmixDefaultResponse } from './vmix.test';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
