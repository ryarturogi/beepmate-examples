export class BeepMateClient {
  #apiKey;
  #targetId;
  #baseUrl = 'https://beepmate.io/send';

  constructor({ apiKey, targetId }) {
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new Error('BeepMateClient: A valid API key is required.');
    }
    if (!targetId || typeof targetId !== 'string' || !targetId.trim()) {
      throw new Error('BeepMateClient: A valid Target ID (phone or group) is required.');
    }
    
    this.#apiKey = apiKey;
    this.#targetId = targetId;
  }

  /**
   * Sends a text message via the BeepMate API.
   * @param {string} message The text message to send.
   * @returns {Promise<boolean>} A promise resolving to true if successful.
   */
  async sendMessage(message) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('BeepMateClient: Message content cannot be empty.');
    }

    const url = new URL(this.#baseUrl);
    url.searchParams.append('key', this.#apiKey);
    url.searchParams.append('id', this.#targetId);
    url.searchParams.append('msg', message);

    try {
      const response = await fetch(url.toString(), { method: 'GET' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
}
