import SupabaseClient from '../classes/SupabaseClient.js';

/**
 * Represents a User.
 * @class
 */
class User {
    /**
     * @param {string} accessToken
     * @param {Playlist[]} userPlaylists
     * @param {Playlist[]} workingPlaylists
     * @param {Playlist[]} supaPlaylists
     * @param {SupabaseClient} supabaseClient
     */
    constructor(accessToken, userPlaylists = [], workingPlaylists = [], supaPlaylists = [], supabaseClient = null) {
        this.accessToken = accessToken;
        this.userPlaylists = userPlaylists;
    }

    /**
     * initialize the supabase client for this user
     * @async
     * @param {string} url
     * @param {string} publishableKey
     * @returns Promise<void>
     */
    async initSupabaseClient(url, publishableKey) {
        this.supabaseClient = new SupabaseClient(await SupabaseClient.init(url, publishableKey));
    }

    /**
     * loads the user's playlists from spotify and return the list so that the front * end can render them
     * @async
     * @returns Promise<Playlist[]>
     */
    async loadUserPlaylists() {
        // Implementation to load user playlists from Spotify
        if (!this.accessToken) {
            throw new Error('Access token is required to load user playlists.');
        } else {
            // Fetch playlists from Spotify API using this.accessToken
            let data = fetch(`https://api.spotify.com/v1/me/playlists`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
            })
            .then(res => res.json())
            .catch(err => {
                throw new Error('Failed to fetch user playlists from Spotify: ' + err.message);
            });
            console.log(data);
            return data.items; // Assuming data.items contains the list of playlists
        }
    }

    /**
     * selects a playlist and adds it to working playlists at the end
     * @param {Playlist} playlist
     * @returns void
     */
    selectPlaylist(playlist) {
        // Implementation to select a playlist
    }

    /**
     * deselects a playlist from working playlists
     * @param {Playlist} playlist
     * @returns void
     */
    deselectPlaylist(playlist) {
        // Implementation to deselect a playlist
    }

    /**
     * loads the user's supabase playlists and return the list so that the front end can render them
     * @async
     * @returns Promise<Playlist[]>
     */
    async loadSupaPlaylists() {
        // Implementation to load supabase playlists
    }

    /**
     * saves a playlist to supabase and spotify.  Probably the beefiest method here.
     * @async
     * @param {Playlist} playlist
     * @returns Promise<void>
     */    
    async savePlaylist(playlist) {
        // Implementation to save playlist to supabase and spotify
    }

    /**
     * move the playlist order of playlists in working playlists
     * @param {string} direction - 'left' or 'right'
     * @param {string} playlistId
     * @returns void
     */
    movePlaylist(direction, playlistId) {
        // Implementation to move playlist order
    }

    /**
     * retrieve playlist by id from user playlists
     * @param {string} playlistId
     * @returns Playlist
     */
    getUserPlaylistById(playlistId) {
        // Implementation to get user playlist by id
    }

    /**
     * retrieve public playlists of friend from spotify
     * @async
     * @param {string} friendId
     * @returns Promise<Playlist[]>
     */
    async getFriendPublicPlaylists(friendId) {
        // Implementation to get friend's public playlists
    }
    
}

export default User;