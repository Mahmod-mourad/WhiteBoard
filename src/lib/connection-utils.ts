import type { Connection, ConnectionType, ConnectionStyle, WindowItem } from './types';

// Default styles for different connection types
export const CONNECTION_STYLES: Record<ConnectionType, ConnectionStyle> = {
  flow: {
    color: 'hsl(var(--primary))',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowType: 'arrow',
    animated: true,
  },
  dependency: {
    color: 'hsl(var(--destructive))',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowType: 'arrow',
  },
  association: {
    color: 'hsl(var(--muted-foreground))',
    strokeWidth: 1.5,
    strokeStyle: 'solid',
    arrowType: 'none',
  },
  inheritance: {
    color: 'hsl(var(--chart-2))',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowType: 'diamond',
  },
  composition: {
    color: 'hsl(var(--chart-3))',
    strokeWidth: 2.5,
    strokeStyle: 'solid',
    arrowType: 'diamond',
  },
  aggregation: {
    color: 'hsl(var(--chart-4))',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowType: 'diamond',
  },
  communication: {
    color: 'hsl(var(--chart-5))',
    strokeWidth: 1.5,
    strokeStyle: 'dotted',
    arrowType: 'circle',
  },
  reference: {
    color: 'hsl(var(--muted-foreground))',
    strokeWidth: 1,
    strokeStyle: 'dotted',
    arrowType: 'none',
  },
};

// Connection type descriptions
export const CONNECTION_DESCRIPTIONS: Record<ConnectionType, string> = {
  flow: 'Data or process flow between items',
  dependency: 'One item depends on another',
  association: 'General relationship or link',
  inheritance: 'Hierarchical parent-child relationship',
  composition: 'Strong ownership relationship',
  aggregation: 'Weak ownership relationship',
  communication: 'Communication or interaction',
  reference: 'Reference or pointer to another item',
};

// Create a new connection with defaults
export function createConnection(
  from: string,
  to: string,
  type: ConnectionType = 'association',
  options: Partial<Connection> = {}
): Connection {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    from,
    to,
    type,
    style: { ...CONNECTION_STYLES[type], ...options.style },
    bidirectional: false,
    strength: 1,
    created: now,
    updated: now,
    ...options,
  };
}

// Get connection style with overrides
export function getConnectionStyle(connection: Connection): ConnectionStyle {
  const baseStyle = CONNECTION_STYLES[connection.type];
  return { ...baseStyle, ...connection.style };
}

// Calculate connection path with smart routing
export function calculateConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  obstacles: WindowItem[] = []
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Dynamic control point offset based on distance
  const distance = Math.sqrt(dx * dx + dy * dy);
  const baseOffset = Math.max(distance * 0.25, 80); // Increased minimum offset
  
  // Use a more balanced approach for all directions
  const horizontalOffset = Math.abs(dx) > 100 ? baseOffset : baseOffset * 0.7;
  const verticalOffset = Math.abs(dy) > 100 ? baseOffset : baseOffset * 0.7;
  
  // Create control points that work well in all directions
  const cp1x = from.x + Math.sign(dx) * horizontalOffset * 0.6;
  const cp1y = from.y + Math.sign(dy) * verticalOffset * 0.3;
  const cp2x = to.x - Math.sign(dx) * horizontalOffset * 0.6;
  const cp2y = to.y - Math.sign(dy) * verticalOffset * 0.3;
  
  return `M${from.x} ${from.y} C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

// Get connection handle position
export function getConnectionHandlePosition(
  item: WindowItem,
  side: 'left' | 'right' | 'top' | 'bottom',
  offset: number = 0.5
): { x: number; y: number } {
  const { position, size } = item;
  
  // Clamp offset to prevent connections from appearing outside the window
  const clampedOffset = Math.max(0.1, Math.min(0.9, offset));
  
  switch (side) {
    case 'left':
      return {
        x: position.x,
        y: position.y + size.height * clampedOffset,
      };
    case 'right':
      return {
        x: position.x + size.width,
        y: position.y + size.height * clampedOffset,
      };
    case 'top':
      return {
        x: position.x + size.width * clampedOffset,
        y: position.y,
      };
    case 'bottom':
      return {
        x: position.x + size.width * clampedOffset,
        y: position.y + size.height,
      };
  }
}



// Find optimal connection sides for two items
export function findOptimalConnectionSides(
  fromItem: WindowItem,
  toItem: WindowItem
): { from: 'left' | 'right' | 'top' | 'bottom'; to: 'left' | 'right' | 'top' | 'bottom' } {
  const fromCenter = {
    x: fromItem.position.x + fromItem.size.width / 2,
    y: fromItem.position.y + fromItem.size.height / 2,
  };
  
  const toCenter = {
    x: toItem.position.x + toItem.size.width / 2,
    y: toItem.position.y + toItem.size.height / 2,
  };
  
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  
  // Determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    return {
      from: dx > 0 ? 'right' : 'left',
      to: dx > 0 ? 'left' : 'right',
    };
  } else {
    // Vertical connection
    return {
      from: dy > 0 ? 'bottom' : 'top',
      to: dy > 0 ? 'top' : 'bottom',
    };
  }
}

// Connection validation
export function validateConnection(connection: Connection, items: WindowItem[]): boolean {
  const fromItem = items.find(item => item.id === connection.from);
  const toItem = items.find(item => item.id === connection.to);
  
  // Basic validation
  if (!fromItem || !toItem) return false;
  if (connection.from === connection.to) return false;
  
  return true;
}

// Get all connections for an item
export function getItemConnections(itemId: string, allConnections: Connection[]): Connection[] {
  return allConnections.filter(conn => conn.from === itemId || conn.to === itemId);
}

// Get connection statistics
export function getConnectionStats(connections: Connection[]) {
  const typeCount = connections.reduce((acc, conn) => {
    acc[conn.type] = (acc[conn.type] || 0) + 1;
    return acc;
  }, {} as Record<ConnectionType, number>);
  
  const itemConnections = connections.reduce((acc, conn) => {
    acc[conn.from] = (acc[conn.from] || 0) + 1;
    acc[conn.to] = (acc[conn.to] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: connections.length,
    byType: typeCount,
    byItem: itemConnections,
    averagePerItem: Object.keys(itemConnections).length > 0 
      ? Object.values(itemConnections).reduce((a, b) => a + b, 0) / Object.keys(itemConnections).length 
      : 0,
  };
}
