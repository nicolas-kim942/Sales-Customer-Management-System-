/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getStoredSupabaseConfig = () => {
  const customUrl = localStorage.getItem('supabase_custom_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const customKey = localStorage.getItem('supabase_custom_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: customUrl, key: customKey };
};

export const getSupabaseConfig = () => getStoredSupabaseConfig();

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(
    url && 
    key && 
    !url.includes('YOUR_SUPABASE') &&
    url.startsWith('http')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key || url.includes('YOUR_SUPABASE') || !url.startsWith('http')) {
    return null;
  }
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (e) {
    console.error('Failed to initialize Supabase client', e);
    return null;
  }
};
