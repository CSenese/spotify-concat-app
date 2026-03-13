/**
 * Minimal wrapper class for Supabase interactions.
 * This file contains no backend-only imports so it can be used in src/ (browser).
 */

// import { init as initServerClient } from '../../api/supabase-client.js';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


export default class SupabaseClient {
  constructor(client = null) {
    this.client = client;
  }

  static async init(url, publishableKey) {
    if (!url || !publishableKey) {
      console.error('Supabase URL or publishable key missing.', { url, publishableKey });
      throw new Error('Supabase URL and publishable key are required to initialize SupabaseClient.');
    }

    try {
    //   const instance = await initServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      const client = createClient(url, publishableKey);
      if (!client) {
        console.error('createClient returned falsy client', { url, publishableKey });
        throw new Error('Supabase createClient returned a falsy value');
      }
      return client;
    } catch (err) {
      console.error('Failed to dynamically import @supabase/supabase-js', err);
      throw err;
    }
  }

  async fetchSavedPlaylists(userId) {
    if (!this.client) {
      throw new Error('Supabase client not initialized on SupabaseClient instance.');
    }
    const { data, error } = await this.client
      .from('playlists')
      .select('playlist_id, playlists')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  async storePlaylist(playlistList, playlistId, userId) {
    if (!this.client) {
      throw new Error('Supabase client not initialized on SupabaseClient instance.');
    }

    const { data, error: fetchError } = await this.client
      .from('playlists')
      .select('playlist_id')
      .eq('playlist_id', playlistId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const payload = {
      user_id: userId,
      playlist_id: playlistId,
      playlists: playlistList,
      last_modified: new Date().toISOString(),
    };

    let result;
    if (data) {
      result = await this.client
        .from('playlists')
        .update(payload)
        .eq('playlist_id', playlistId)
        .eq('user_id', userId);
    } else {
      result = await this.client.from('playlists').insert(payload);
    }

    if (result.error) throw result.error;
    return result;
  }
}