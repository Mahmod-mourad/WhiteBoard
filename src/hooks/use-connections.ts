import * as React from 'react';
import type { Connection, ConnectionType, WindowItem } from '@/lib/types';
import { createConnection, validateConnection, getItemConnections } from '@/lib/connection-utils';

export function useConnections(items: WindowItem[]) {
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [selectedConnectionType, setSelectedConnectionType] = React.useState<ConnectionType>('association');
  const [editingConnection, setEditingConnection] = React.useState<Connection | null>(null);

  // Extract all connections from items
  React.useEffect(() => {
    const allConnections = items.flatMap(item => item.connections);
    setConnections(allConnections);
  }, [items]);

  const addConnection = React.useCallback((fromId: string, toId: string, type?: ConnectionType) => {
    const connectionType = type || selectedConnectionType;
    const newConnection = createConnection(fromId, toId, connectionType);
    
    if (validateConnection(newConnection, items)) {
      setConnections(prev => [...prev, newConnection]);
      return newConnection;
    }
    return null;
  }, [selectedConnectionType, items]);

  const updateConnection = React.useCallback((updatedConnection: Connection) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === updatedConnection.id ? updatedConnection : conn
      )
    );
  }, []);

  const deleteConnection = React.useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  }, []);

  const getConnectionById = React.useCallback((id: string) => {
    return connections.find(conn => conn.id === id) || null;
  }, [connections]);

  const getConnectionsBetween = React.useCallback((fromId: string, toId: string) => {
    return connections.filter(conn => 
      (conn.from === fromId && conn.to === toId) ||
      (conn.bidirectional && conn.from === toId && conn.to === fromId)
    );
  }, [connections]);

  const getItemConnectionCount = React.useCallback((itemId: string) => {
    return getItemConnections(itemId, connections).length;
  }, [connections]);

  const filterConnectionsByType = React.useCallback((types: ConnectionType[]) => {
    return connections.filter(conn => types.includes(conn.type));
  }, [connections]);

  const findShortestPath = React.useCallback((fromId: string, toId: string): string[] => {
    // Simple BFS implementation for shortest path
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === toId) {
        return path;
      }
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const itemConnections = getItemConnections(id, connections);
      for (const conn of itemConnections) {
        const nextId = conn.from === id ? conn.to : conn.from;
        if (!visited.has(nextId)) {
          queue.push({ id: nextId, path: [...path, nextId] });
        }
      }
    }
    
    return []; // No path found
  }, [connections]);

  const getConnectionStats = React.useCallback(() => {
    const typeCount = connections.reduce((acc, conn) => {
      acc[conn.type] = (acc[conn.type] || 0) + 1;
      return acc;
    }, {} as Record<ConnectionType, number>);
    
    const itemConnections = connections.reduce((acc, conn) => {
      acc[conn.from] = (acc[conn.from] || 0) + 1;
      acc[conn.to] = (acc[conn.to] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostConnected = Object.entries(itemConnections)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    return {
      total: connections.length,
      byType: typeCount,
      byItem: itemConnections,
      mostConnected,
      averagePerItem: Object.keys(itemConnections).length > 0 
        ? Object.values(itemConnections).reduce((a, b) => a + b, 0) / Object.keys(itemConnections).length 
        : 0,
    };
  }, [connections]);

  return {
    connections,
    selectedConnectionType,
    setSelectedConnectionType,
    editingConnection,
    setEditingConnection,
    addConnection,
    updateConnection,
    deleteConnection,
    getConnectionById,
    getConnectionsBetween,
    getItemConnectionCount,
    filterConnectionsByType,
    findShortestPath,
    getConnectionStats,
  };
}
