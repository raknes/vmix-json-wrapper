import { VMix } from '../src/vmix';

describe('', () => {
  it('should use default config', () => {
    const vmix = new VMix();
    expect(vmix.options.apiUrl).toBe('http://localhost:8088/api/');
  });
  it('Modifying config overrides default', () => {
    const vmix = new VMix({ apiUrl: 'http://my.other.host:8089/api/' });
    expect(vmix.options.apiUrl).toBe('http://my.other.host:8089/api/');
  });
  it('Environment variable overrides default', () => {
    if (process && process.env) {
      process.env['VMIX_API_URL'] = 'http://my.host:8089/api/';
      const vmix = new VMix();

      expect(vmix.options.apiUrl).toBe(process.env['VMIX_API_URL']);
    }
  });
});
