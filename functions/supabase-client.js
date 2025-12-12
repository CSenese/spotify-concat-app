import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/**
 * Small wrapper around the Supabase client to centralize calls.
 */
export default class SupabaseClient {
  /**
   * @param {string} url
   * @param {string} publishableKey
   */
  constructor(url, publishableKey) {
    if (!url || !publishableKey) {
      console.error('Supabase URL or publishable key missing.', { url, publishableKey });
      throw new Error('Supabase URL and publishable key are required to initialize SupabaseClient.');
    }
    try {
      this.client = createClient(url, publishableKey);
      if (!this.client) {
        console.error('createClient returned falsy client', { url, publishableKey });
        throw new Error('Supabase createClient returned a falsy value');
      }
    } catch (err) {
      console.error('Failed to create Supabase client. Did you import the ESM build in a browser environment?', err);
      throw err;
    }
  }

  /**
   * Fetch saved playlists for a user.
   * @param {string} userId
   * @returns {Promise<Array>} rows
   */
  async fetchSavedPlaylists(userId) {
    const { data, error } = await this.client
      .from('playlists')
      .select('playlist_id, playlists')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  /**
   * Insert or update a playlist record for a user.
   * Keeps original storePlaylist signature (playlistList, playlistId) to simplify refactor.
   * @param {string[]} playlistList
   * @param {string} playlistId
   * @param {string} userId
   */
  async storePlaylist(playlistList, playlistId, userId) {
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
