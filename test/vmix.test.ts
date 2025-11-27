import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VMix, isVMixStreamingNode } from '../src/vmix';
import { VMixApiError, VMixConnectionError, VMixTimeoutError } from '../src/errors';
import { VMixState } from '../src/types';
import { vmixDefaultResponse, vmixResponse1OutputStream } from './fixtures';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('VMix API', () => {
  describe('getCurrentState', () => {
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

    it('should return staticState when configured', async () => {
      const staticState: VMixState = {
        vmix: {
          version: '25.0.0.0',
          edition: 'Pro',
          preset: '',
          inputs: { input: [] },
          overlays: { overlay: [{ number: 1 }] },
          preview: 1,
          active: 1,
          recording: 'False',
          external: 'False',
          streaming: 'False',
          playlist: 'False',
          multiCorder: 'False',
          fullscreen: false,
          audio: { master: { volume: 100, muted: false } },
        },
      };
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088',
        staticState,
      });

      const state = await vmix.getCurrentState();

      expect(state).toBe(staticState);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw VMixApiError on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await expect(vmix.getCurrentState()).rejects.toThrow(VMixApiError);
      await expect(vmix.getCurrentState()).rejects.toMatchObject({
        status: 404,
        statusText: 'Not Found',
      });
    });

    it('should throw VMixTimeoutError on timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
        timeout: 1000,
      });

      await expect(vmix.getCurrentState()).rejects.toThrow(VMixTimeoutError);
      await expect(vmix.getCurrentState()).rejects.toMatchObject({
        timeoutMs: 1000,
      });
    });

    it('should throw VMixConnectionError on network failure', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValue(networkError);

      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await expect(vmix.getCurrentState()).rejects.toThrow(VMixConnectionError);
      await expect(vmix.getCurrentState()).rejects.toMatchObject({
        cause: networkError,
      });
    });
  });

  describe('getAllInputs', () => {
    it('should return all inputs as array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(vmixDefaultResponse),
      });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088',
      });

      const inputs = await vmix.getAllInputs();

      expect(inputs).toHaveLength(2);
      expect(inputs?.[0].key).toBe('4388cc92-2915-47e2-9ef0-8fec0d748b6f');
      expect(inputs?.[1].key).toBe('a2445db8-411c-4e7d-bc85-2a2ad071ebd2');
    });

    it('should wrap single input in array', async () => {
      const singleInputResponse = `<vmix>
        <version>24.0.0.51</version>
        <edition>4K</edition>
        <inputs>
          <input key="single-input" number="1" type="Blank" title="Single" state="Paused">Blank</input>
        </inputs>
        <overlays><overlay number="1" /></overlays>
        <preview>1</preview>
        <active>1</active>
        <recording>False</recording>
        <external>False</external>
        <streaming>False</streaming>
        <playList>False</playList>
        <multiCorder>False</multiCorder>
        <fullscreen>False</fullscreen>
        <audio><master volume="100" muted="False" /></audio>
      </vmix>`;

      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(singleInputResponse),
      });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088',
      });

      const inputs = await vmix.getAllInputs();

      expect(inputs).toHaveLength(1);
      expect(inputs?.[0].key).toBe('single-input');
    });
  });

  describe('executeFunction', () => {
    it('should call fetch with function name only', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await vmix.executeFunction('Cut');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://my.host1:8088/api/?Function=Cut',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('should include input parameter', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await vmix.executeFunction('Cut', { input: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://my.host1:8088/api/?Function=Cut&Input=1',
        expect.any(Object)
      );
    });

    it('should include all FunctionOptions parameters', async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await vmix.executeFunction('SetText', {
        input: 2,
        value: 'Hello World',
        selectedName: 'TextBlock1',
        selectedIndex: 0,
        duration: 1000,
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('Function=SetText');
      expect(calledUrl).toContain('Input=2');
      expect(calledUrl).toContain('Value=Hello+World');
      expect(calledUrl).toContain('SelectedName=TextBlock1');
      expect(calledUrl).toContain('SelectedIndex=0');
      expect(calledUrl).toContain('Duration=1000');
    });

    it('should skip fetch when staticState is configured', async () => {
      const staticState: VMixState = {
        vmix: {
          version: '25.0.0.0',
          edition: 'Pro',
          preset: '',
          inputs: { input: [] },
          overlays: { overlay: [{ number: 1 }] },
          preview: 1,
          active: 1,
          recording: 'False',
          external: 'False',
          streaming: 'False',
          playlist: 'False',
          multiCorder: 'False',
          fullscreen: false,
          audio: { master: { volume: 100, muted: false } },
        },
      };
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
        staticState,
      });

      await vmix.executeFunction('Cut');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw VMixApiError on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await expect(vmix.executeFunction('Cut')).rejects.toThrow(VMixApiError);
      await expect(vmix.executeFunction('Cut')).rejects.toMatchObject({
        status: 500,
      });
    });

    it('should throw VMixTimeoutError on timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
        timeout: 500,
      });

      await expect(vmix.executeFunction('Cut')).rejects.toThrow(VMixTimeoutError);
    });

    it('should throw VMixConnectionError on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const vmix = new VMix({
        apiUrl: 'http://my.host1:8088/api/',
      });

      await expect(vmix.executeFunction('Cut')).rejects.toThrow(VMixConnectionError);
    });
  });
});
