/**
 * Simple file-based storage utility for playlist data.
 * Replaces Supabase functionality with local file storage.
 */
export default class FileStorage {
  constructor(filePath = 'playlist-data.json') {
    this.filePath = filePath;
  }

  /**
   * Read data from the storage file
   * @returns {Promise<Object>} The stored data
   */
  async readData() {
    try {
      const response = await fetch(this.filePath);
      if (!response.ok) {
        // File doesn't exist yet, return empty structure
        return { playlists: [] };
      }
      return await response.json();
    } catch (err) {
      console.warn('No existing data file found, starting fresh');
      return { playlists: [] };
    }
  }

  /**
   * Write data to the storage file
   * @param {Object} data - The data to write
   * @returns {Promise<void>}
   */
  async writeData(data) {
    try {
      // In browser environment, we'll use localStorage instead
      localStorage.setItem('playlist-storage', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to write data:', err);
      throw new Error('Failed to save data to storage: ' + err.message);
    }
  }

  /**
   * Fetch saved playlists for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of playlist records
   */
  async fetchSavedPlaylists(userId) {
    const data = await this.readData();
    return data.playlists.filter(p => p.user_id === userId);
  }

  /**
   * Store or update a playlist record
   * @param {Array<string>} playlistList - Array of playlist IDs that make up this merged playlist
   * @param {string} playlistId - The merged playlist ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The stored record
   */
  async storePlaylist(playlistList, playlistId, userId) {
    const data = await this.readData();
    
    // Find existing record
    const existingIndex = data.playlists.findIndex(
      p => p.playlist_id === playlistId && p.user_id === userId
    );

    const record = {
      user_id: userId,
      playlist_id: playlistId,
      playlists: playlistList,
      last_modified: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Update existing record
      data.playlists[existingIndex] = record;
    } else {
      // Add new record
      data.playlists.push(record);
    }

    await this.writeData(data);
    return record;
  }

  /**
   * Initialize storage by reading from localStorage
   * @returns {Promise<Object>}
   */
  async readData() {
    try {
      const stored = localStorage.getItem('playlist-storage');
      if (stored) {
        return JSON.parse(stored);
      }
      return { playlists: [] };
    } catch (err) {
      console.warn('No existing data found, starting fresh');
      return { playlists: [] };
    }
  }
}
