import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateScriptInput {
  prompt: string;
  context?: string;
  connectedItems?: ConnectedItem[];
}

export interface ConnectedItem {
  id: string;
  type: string;
  title: string;
  content: string;
  scrapedContent?: string;
  metadata?: any;
}

export interface GenerateScriptOutput {
  script: string;
}

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  // Enhanced logging for debugging
  console.log('Environment check:', {
    hasApiKey: !!process.env.GOOGLE_GENAI_API_KEY,
    apiKeyLength: process.env.GOOGLE_GENAI_API_KEY?.length || 0,
    apiKeyPreview: process.env.GOOGLE_GENAI_API_KEY?.substring(0, 10) + '...',
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'Yes' : 'No'
  });

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error('Google AI API key not configured. Please set GOOGLE_GENAI_API_KEY in your environment variables.');
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
  }
  return genAI;
}

/**
 * Build enriched context from connected items with scraped content
 */
function buildEnrichedContext(connectedItems?: ConnectedItem[]): string {
  if (!connectedItems || connectedItems.length === 0) {
    return '';
  }

  const contextSections = connectedItems.map((item, index) => {
    let section = `\n--- Source ${index + 1}: ${item.title} (${item.type}) ---\n`;
    
    // Use scraped content if available, otherwise use regular content
    const content = item.scrapedContent || item.content;
    
    if (content) {
      section += `Content: ${content}\n`;
    }
    
    // Add metadata if available
    if (item.metadata) {
      if (item.metadata.author) {
        section += `Author: ${item.metadata.author}\n`;
      }
      if (item.metadata.duration) {
        section += `Duration: ${item.metadata.duration}\n`;
      }
      if (item.metadata.publishedDate) {
        section += `Published: ${item.metadata.publishedDate}\n`;
      }
      if (item.metadata.description) {
        section += `Description: ${item.metadata.description}\n`;
      }
    }
    
    return section;
  });

  return contextSections.join('\n');
}

function containsArabic(text?: string): boolean {
  if (!text) return false;
  // Basic Arabic unicode block check
  return /[\u0600-\u06FF]/.test(text);
}

function shouldReplyInArabic(input: GenerateScriptInput): boolean {
  if (containsArabic(input.prompt) || containsArabic(input.context)) return true;
  if (input.connectedItems && input.connectedItems.length > 0) {
    for (const item of input.connectedItems) {
      if (containsArabic(item.scrapedContent) || containsArabic(item.content) || containsArabic(item.title)) {
        return true;
      }
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Generate script API called on:', {
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin')
    });

    const input: GenerateScriptInput = await request.json();
    
    if (!input.prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Input received:', {
      promptLength: input.prompt.length,
      hasContext: !!input.context,
      connectedItemsCount: input.connectedItems?.length || 0,
      promptPreview: input.prompt.substring(0, 100) + '...'
    });

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048, // Increased for richer responses
      },
    });

    const replyInArabic = shouldReplyInArabic(input);

    let fullPrompt = `You are Meedro, an expert scriptwriter and creative assistant. Your goal is to help content creators, marketers, and creative agencies create compelling content.

The user has provided a prompt and may have connected various content sources from their whiteboard. Use this information to generate a helpful, creative, and actionable response.

When multiple sources are provided, synthesize information across them to create more valuable insights.

Language instruction: ${replyInArabic ? 'Reply in Arabic. Keep the output fully in Arabic.' : 'Reply in the same language as the user prompt.'}

User Prompt: ${input.prompt}`;

    // Add legacy context if provided (for backward compatibility)
    if (input.context) {
      fullPrompt += `\n\nAdditional Context:\n${input.context}`;
    }

    // Add enriched context from connected items with scraped content
    const enrichedContext = buildEnrichedContext(input.connectedItems);
    if (enrichedContext) {
      fullPrompt += `\n\nConnected Content from Whiteboard:${enrichedContext}`;
      
      // Add guidance for using multiple sources
      fullPrompt += `\n\nInstructions:
- Analyze and synthesize information from all connected sources
- Identify key themes, insights, and opportunities across the content
- Create connections between different sources where relevant
- Provide specific, actionable recommendations
- Reference specific sources when making points`;
    }

    console.log('Calling Google AI model with prompt length:', fullPrompt.length);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('The AI model did not return a valid response.');
    }
    
    console.log('AI response generated successfully, length:', text.length);
    
    return NextResponse.json({ 
      success: true,
      script: text 
    });

  } catch (error: any) {
    console.error("Error calling Google AI model:", error);
    
    if (error.message.includes('API key not configured')) {
      return NextResponse.json({ 
        success: false,
        script: "I'm not configured to work without an AI model. Please add your Google AI API key to the environment variables." 
      }, { status: 500 });
    }
    
    if (error.message.includes('model not found') || error.message.includes('quota')) {
      return NextResponse.json({ 
        success: false,
        script: "Google AI is not properly configured or has exceeded its quota. Please make sure your API key is set correctly in the .env file and check your billing details." 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false,
      script: `I'm sorry, I encountered an error and couldn't process your request. Please check the server logs for details.\n\nError: ${error.message}` 
    }, { status: 500 });
  }
}
