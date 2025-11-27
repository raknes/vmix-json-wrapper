import { vi } from 'vitest';
import { VMix } from '../src/vmix';

import { vmixDefaultResponse } from './fixtures';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Inputs', () => {
  it('should find 2 inputs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(vmixDefaultResponse),
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
