import { createClient } from '@supabase/supabase-js';
import SupabaseClient from '../src/classes/SupabaseClient.js';

/**
 * Server-side init for Supabase clients. Uses createClient from the
 * supabase-js library and returns an initialized SupabaseClient instance.
 */
export async function init(url, publishableKey) {
  if (!url || !publishableKey) {
    console.error('Supabase URL or publishable key missing.', { url, publishableKey });
    throw new Error('Supabase URL and publishable key are required to initialize SupabaseClient.');
  }
  const client = createClient(url, publishableKey);
  return new SupabaseClient(client);
}

export default SupabaseClient;