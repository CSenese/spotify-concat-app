/**
 * Represents a Song.
 * @class
 */
class Song {
    /**
     * @param {string} name
     * @param {string} id
     * @param {string} uri
     */
    constructor(name = '', id = '', uri = '') {
        this.name = name;
        this.id = id;
        this.uri = uri;
    }
}

export default Song;