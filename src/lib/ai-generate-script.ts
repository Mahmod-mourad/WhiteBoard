/**
 * Server-side script generation using direct Google AI API
 * This replaces the Genkit-based implementation with a simpler approach
 */

'use server';

export interface GenerateScriptInput {
  prompt: string;
  context?: string;
}

export interface GenerateScriptOutput {
  script: string;
}

export async function generateScriptFromContext(
  input: GenerateScriptInput
): Promise<GenerateScriptOutput> {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return {
        script: "I'm not configured to work without an AI model. Please add your Google AI API key to the environment variables."
      };
    }

    // Dynamic import to avoid bundling issues
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Build the prompt
    const containsArabic = (text?: string) => !!text && /[\u0600-\u06FF]/.test(text);
    const replyInArabic = containsArabic(input.prompt) || containsArabic(input.context);

    let fullPrompt = `You are Meedro, an expert scriptwriter and creative assistant. Your goal is to help content creators, marketers, and creative agencies.

The user has provided a prompt and may have provided some context from their whiteboard. Use this information to generate a helpful response.

If context is provided, use it as the primary source of information.

Language instruction: ${replyInArabic ? 'Reply in Arabic. Keep the output fully in Arabic.' : 'Reply in the same language as the user prompt.'}

User Prompt: ${input.prompt}`;

    if (input.context) {
      fullPrompt += `\n\nContext from Whiteboard:\n---\n${input.context}\n---`;
    }

    // Generate the response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }

    return { script: text.trim() };

  } catch (error: any) {
    console.error('Error calling AI model:', error);
    
    // Handle specific error types with user-friendly messages
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return { 
        script: "Google AI is not properly configured. Please make sure your API key is set correctly in the .env file." 
      };
    }
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      return { 
        script: "I've reached my usage limit. Please try again in a few minutes or check your API quota." 
      };
    }
    
    if (error.message?.includes('model') || error.message?.includes('MODEL_NOT_FOUND')) {
      return { 
        script: "There's an issue with the AI model configuration. Please try again or contact support." 
      };
    }

    // Generic error message
    return {
      script: `I'm sorry, I encountered an error and couldn't process your request. Please try again.\n\nError: ${error.message || 'Unknown error'}`
    };
  }
}
