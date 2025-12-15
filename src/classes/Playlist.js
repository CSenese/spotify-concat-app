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
        //get the songs from spotify
        const response = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        this.songs = data.items.map(item => 
            new Song(item.track.name, item.track.id, item.track.uri)
        );
    }
}

export default Playlist;