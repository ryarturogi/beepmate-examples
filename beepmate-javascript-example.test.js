import { jest } from '@jest/globals';
import { BeepMateClient } from './beepmate-javascript-example.js';

// Mock the global fetch API
global.fetch = jest.fn();

describe('BeepMateClient', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Initialization', () => {
    it('should throw an error if initialized without valid configuration', () => {
      expect(() => new BeepMateClient({ apiKey: '', targetId: '123' })).toThrow('valid API key is required');
      expect(() => new BeepMateClient({ apiKey: 'key', targetId: '  ' })).toThrow('valid Target ID');
    });
  });

  describe('sendMessage()', () => {
    let client;

    beforeEach(() => {
      client = new BeepMateClient({ apiKey: 'test_key', targetId: '123456789' });
    });

    it('should throw an error if the message is empty', async () => {
      await expect(client.sendMessage('')).rejects.toThrow('Message content cannot be empty');
      await expect(client.sendMessage('   ')).rejects.toThrow('Message content cannot be empty');
    });

    it('should successfully send a message and encode the URL properly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Success',
      });

      const result = await client.sendMessage('Hello World!');

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Verify URL formatting and parameter encoding
      const calledUrl = fetch.mock.calls[0][0];
      const parsedUrl = new URL(calledUrl);
      
      expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://beepmate.io/send');
      expect(parsedUrl.searchParams.get('key')).toBe('test_key');
      expect(parsedUrl.searchParams.get('id')).toBe('123456789');
      expect(parsedUrl.searchParams.get('msg')).toBe('Hello World!');
    });

    it('should handle API HTTP errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(client.sendMessage('Test')).rejects.toThrow('API Error 401: Unauthorized');
    });

    it('should handle network failures', async () => {
      fetch.mockRejectedValueOnce(new Error('Network disconnected'));

      await expect(client.sendMessage('Test')).rejects.toThrow('Failed to send message: Network disconnected');
    });
  });
});
