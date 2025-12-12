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
     * Adds a song to the playlist.
     * @param {Song} song
     */
    addSong(song) {
        this.songs.push(song);
    }
}

export default Playlist;