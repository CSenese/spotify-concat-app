/**
 * Represents a Playlist.
 * @class
 */
class Playlist {
    /**
     * @param {string} playlistName
     * @param {Song[]} songs
     * @param {string} playlistId
     */
    constructor(playlistName = '', songs = [], playlistId = '') {
        this.playlistName = playlistName;
        this.songs = songs;
        this.playlistId = playlistId;
    }

    /**
     * get playlist
     * @return {Playlist} playlist
     */
    getPlaylist() {
        return this;
    }
}

export default Playlist;