'use client';
import * as React from 'react';
import type { WindowItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YoutubeEmbed } from './youtube-embed';
import { X, GripVertical, Lock } from 'lucide-react';
import { AiChatWindow } from './ai-chat-window';
import { cn } from '@/lib/utils';
import { TiktokEmbed } from './tiktok-embed';
import { DocumentDropzone } from './document-dropzone';
import { ImageDropzone } from './image-dropzone';

interface WindowFrameProps {
  item: WindowItem;
  items: WindowItem[];
  isLinking: boolean;
  isLinkingFrom: boolean;
  isSelected: boolean;
  onUpdate: (item: WindowItem) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  onToggleConnection: (id: string) => void;
  onSelect: (id: string, multiSelect: boolean) => void;
}

export function WindowFrame({ item, items, isLinking, isLinkingFrom, isSelected, onUpdate, onDelete, onFocus, onToggleConnection, onSelect }: WindowFrameProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.window-control') || (e.target as HTMLElement).closest('.resize-handle')) return;
    
    // Don't drag if item is locked
    if (item.isLocked) return;
    
    // Prevent canvas panning when starting a drag on a window
    e.stopPropagation();
    
    setIsDragging(true);
    // The main position state is in the parent, so we calculate the offset
    // from the mouse position to the item's top-left corner.
    setDragStart({ x: e.clientX - item.position.x, y: e.clientY - item.position.y });
    onFocus(item.id);

    // Disable text selection and change cursor while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const handleDrag = React.useCallback(
    (e: MouseEvent) => {
      // This check is important to only run the logic when dragging is active
      if (!isDragging) return;
      onUpdate({
        ...item,
        position: { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y },
      });
    },
    [isDragging, dragStart, item, onUpdate]
  );

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);

    // Re-enable text selection and reset cursor when dragging stops
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    // Don't resize if item is locked
    if (item.isLocked) return;
    
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width: item.size.width, height: item.size.height });
    onFocus(item.id);

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
  }

  const handleResize = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = resizeStart.width + (e.clientX - resizeStart.x);
      const newHeight = resizeStart.height + (e.clientY - resizeStart.y);
      onUpdate({
        ...item,
        size: { width: Math.max(newWidth, 300), height: Math.max(newHeight, 200) },
      });
    },
    [isResizing, resizeStart, item, onUpdate]
  );

  const handleResizeEnd = React.useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
    } else {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);


  const renderContent = () => {
    switch (item.type) {
      case 'youtube':
        return <YoutubeEmbed url={item.content} />;
      case 'tiktok':
        return <TiktokEmbed url={item.content} />;
      case 'url':
      case 'social':
      case 'instagram':
        return <iframe src={item.content} className="h-full w-full border-0" title={item.title}></iframe>;
      case 'image':
        return <ImageDropzone item={item} onUpdate={onUpdate} />;
      case 'doc':
        return <DocumentDropzone item={item} onUpdate={onUpdate} />;
      case 'ai':
        return <AiChatWindow item={item} items={items} />;
      default:
        return <div>Unsupported content type</div>;
    }
  };
  
    const ConnectionHandle = ({ side }: { side: 'left' | 'right' }) => {
    const isConnected = side === 'left' ? 
      items.some(i => i.connections.some(c => c.to === item.id)) :
      item.connections.length > 0;
      
    return (
      <div 
        className={cn(
          "connection-handle absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 bg-background cursor-pointer hover:bg-primary hover:border-primary-foreground hover:scale-110 transition-all window-control z-10",
          side === 'left' ? "-left-2" : "-right-2",
          (isLinking || isConnected) ? "border-primary" : "border-muted-foreground/50",
          isLinkingFrom && side === 'right' && "bg-primary animate-pulse"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleConnection(item.id);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
    );
  };

  return (
    <div
      className="absolute window-frame"
      style={{
        left: item.position.x,
        top: item.position.y,
        width: item.size.width,
        height: item.size.height,
        zIndex: item.zIndex,
      }}
      onMouseDown={(e) => {
        // Don't select window if clicking on connection handle
        if ((e.target as HTMLElement).closest('.connection-handle')) return;
        
        onFocus(item.id);
        const isMultiSelect = e.ctrlKey || e.metaKey;
        onSelect(item.id, isMultiSelect);
      }}
    >
      <Card className={cn(
        "flex h-full w-full flex-col shadow-2xl transition-all duration-300 hover:shadow-primary/30 overflow-hidden relative",
        isSelected && "ring-2 ring-primary ring-offset-2",
        item.isLocked && "opacity-75"
      )}>
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between p-2",
            item.isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          )}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            {item.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              className="h-7 border-none bg-transparent text-sm font-medium focus-visible:ring-1"
              disabled={item.isLocked}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="window-control h-7 w-7"
              onClick={() => onDelete(item.id)}
              title="Close window"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
          {renderContent()}
        </CardContent>
         {!item.isLocked && (
           <div 
            className="resize-handle absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
            onMouseDown={handleResizeStart}
          />
         )}
      </Card>
      <ConnectionHandle side="left" />
      <ConnectionHandle side="right" />
    </div>
  );
}
