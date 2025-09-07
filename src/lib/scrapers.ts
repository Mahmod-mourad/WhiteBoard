export interface ScrapingResult {
  success: boolean;
  title?: string;
  content?: string;
  metadata?: {
    author?: string;
    duration?: string;
    publishedDate?: string;
    description?: string;
    thumbnails?: string[];
    type: 'video' | 'article' | 'social' | 'channel' | 'playlist';
    highlights?: string[];
    sentiment?: string;
    entities?: string[];
  };
  error?: string;
}

// Main scraper function with improved error handling and retry logic
export async function scrapeContent(url: string, type: string): Promise<ScrapingResult> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Scraping attempt ${attempt}/${maxRetries} for ${type}: ${url}`);
      
      // Ensure we're using the correct base URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002';
      const apiUrl = `${baseUrl}/api/scrape`;
      
      console.log(`Making request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url, type }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Scraping successful:', data);
      return data;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Scraping attempt ${attempt} failed:`, lastError.message);
      
      // If it's the last attempt, don't wait
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  const errorMessage = lastError?.message || 'Unknown error';
  console.error(`All scraping attempts failed. Last error: ${errorMessage}`);
  
  return {
    success: false,
    error: `Scraping failed after ${maxRetries} attempts: ${errorMessage}`
  };
}

// Utility functions
export function getContentType(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  return 'url';
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Enhanced scraping with AssemblyAI for YouTube transcripts
export async function scrapeWithAssemblyAI(url: string): Promise<ScrapingResult> {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return {
        success: false,
        error: 'Invalid YouTube URL'
      };
    }

    // Check if AssemblyAI API key is available
    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) {
      console.warn('AssemblyAI API key not found, falling back to regular scraping');
      return await scrapeContent(url, 'youtube');
    }

    // Use AssemblyAI to get transcript
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyAIKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: `https://www.youtube.com/watch?v=${videoId}`,
        auto_highlights: true,
        sentiment_analysis: true,
        entity_detection: true
      })
    });

    if (!transcriptResponse.ok) {
      throw new Error(`AssemblyAI API error: ${transcriptResponse.statusText}`);
    }

    const transcriptData = await transcriptResponse.json();
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max
    
    while (transcriptData.status !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
        headers: {
          'authorization': assemblyAIKey,
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'error') {
        throw new Error(`AssemblyAI transcription failed: ${statusData.error}`);
      }
      
      if (statusData.status === 'completed') {
        return {
          success: true,
          title: `YouTube Video Transcript`,
          content: statusData.text,
          metadata: {
            type: 'video',
            duration: statusData.audio_duration ? `${Math.round(statusData.audio_duration / 60)} minutes` : undefined,
            highlights: statusData.auto_highlights_result?.results?.map((h: any) => h.text),
            sentiment: statusData.sentiment_analysis_results?.summary,
            entities: statusData.entities?.map((e: any) => e.text),
            description: 'Transcript generated by AssemblyAI'
          }
        };
      }
      
      attempts++;
    }

    throw new Error('AssemblyAI transcription timed out');

  } catch (error) {
    console.error('AssemblyAI scraping error:', error);
    // Fallback to regular scraping
    return await scrapeContent(url, 'youtube');
  }
}

// Custom API scraping function
export async function scrapeWithCustomAPI(url: string): Promise<ScrapingResult> {
  try {
    const customAPIKey = process.env.CUSTOM_SCRAPER_API_KEY;
    const customAPIUrl = process.env.CUSTOM_SCRAPER_API_URL;
    
    if (!customAPIKey || !customAPIUrl) {
      console.warn('Custom scraper API not configured, falling back to regular scraping');
      return await scrapeContent(url, getContentType(url));
    }

    const response = await fetch(customAPIUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customAPIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      title: data.title || 'Scraped Content',
      content: data.content || data.text || '',
      metadata: {
        type: data.type || getContentType(url),
        author: data.author,
        publishedDate: data.published_date,
        description: data.description,
        thumbnails: data.thumbnails,
        ...data.metadata
      }
    };

  } catch (error) {
    console.error('Custom API scraping error:', error);
    // Fallback to regular scraping
    return await scrapeContent(url, getContentType(url));
  }
}

// Enhanced main scraper that tries multiple methods
export async function scrapeContentEnhanced(url: string, type: string): Promise<ScrapingResult> {
  // For YouTube videos, try AssemblyAI first
  if (type === 'youtube' && process.env.ASSEMBLYAI_API_KEY) {
    const assemblyResult = await scrapeWithAssemblyAI(url);
    if (assemblyResult.success) {
      return assemblyResult;
    }
  }

  // Try custom API if available
  if (process.env.CUSTOM_SCRAPER_API_KEY && process.env.CUSTOM_SCRAPER_API_URL) {
    const customResult = await scrapeWithCustomAPI(url);
    if (customResult.success) {
      return customResult;
    }
  }

  // Fallback to regular scraping
  return await scrapeContent(url, type);
}