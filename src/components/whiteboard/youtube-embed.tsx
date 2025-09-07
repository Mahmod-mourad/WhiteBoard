import * as React from 'react';

interface YoutubeEmbedProps {
  url: string;
}

export function YoutubeEmbed({ url }: YoutubeEmbedProps) {
  const getYouTubeEmbedUrl = (url: string) => {
    // Check if URL is valid and not empty
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return null;
    }

    const cleanUrl = url.trim();

    // Check if it looks like a URL
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return null;
    }

    try {
      const urlObj = new URL(cleanUrl);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      if (hostname === 'youtu.be') {
        const videoId = pathname.slice(1);
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
        if (pathname.startsWith('/embed/')) {
          return cleanUrl;
        }
        if (pathname.startsWith('/watch')) {
          const videoId = searchParams.get('v');
          if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        if (pathname.startsWith('/playlist')) {
          const listId = searchParams.get('list');
          if (listId) return `https://www.youtube.com/embed/videoseries?list=${listId}`;
        }
        if (pathname.startsWith('/channel/')) {
          const channelId = pathname.split('/')[2];
          if (channelId && channelId.startsWith('UC')) {
            const uploadsListId = 'UU' + channelId.substring(2);
            return `https://www.youtube.com/embed/videoseries?list=${uploadsListId}`;
          }
        }
        if (pathname.startsWith('/user/') || pathname.startsWith('/c/')) {
          const customUrlName = pathname.split('/')[2];
          if (customUrlName) return `https://www.youtube.com/embed/videoseries?list=${customUrlName}`;
        }
      }
    } catch (error) {
      console.error("YouTube URL parsing failed:", error);
      return null;
    }

    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-full w-full p-4 text-muted-foreground bg-muted/20 rounded border-2 border-dashed border-muted">
        <div className="text-center">
          <p className="text-sm font-medium">Invalid YouTube URL</p>
          <p className="text-xs mt-1">Please provide a valid YouTube link</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      className="h-full w-full"
      src={embedUrl}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}