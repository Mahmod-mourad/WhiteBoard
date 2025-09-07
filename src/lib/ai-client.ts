/**
 * Direct Google AI API client for chat functionality
 * This bypasses Genkit complexity and uses the Google AI API directly
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

class AIClient {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = process.env.GOOGLE_GENAI_API_KEY;
      console.log('Environment variables check:');
      console.log('- NODE_ENV:', process.env.NODE_ENV);
      console.log('- All GOOGLE keys:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
      console.log('- API Key check:', apiKey ? 'Found' : 'Not found');
      console.log('- API Key length:', apiKey?.length || 0);
      console.log('- API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
      
      if (!apiKey) {
        console.error('Google AI API key not found');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });
    } catch (error) {
      console.error('Failed to initialize AI client:', error);
    }
  }

  async generateResponse(prompt: string, options: ChatOptions = {}): Promise<string> {
    try {
      if (!this.model) {
        throw new Error('AI client not properly initialized. Please check your Google AI API key.');
      }

      let fullPrompt = `You are Meedro, an expert scriptwriter and creative assistant. Your goal is to help content creators, marketers, and creative agencies.

User Request: ${prompt}`;

      if (options.context) {
        fullPrompt += `\n\nContext from connected content:\n${options.context}`;
      }

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI model');
      }

      return text.trim();
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      
      // Handle specific error types
      if (error.message?.includes('API key')) {
        return 'I\'m having trouble connecting to the AI service. Please check that your Google AI API key is properly configured.';
      }
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        return 'I\'ve reached my usage limit for now. Please try again in a few minutes or check your API quota.';
      }
      
      if (error.message?.includes('model')) {
        return 'There seems to be an issue with the AI model. Please try again or contact support.';
      }

      return `I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please try again.`;
    }
  }

  isReady(): boolean {
    return this.model !== null;
  }
}

// Export a singleton instance
export const aiClient = new AIClient();

// For server-side usage
export async function generateScript(prompt: string, context?: string): Promise<string> {
  return aiClient.generateResponse(prompt, { context });
}
