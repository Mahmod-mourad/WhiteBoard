import * as React from 'react';
import { X } from 'lucide-react';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export function ConnectionLine({ from, to }: ConnectionLineProps) {
  const pathData = `M${from.x} ${from.y} C${from.x + 100} ${from.y}, ${to.x - 100} ${to.y}, ${to.x} ${to.y}`;

  return (
    <path
      d={pathData}
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      fill="none"
      strokeDasharray="4 4"
    />
  );
}
