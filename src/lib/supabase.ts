import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://bgvyusksldllhwmbbuek.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJndnl1c2tzbGRsbGh3bWJidWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjMwOTcsImV4cCI6MjA3MTQzOTA5N30.uc2gma8GVXUOnp_p0SXC-Llpk29dhDKR8_5oz7AHfh4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Types for our database
export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Whiteboard = {
  id: string;
  user_id: string;
  name: string;
  data: any; // This will store the whiteboard state
  created_at: string;
  updated_at: string;
};

export type WindowItem = {
  id: string;
  whiteboard_id: string;
  type: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  is_attached: boolean;
  z_index: number;
  connections: { from: string; to: string }[];
  created_at: string;
  updated_at: string;
};

// Data persistence functions
export async function saveWhiteboard(userId: string, whiteboardData: any) {
  const { data, error } = await supabase
    .from('whiteboards')
    .upsert({
      user_id: userId,
      name: 'My Whiteboard',
      data: whiteboardData
    });
  return { data, error };
}

export async function loadWhiteboard(userId: string) {
  const { data, error } = await supabase
    .from('whiteboards')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

export async function saveWindowItems(whiteboardId: string, items: WindowItem[]) {
  const { data, error } = await supabase
    .from('window_items')
    .upsert(
      items.map(item => ({
        ...item,
        whiteboard_id: whiteboardId,
        updated_at: new Date().toISOString()
      }))
    );
  return { data, error };
}

export async function loadWindowItems(whiteboardId: string) {
  const { data, error } = await supabase
    .from('window_items')
    .select('*')
    .eq('whiteboard_id', whiteboardId)
    .order('created_at', { ascending: true });
  return { data, error };
}
