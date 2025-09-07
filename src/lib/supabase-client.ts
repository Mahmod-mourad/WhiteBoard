'use client';

import { createClient } from '@supabase/supabase-js';
import type { WindowItem } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type DatabaseWindowItem = {
  id: string;
  whiteboard_id: string;
  type: string;
  title: string;
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  is_attached: boolean;
  is_locked: boolean;
  scraped_content?: string;
  scraped_metadata?: any;
  scrape_status: 'pending' | 'processing' | 'completed' | 'failed';
  scrape_error?: string;
  created_at: string;
  updated_at: string;
};

// Convert WindowItem to Database format
export function windowItemToDatabase(item: WindowItem, whiteboardId: string): Partial<DatabaseWindowItem> {
  return {
    id: item.id,
    whiteboard_id: whiteboardId,
    type: item.type,
    title: item.title,
    content: item.content,
    position_x: item.position.x,
    position_y: item.position.y,
    width: item.size.width,
    height: item.size.height,
    z_index: item.zIndex,
    is_attached: item.isAttached,
    is_locked: item.isLocked || false,
    scrape_status: 'pending'
  };
}

// Convert Database to WindowItem format
export function databaseToWindowItem(dbItem: DatabaseWindowItem): WindowItem {
  return {
    id: dbItem.id,
    type: dbItem.type as any,
    title: dbItem.title,
    content: dbItem.content,
    position: { x: dbItem.position_x, y: dbItem.position_y },
    size: { width: dbItem.width, height: dbItem.height },
    zIndex: dbItem.z_index,
    isAttached: dbItem.is_attached,
    isLocked: dbItem.is_locked,
    connections: [] // Will be loaded separately
  };
}