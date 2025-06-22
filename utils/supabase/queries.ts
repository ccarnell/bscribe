import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types_db'; // Adjust path based on your setup

export async function getPendingBookGeneration(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('book_generations')
    .select('*')
    .eq('status', 'pending')
    .eq('current_step', 'awaiting_chapters')
    .is('chapters', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateBookGeneration(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: {
    status?: string;
    current_step?: string;
    chapters?: any;
    chapter_content?: any;
    revision_count?: number;
    chapter_revisions?: any;
    total_revisions?: number;
  }
) {
  const { error } = await supabase
    .from('book_generations')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}