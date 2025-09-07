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