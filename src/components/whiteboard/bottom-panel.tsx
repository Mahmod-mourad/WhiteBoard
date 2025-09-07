'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Minimap } from './minimap';
import { 
  Grid3X3, 
  Undo, 
  Redo, 
  MousePointer2,
  Move,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import type { WindowItem } from '@/lib/types';

interface BottomPanelProps {
  // Minimap props
  items: WindowItem[];
  scale: number;
  panOffset: { x: number; y: number };
  onPanChange: (offset: { x: number; y: number }) => void;
  
  // Zoom controls
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  
  // History controls
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  
  // Status info
  selectedItemsCount: number;
  cursorPosition?: { x: number; y: number };
  
  // Settings
  showGrid: boolean;
  onToggleGrid: () => void;
}

export function BottomPanel({
  items,
  scale,
  panOffset,
  onPanChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedItemsCount,
  cursorPosition,
  showGrid,
  onToggleGrid
}: BottomPanelProps) {
  const [zoomValue, setZoomValue] = React.useState([scale * 100]);

  React.useEffect(() => {
    setZoomValue([scale * 100]);
  }, [scale]);

  const handleZoomSliderChange = (value: number[]) => {
    const newScale = value[0] / 100;
    // This would need to be passed as a prop or handled differently
    // For now, just update the visual state
    setZoomValue(value);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between px-4 py-2 gap-4">
          
          {/* Left Section - Minimap */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Navigation</span>
              <div className="w-32 h-20 border border-border rounded bg-muted/30">
                <Minimap
                  items={items}
                  scale={scale}
                  panOffset={panOffset}
                  onPanChange={onPanChange}
                />
              </div>
            </div>
          </div>

          {/* Center Section - Zoom Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2 min-w-[120px]">
                <Slider
                  value={zoomValue}
                  onValueChange={handleZoomSliderChange}
                  max={300}
                  min={10}
                  step={5}
                  className="w-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onZoomReset}
                  className="text-xs min-w-[3rem]"
                >
                  {Math.round(scale * 100)}%
                </Button>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* History Controls */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onUndo}
                    disabled={!canUndo}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onRedo}
                    disabled={!canRedo}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (Ctrl+Y)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* View Settings */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={showGrid ? "default" : "ghost"} 
                    size="sm" 
                    onClick={onToggleGrid}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Grid (G)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Right Section - Status Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {selectedItemsCount > 0 && (
                <div className="flex items-center gap-1">
                  <MousePointer2 className="h-3 w-3" />
                  <span>{selectedItemsCount} selected</span>
                </div>
              )}
              
              {cursorPosition && (
                <div className="flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  <span>
                    {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span>{items.length} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
