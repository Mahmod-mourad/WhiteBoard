import { aiClient } from '@/lib/ai-client';

export async function generateChatResponse(history: any[]) {
  let prompt = "";
  for (const message of history) {
    prompt += `${message.role}: ${message.parts.map((p: any) => p.text).join('\n')}\n`;
  }
  return await aiClient.generateResponse(prompt);
}