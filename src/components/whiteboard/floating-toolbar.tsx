'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Copy,
  Trash2,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock
} from 'lucide-react';

interface FloatingToolbarProps {
  // Selection state
  hasSelection: boolean;
  selectedItemsCount: number;
  
  // Selection actions
  onCopy?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
}

export function FloatingToolbar({
  hasSelection,
  selectedItemsCount,
  onCopy,
  onDelete,
  onDuplicate,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onLock,
  onUnlock,
}: FloatingToolbarProps) {
  return (
    <TooltipProvider>
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2">
          {/* Selection Actions (only show when items are selected) */}
          {hasSelection && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground px-2">
                {selectedItemsCount} selected
              </span>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy (Ctrl+C)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onDuplicate}>
                    <Move className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Duplicate (Ctrl+D)</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onAlignLeft}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Left</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onAlignCenter}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Center</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onAlignRight}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Right</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onLock}>
                    <Lock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lock Selection</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete (Del)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
