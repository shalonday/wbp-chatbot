import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { SearchResult, MaterialRequest, DiscordEmbedPayload } from '../types';

/**
 * API client for Perk API integration
 */
export class PerkAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search for skills/materials by similarity
   */
  async searchBySimilarity(
    query: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      const response = await this.client.post('/chatbot/search', {
        query,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Submit a material request to Discord via webhook
   */
  async submitMaterialRequest(
    request: MaterialRequest
  ): Promise<{ success: boolean }> {
    try {
      const embed = this.buildDiscordEmbed(request);
      const response = await this.client.post('/chatbot/material-request', {
        embed,
        request,
      });
      return response.data;
    } catch (error) {
      console.error('Material request error:', error);
      throw error;
    }
  }

  /**
   * Build a Discord embed from a material request
   */
  private buildDiscordEmbed(request: MaterialRequest): DiscordEmbedPayload {
    const fields = [
      {
        name: 'User Intent',
        value: request.userIntent,
      },
      {
        name: 'Session ID',
        value: request.sessionId,
        inline: true,
      },
      {
        name: 'Timestamp',
        value: new Date(request.timestamp).toISOString(),
        inline: true,
      },
    ];

    if (request.userIdentification) {
      fields.push({
        name: 'User',
        value: request.userIdentification,
      });
    }

    if (request.suggestedMaterials.length > 0) {
      const materialsList = request.suggestedMaterials
        .map((r) => `- ${r.node.name}`)
        .join('\n');
      fields.push({
        name: 'Related Materials Found',
        value: materialsList,
      });
    }

    return {
      embeds: [
        {
          title: 'New Material Request',
          description: `A user has requested to add new learning materials to WBP.`,
          fields,
          footer: {
            text: 'WBP Chatbot',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}

/**
 * Create and return a PerkAPIClient instance
 */
export function createPerkAPIClient(baseURL?: string): PerkAPIClient {
  const url =
    baseURL ||
    import.meta.env.VITE_PERK_API_BASE_URL ||
    'http://localhost:3000';
  return new PerkAPIClient(url);
}
