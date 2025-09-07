'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bot, MessageCircle, Send, ChevronDown, Link2, FileText } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { WindowItem } from '@/lib/types';
import { Connection, ConnectionType } from '@/lib/types';

// Remove the server action import
// import { generateScriptFromContext } from '@/ai/flows/generate-script-from-context';

type ConnectedItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  scrapedContent?: string;
  metadata?: any;
};

type Message = {
  role: 'user' | 'ai' | 'assistant';
  content: string;
  connectedSources?: {
    title: string;
    type: string;
    hasScrapedContent: boolean;
  }[];
};

interface AiChatWindowProps {
  item: WindowItem;
  items: WindowItem[];
}

// Helper function moved to client-side
function extractConnectedItems(items: WindowItem[], connectionIds: string[]): ConnectedItem[] {
  return connectionIds
    .map(id => items.find(item => item.id === id))
    .filter(Boolean)
    .map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      scrapedContent: item.scrapedContent, // From our scraping system
      metadata: item.metadata
    }));
}

// Function to call the API endpoint instead of server action
async function generateScriptFromContext(input: {
  prompt: string;
  context?: string;
  connectedItems?: any[];
}): Promise<{ script: string }> {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002';
    
    // Enhanced input with better context processing
    const enhancedInput = {
      ...input,
      connectedItems: input.connectedItems?.map(item => ({
        ...item,
        // Prioritize scraped content over regular content
        content: item.scrapedContent || item.content,
        // Add metadata about content source
        hasScrapedContent: !!item.scrapedContent,
        contentLength: (item.scrapedContent || item.content)?.length || 0
      }))
    };

    console.log('Enhanced input for AI:', {
      promptLength: enhancedInput.prompt.length,
      connectedItemsCount: enhancedInput.connectedItems?.length || 0,
      itemsWithScrapedContent: enhancedInput.connectedItems?.filter(item => item.hasScrapedContent).length || 0,
      totalContentLength: enhancedInput.connectedItems?.reduce((sum, item) => sum + item.contentLength, 0) || 0
    });

    const response = await fetch(`${baseUrl}/api/generate-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedInput),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { script: data.script };
  } catch (error) {
    console.error('Error calling generate script API:', error);
    throw error;
  }
}

export function AiChatWindow({ item, items }: AiChatWindowProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const { toast } = useToast();
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);

  // Get connected items for this AI window
  const connectedItems = React.useMemo(() => {
    const connectionIds = item.connections?.map(conn =>
      conn.from === item.id ? conn.to : conn.from
    ).filter(id => id !== item.id) || [];

    return extractConnectedItems(items, connectionIds);
  }, [item.connections, items, item.id]);

  // Show connection status
  const connectionStatus = React.useMemo(() => {
    if (connectedItems.length === 0) {
      return { count: 0, scrapedCount: 0 };
    }

    const scrapedCount = connectedItems.filter(item => item.scrapedContent).length;
    return { count: connectedItems.length, scrapedCount };
  }, [connectedItems]);

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    const autoScrollToBottom = () => {
      if (scrollViewportRef.current) {
        const viewport = scrollViewportRef.current;
        viewport.scrollTop = viewport.scrollHeight;
      }
    };

    // Use a small delay to ensure content is rendered
    const timeoutId = setTimeout(autoScrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Check if user is at bottom of chat
  const checkIfAtBottom = React.useCallback(() => {
    if (!scrollViewportRef.current) return;

    const viewport = scrollViewportRef.current;
    const isAtBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 10; // 10px threshold
    setShowScrollButton(!isAtBottom && messages.length > 0);
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = React.useCallback(() => {
    if (scrollViewportRef.current) {
      const viewport = scrollViewportRef.current;
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Add scroll event listener
  React.useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      checkIfAtBottom();
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  // Check if at bottom when messages change
  React.useEffect(() => {
    checkIfAtBottom();
  }, [messages, checkIfAtBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      console.log('Connected items:', connectedItems);
      console.log('Scraped content check:', connectedItems.map(item => ({
        id: item.id,
        title: item.title,
        hasScrapedContent: !!item.scrapedContent,
        contentPreview: item.scrapedContent?.substring(0, 100) || 'NO SCRAPED CONTENT'
      })));
      // Use the enhanced AI function with scraped content
      const result = await generateScriptFromContext({
        prompt: currentInput,
        connectedItems: connectedItems
      });

      // Create AI response with source information
      const aiResponse: Message = {
        role: 'assistant',
        content: result.script,
        connectedSources: connectedItems.length > 0 ? connectedItems.map(item => ({
          title: item.title,
          type: item.type,
          hasScrapedContent: !!item.scrapedContent
        })) : undefined
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Show success toast with connection info
      if (connectedItems.length > 0) {
        toast({
          description: `AI used content from ${connectedItems.length} connected source(s)`,
        });
      }

    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a response from the AI. Please check that Google AI API key is configured.',
      });
      const aiErrorResponse: Message = {
        role: 'assistant',
        content: "Sorry, I couldn't process that request. Please make sure the Google AI API key is configured and try again."
      };
      setMessages((prev) => [...prev, aiErrorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden relative">
      {/* Connection Status Header */}
      {connectionStatus.count > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b text-xs text-muted-foreground">
          <Link2 className="h-3 w-3" />
          <span>
            Connected to {connectionStatus.count} source{connectionStatus.count !== 1 ? 's' : ''}
            {connectionStatus.scrapedCount > 0 && (
              <span className="text-green-600 ml-1">
                ({connectionStatus.scrapedCount} with scraped content)
              </span>
            )}
          </span>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0" viewportRef={scrollViewportRef}>
        <div className="p-4 space-y-4 min-h-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 gap-4">
              <MessageCircle className="h-10 w-10" />
              <div>
                <p className="font-medium">Start a conversation with the AI assistant.</p>
                {connectionStatus.count > 0 ? (
                  <p className="text-xs mt-2 text-green-600">
                    Ready to analyze {connectionStatus.count} connected source{connectionStatus.count !== 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="text-xs mt-2">
                    Connect this AI to other windows for context-aware responses
                  </p>
                )}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
              <div className="max-w-[85%] space-y-2">
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                    }`}
                >
                  <pre className="whitespace-pre-wrap font-body">{message.content}</pre>
                </div>

                {/* Show connected sources for AI messages */}
                {message.role === 'assistant' && message.connectedSources && message.connectedSources.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-1">
                    {message.connectedSources.map((source, sourceIndex) => (
                      <div
                        key={sourceIndex}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        <FileText className="h-3 w-3" />
                        <span>{source.title}</span>
                        <span className="text-blue-500">({source.type})</span>
                        {source.hasScrapedContent && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Has scraped content" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-3 items-start">
              <Bot className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                </div>
                {connectedItems.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzing {connectedItems.length} connected source{connectedItems.length !== 1 ? 's' : ''}...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-16 right-4 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={scrollToBottom}
            title="Scroll to newest message"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="border-t bg-background p-2 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              connectionStatus.count > 0
                ? `Ask about your ${connectionStatus.count} connected source${connectionStatus.count !== 1 ? 's' : ''}...`
                : "Type your message..."
            }
            className="flex-grow resize-none border-0 shadow-none focus-visible:ring-0"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
