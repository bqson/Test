import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(file: any, file_path: any) {
  const { data, error } = await supabase.storage.from('images').upload(file_path, file)
  if (error) {
    throw new Error(error.message);
  } else {
    const { data: publicUrl } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }
}
