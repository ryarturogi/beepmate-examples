export interface BeepMateConfig {
  apiKey: string;
  targetId: string;
}

export class BeepMateClient {
  private readonly apiKey: string;
  private readonly targetId: string;
  private readonly baseUrl: string = 'https://beepmate.io/send';

  constructor(config: BeepMateConfig) {
    if (!config.apiKey?.trim()) {
      throw new Error('BeepMateClient: A valid API key is required.');
    }
    if (!config.targetId?.trim()) {
      throw new Error('BeepMateClient: A valid Target ID (phone or group) is required.');
    }
    
    this.apiKey = config.apiKey;
    this.targetId = config.targetId;
  }

  /**
   * Sends a text message via the BeepMate API.
   * @param message The text message to send.
   * @returns A promise resolving to true if successful.
   */
  async sendMessage(message: string): Promise<boolean> {
    if (!message?.trim()) {
      throw new Error('BeepMateClient: Message content cannot be empty.');
    }

    const url = new URL(this.baseUrl);
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('id', this.targetId);
    url.searchParams.append('msg', message);

    try {
      const response: Response = await fetch(url.toString(), {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
      throw new Error('An unknown error occurred while sending the BeepMate message.');
    }
  }
}
