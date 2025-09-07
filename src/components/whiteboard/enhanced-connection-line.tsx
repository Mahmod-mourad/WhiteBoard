'use client';

import * as React from 'react';
import type { Connection, WindowItem } from '@/lib/types';
import { getConnectionStyle, calculateConnectionPath, getConnectionHandlePosition, findOptimalConnectionSides } from '@/lib/connection-utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EnhancedConnectionLineProps {
  connection: Connection;
  fromItem: WindowItem;
  toItem: WindowItem;
  scale: number;
  onDelete?: (connectionId: string) => void;
  isHighlighted?: boolean;
  obstacles?: WindowItem[];
}

export function EnhancedConnectionLine({
  connection,
  fromItem,
  toItem,
  scale,
  onDelete,
  isHighlighted = false,
  obstacles = [],
}: EnhancedConnectionLineProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const style = getConnectionStyle(connection);
  
  // Calculate optimal connection points with spreading for multiple connections
  const sides = findOptimalConnectionSides(fromItem, toItem);
  
  // Simple approach: use connection ID hash to create consistent spreading
  const connectionHash = connection.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Create a pseudo-random but deterministic offset based on connection ID
  const spreadFactor = Math.abs(connectionHash % 100) / 100; // 0-1 range
  const offsetVariation = 0.2; // ±20% variation from center
  const fromOffset = 0.5 + (spreadFactor - 0.5) * offsetVariation;
  const toOffset = 0.5 + ((1 - spreadFactor) - 0.5) * offsetVariation; // Inverse for variety
  
  const fromPoint = getConnectionHandlePosition(fromItem, sides.from, fromOffset);
  const toPoint = getConnectionHandlePosition(toItem, sides.to, toOffset);
  
  // Calculate path with smart routing
  const pathData = calculateConnectionPath(fromPoint, toPoint, obstacles);
  
  // Calculate midpoint for label and controls
  const midPoint = {
    x: (fromPoint.x + toPoint.x) / 2,
    y: (fromPoint.y + toPoint.y) / 2,
  };
  
  // Arrow marker ID
  const markerId = `arrow-${connection.id}`;
  
  // Generate stroke pattern based on style
  const getStrokeDashArray = () => {
    switch (style.strokeStyle) {
      case 'dashed':
        return '8 4';
      case 'dotted':
        return '2 2';
      default:
        return 'none';
    }
  };
  
  // Generate arrow marker
  const renderArrowMarker = () => {
    if (style.arrowType === 'none') return null;
    
    const size = Math.max(6, style.strokeWidth * 2);
    
    switch (style.arrowType) {
      case 'arrow':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth={size}
              markerHeight={size}
              refX={size - 1}
              refY={size / 2}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d={`M0,0 L0,${size} L${size},${size / 2} z`}
                fill={style.color}
              />
            </marker>
          </defs>
        );
      case 'diamond':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth={size}
              markerHeight={size}
              refX={size / 2}
              refY={size / 2}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d={`M0,${size / 2} L${size / 2},0 L${size},${size / 2} L${size / 2},${size} z`}
                fill={style.color}
                stroke={style.color}
                strokeWidth={1}
              />
            </marker>
          </defs>
        );
      case 'circle':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth={size}
              markerHeight={size}
              refX={size / 2}
              refY={size / 2}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size / 3}
                fill={style.color}
                stroke={style.color}
                strokeWidth={1}
              />
            </marker>
          </defs>
        );
      case 'square':
        return (
          <defs>
            <marker
              id={markerId}
              markerWidth={size}
              markerHeight={size}
              refX={size / 2}
              refY={size / 2}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <rect
                x={size / 4}
                y={size / 4}
                width={size / 2}
                height={size / 2}
                fill={style.color}
                stroke={style.color}
                strokeWidth={1}
              />
            </marker>
          </defs>
        );
      default:
        return null;
    }
  };
  
  return (
    <g>
      {renderArrowMarker()}
      
      {/* Main connection path */}
      <path
        d={pathData}
        stroke={style.color}
        strokeWidth={style.strokeWidth / scale}
        fill="none"
        strokeDasharray={getStrokeDashArray()}
        markerEnd={style.arrowType !== 'none' ? `url(#${markerId})` : undefined}
        opacity={isHighlighted ? 1 : 0.8}
        className={`cursor-pointer transition-all duration-200 ${
          isHovered ? 'drop-shadow-lg' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {style.animated && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;12"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>
      
      {/* Bidirectional arrow */}
      {connection.bidirectional && style.arrowType !== 'none' && (
        <path
          d={pathData}
          stroke={style.color}
          strokeWidth={style.strokeWidth / scale}
          fill="none"
          strokeDasharray={getStrokeDashArray()}
          markerStart={`url(#${markerId})`}
          opacity={0.6}
        />
      )}
      

      
      {/* Connection delete button */}
      {isHovered && onDelete && (
        <foreignObject
          x={midPoint.x - 12}
          y={midPoint.y - 12}
          width="24"
          height="24"
          className="pointer-events-auto"
        >
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 rounded-full p-0 shadow-lg border-2 border-background"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(connection.id);
            }}
            style={{ transform: `scale(${Math.max(1 / scale, 0.8)})` }}
            title="Disconnect"
          >
            <X className="h-3 w-3" />
          </Button>
        </foreignObject>
      )}
      
      {/* Connection info tooltip on hover */}
      {isHovered && (
        <foreignObject
          x={midPoint.x - 40}
          y={midPoint.y - 40}
          width="80"
          height="20"
          className="pointer-events-none"
        >
          <div
            className="flex items-center justify-center h-full text-xs bg-background border rounded px-2 shadow-md opacity-90"
            style={{ transform: `scale(${Math.max(1 / scale, 0.7)})` }}
          >
            Click X to disconnect
          </div>
        </foreignObject>
      )}
      
      {/* Strength indicator */}
      {connection.strength && connection.strength > 1 && (
        <path
          d={pathData}
          stroke={style.color}
          strokeWidth={(style.strokeWidth + connection.strength) / scale}
          fill="none"
          strokeDasharray={getStrokeDashArray()}
          opacity={0.3}
          className="pointer-events-none"
        />
      )}
    </g>
  );
}
