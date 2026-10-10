import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Transcription = {
  id: string;
  title: string;
  content: string;
  language: string;
  duration_seconds: number;
  word_count: number;
  created_at: string;
};
