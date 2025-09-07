import * as React from 'react';
import type { WindowItem, HistoryAction } from '@/lib/types';

const MAX_HISTORY_SIZE = 50;

export function useHistory(items: WindowItem[], setItems: React.Dispatch<React.SetStateAction<WindowItem[]>>) {
  const [history, setHistory] = React.useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = React.useState(false);

  const addToHistory = React.useCallback((action: Omit<HistoryAction, 'timestamp'>) => {
    if (isUndoRedoing) return;

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        ...action,
        timestamp: Date.now(),
      });
      
      // Keep history size manageable
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
  }, [historyIndex, isUndoRedoing]);

  const undo = React.useCallback(() => {
    if (historyIndex >= 0) {
      setIsUndoRedoing(true);
      const action = history[historyIndex];
      
      if (action) {
        // Restore previous state
        switch (action.type) {
          case 'add':
            // Remove added items
            setItems(prev => prev.filter(item => !action.items.some(actionItem => actionItem.id === item.id)));
            break;
          case 'delete':
            // Restore deleted items
            setItems(prev => [...prev, ...action.items]);
            break;
          case 'update':
          case 'move':
          case 'resize':
            // Restore previous item states
            setItems(prev => prev.map(item => {
              const actionItem = action.items.find(ai => ai.id === item.id);
              return actionItem ? actionItem : item;
            }));
            break;
        }
      }
      
      setHistoryIndex(prev => prev - 1);
      setTimeout(() => setIsUndoRedoing(false), 0);
    }
  }, [history, historyIndex, setItems]);

  const redo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedoing(true);
      const nextIndex = historyIndex + 1;
      const action = history[nextIndex];
      
      if (action) {
        // Apply the action again
        switch (action.type) {
          case 'add':
            // Re-add items
            setItems(prev => [...prev, ...action.items]);
            break;
          case 'delete':
            // Re-delete items
            setItems(prev => prev.filter(item => !action.items.some(actionItem => actionItem.id === item.id)));
            break;
          case 'update':
          case 'move':
          case 'resize':
            // Apply the changes again
            setItems(prev => prev.map(item => {
              const actionItem = action.items.find(ai => ai.id === item.id);
              return actionItem ? actionItem : item;
            }));
            break;
        }
      }
      
      setHistoryIndex(nextIndex);
      setTimeout(() => setIsUndoRedoing(false), 0);
    }
  }, [history, historyIndex, setItems]);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    isUndoRedoing,
  };
}
