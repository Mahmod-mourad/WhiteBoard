import * as React from 'react';

interface TiktokEmbedProps {
  url: string;
}

export function TiktokEmbed({ url }: TiktokEmbedProps) {
  const getTikTokEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      if (urlObj.hostname.includes('tiktok.com')) {
        const pathParts = pathname.split('/');
        
        // Check for video URL format: /@username/video/123456789
        const videoIndex = pathParts.indexOf('video');
        if (videoIndex !== -1 && videoIndex + 1 < pathParts.length) {
          const videoId = pathParts[videoIndex + 1];
          if (videoId) {
            return `https://www.tiktok.com/embed/v2/${videoId}`;
          }
        }

        // Fallback for profile URLs, which are not directly embeddable this way
        // but we can at least show the profile page in an iframe.
        if (pathParts.length >= 2 && pathParts[1].startsWith('@')) {
            return url;
        }
      }
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
    return url; // Return original URL as a fallback
  };

  const embedUrl = getTikTokEmbedUrl(url);

  if (!embedUrl) {
    return <div className="p-4 text-destructive">Invalid or unsupported TikTok URL</div>;
  }
  
  // If it's a profile url, render it in a simple iframe
  if (!embedUrl.includes('/embed/')) {
    return (
        <iframe
            src={embedUrl}
            className="h-full w-full border-0"
            title="TikTok Profile"
            allowFullScreen
        ></iframe>
    );
  }

  // If it's a video, use the blockquote embed
  return (
    <iframe
        src={embedUrl}
        className="h-full w-full"
        title="TikTok Video"
        allow="autoplay; encrypted-media;"
        allowFullScreen
    ></iframe>
  );
}
