/**
 * Represents a Song.
 * @class
 */
class Song {
    /**
     * @param {string} name
     * @param {string} id
     */
    constructor(name = '', id = '') {
        this.name = name;
        this.id = id;
    }
}

export default Song;