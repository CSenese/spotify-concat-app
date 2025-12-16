import Song from './Song.js';

/**
 * Represents a Playlist.
 * @class
 */
class Playlist {
    /**
     * @param {string} playlistName
     * @param {Song[]} songs
     * @param {string} playlistId
     * @param {number} tracks
     */
    constructor(playlistName = '', songs = [], playlistId = '',tracks = 0) {
        this.playlistName = playlistName;
        this.songs = songs;
        this.playlistId = playlistId;
        this.tracks = tracks;
    }

    /**
     * Loads songs from Spotify and populates this.songs
     * @returns {Promise<void>}
     */
    async loadSongs(accessToken) {
        //get all songs from spotify with pagination
        let allItems = [];
        let offset = 0;
        const limit = 100;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks?limit=${limit}&offset=${offset}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            allItems = allItems.concat(data.items);
            offset += limit;
            hasMore = data.next !== null;
        }
        
        // Filter out null/unavailable tracks and map to Song objects
        this.songs = allItems
            .filter(item => item.track && item.track.uri && item.track.id)
            .map(item => 
                new Song(item.track.name, item.track.id, item.track.uri)
            );
    }
}

export default Playlist;