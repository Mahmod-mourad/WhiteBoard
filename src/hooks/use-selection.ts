import * as React from 'react';
import type { WindowItem, SelectionBox } from '@/lib/types';

export function useSelection() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = React.useState<SelectionBox | null>(null);
  const [isBoxSelecting, setIsBoxSelecting] = React.useState(false);

  const selectItem = React.useCallback((id: string, multiSelect: boolean = false) => {
    setSelectedIds(prev => {
      const newSet = new Set(multiSelect ? prev : []);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectItems = React.useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = React.useCallback((items: WindowItem[]) => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, []);

  const isSelected = React.useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const getSelectedItems = React.useCallback((items: WindowItem[]) => {
    return items.filter(item => selectedIds.has(item.id));
  }, [selectedIds]);

  const startBoxSelection = React.useCallback((x: number, y: number) => {
    setIsBoxSelecting(true);
    setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
  }, []);

  const updateBoxSelection = React.useCallback((x: number, y: number) => {
    if (selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  }, [selectionBox]);

  const endBoxSelection = React.useCallback((items: WindowItem[], scale: number, panOffset: { x: number; y: number }) => {
    if (!selectionBox) return;

    // Convert screen coordinates to world coordinates
    const worldBox = {
      startX: (selectionBox.startX - panOffset.x) / scale,
      startY: (selectionBox.startY - panOffset.y) / scale,
      endX: (selectionBox.endX - panOffset.x) / scale,
      endY: (selectionBox.endY - panOffset.y) / scale,
    };

    // Normalize box coordinates
    const minX = Math.min(worldBox.startX, worldBox.endX);
    const maxX = Math.max(worldBox.startX, worldBox.endX);
    const minY = Math.min(worldBox.startY, worldBox.endY);
    const maxY = Math.max(worldBox.startY, worldBox.endY);

    // Find items that intersect with the selection box
    const selectedItemIds = items
      .filter(item => {
        const itemLeft = item.position.x;
        const itemRight = item.position.x + item.size.width;
        const itemTop = item.position.y;
        const itemBottom = item.position.y + item.size.height;

        return !(itemRight < minX || itemLeft > maxX || itemBottom < minY || itemTop > maxY);
      })
      .map(item => item.id);

    setSelectedIds(new Set(selectedItemIds));
    setSelectionBox(null);
    setIsBoxSelecting(false);
  }, [selectionBox]);

  const cancelBoxSelection = React.useCallback(() => {
    setSelectionBox(null);
    setIsBoxSelecting(false);
  }, []);

  return {
    selectedIds,
    selectionBox,
    isBoxSelecting,
    selectItem,
    selectItems,
    clearSelection,
    selectAll,
    isSelected,
    getSelectedItems,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    cancelBoxSelection,
  };
}
