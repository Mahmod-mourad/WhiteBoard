'use client';

import * as React from 'react';
import type { WindowItem } from '@/lib/types';

interface MinimapProps {
  items: WindowItem[];
  scale: number;
  panOffset: { x: number; y: number };
  onPanChange: (offset: { x: number; y: number }) => void;
}

export function Minimap({ items, scale, panOffset, onPanChange }: MinimapProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const minimapRef = React.useRef<HTMLDivElement>(null);
  
  const MINIMAP_SIZE = 200;
  const WORLD_SIZE = 10000; // Representative world size for minimap
  const minimapScale = MINIMAP_SIZE / WORLD_SIZE;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;
    
    setIsDragging(true);
    updatePanFromMinimap(e);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updatePanFromMinimap(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePanFromMinimap = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const minimapX = e.clientX - rect.left;
    const minimapY = e.clientY - rect.top;
    
    // Convert minimap coordinates to world coordinates
    const worldX = (minimapX / minimapScale) - (WORLD_SIZE / 2);
    const worldY = (minimapY / minimapScale) - (WORLD_SIZE / 2);
    
    // Calculate new pan offset to center the clicked point
    const newPanOffset = {
      x: -worldX * scale + window.innerWidth / 2,
      y: -worldY * scale + window.innerHeight / 2,
    };
    
    onPanChange(newPanOffset);
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (minimapRef.current) {
          const rect = minimapRef.current.getBoundingClientRect();
          const minimapX = e.clientX - rect.left;
          const minimapY = e.clientY - rect.top;
          
          const worldX = (minimapX / minimapScale) - (WORLD_SIZE / 2);
          const worldY = (minimapY / minimapScale) - (WORLD_SIZE / 2);
          
          const newPanOffset = {
            x: -worldX * scale + window.innerWidth / 2,
            y: -worldY * scale + window.innerHeight / 2,
          };
          
          onPanChange(newPanOffset);
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, minimapScale, scale, onPanChange]);

  // Calculate viewport rectangle in minimap coordinates
  const viewportWidth = window.innerWidth / scale;
  const viewportHeight = window.innerHeight / scale;
  const viewportX = (-panOffset.x / scale) + (WORLD_SIZE / 2);
  const viewportY = (-panOffset.y / scale) + (WORLD_SIZE / 2);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-card border rounded-lg p-2 shadow-lg">
      <div className="text-xs font-medium mb-2 text-muted-foreground">Navigation</div>
      <div
        ref={minimapRef}
        className="relative border rounded cursor-crosshair bg-muted/20"
        style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Items on minimap */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute bg-primary/60 rounded-sm"
            style={{
              left: (item.position.x + WORLD_SIZE / 2) * minimapScale,
              top: (item.position.y + WORLD_SIZE / 2) * minimapScale,
              width: Math.max(2, item.size.width * minimapScale),
              height: Math.max(2, item.size.height * minimapScale),
            }}
          />
        ))}
        
        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-primary bg-primary/10 rounded"
          style={{
            left: viewportX * minimapScale,
            top: viewportY * minimapScale,
            width: viewportWidth * minimapScale,
            height: viewportHeight * minimapScale,
          }}
        />
      </div>
      
      {/* Zoom level indicator */}
      <div className="mt-2 text-xs text-center text-muted-foreground">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
