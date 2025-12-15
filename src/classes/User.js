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
        this.workingPlaylists = workingPlaylists;
        this.supaPlaylists = supaPlaylists;
        this.supabaseClient = supabaseClient;
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
     * @returns nothing because we are allowing direct access to userPlaylists through the class property
     */
    async loadUserPlaylists() {
        // Implementation to load user playlists from Spotify
        if (!this.accessToken) {
            throw new Error('Access token is required to load user playlists.');
        } else {
            try {
                const res = await fetch('https://api.spotify.com/v1/me/playlists', {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                });

                if (!res.ok) {
                    const body = await res.text();
                    throw new Error(`Spotify API error ${res.status}: ${body}`);
                }

                const data = await res.json();
                this.userPlaylists = (data.items || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    uri: item.uri,
                    tracks: item.tracks?.total || 0
                }));
            } catch (err) {
                throw new Error('Failed to fetch user playlists from Spotify: ' + err.message);
            }
        }
    }

    /**
     * selects a playlist and adds it to working playlists at the end
     * @param {Playlist} playlist
     * @returns void
     */
    selectPlaylist(playlist) {
        // Implementation to select a playlist
        this.workingPlaylists.push(playlist);
    }

    /**
     * deselects a playlist from working playlists
     * @param {Playlist} playlist
     * @returns void
     */
    deselectPlaylist(playlist) {
        // Implementation to deselect a playlist
        this.workingPlaylists = this.workingPlaylists.filter(pl => pl.id !== playlist.id);
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
     * @param {string} playlistName
     * @returns Promise<void>
     */    
    async savePlaylist(playlistName) {
        // Implementation to save playlist to supabase and spotify
        let body = {
            "name": playlistName,
            "description": "Playlist merged using Playlist Merger",
            "public": true
        }

        let playListId;

        try {
            const res = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                },
                body: JSON.stringify(body),
                method: 'POST'
            });

            if (!res.ok) {
                const body = await res.text();
                throw new Error(`Spotify API error ${res.status}: ${body}`);
            }

            const data = await res.json();
            playListId = data.id;

            // Now add tracks to the newly created playlist
            const trackUris = this.workingPlaylists.flatMap(pl => pl.trackUris || []);
            const chunkSize = 100; // Spotify API allows adding up to 100 tracks at a time

            for (let i = 0; i < trackUris.length; i += chunkSize) {
                const chunk = trackUris.slice(i, i + chunkSize);
                const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playListId}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    },
                    body: JSON.stringify({ uris: chunk }),
                    method: 'POST'
                })
                if (!addTracksRes.ok) {
                    const body = await addTracksRes.text();
                    throw new Error(`Spotify API error ${addTracksRes.status}: ${body}`);
                }
            };
        } catch (err) {
            throw new Error('Failed to create a playlist from Spotify: ' + err.message);
        }

        // Now save to Supabase
        try {
            const supaRes = await this.supabaseClient.client
                .from('playlists')
                .insert([{
                    playlist_id: playListId,
                    playlists: this.workingPlaylists.map(pl => pl.id),
                    created_at: new Date().toISOString(),
                    last_modified: new Date().toISOString()
                }]);
            if (supaRes.error) {
                throw new Error('Supabase error: ' + supaRes.error.message);
            }
        } catch (err) {
            throw new Error('Failed to save playlist to Supabase: ' + err.message);
        }
    }

    /**
     * replaces the tracks if the playlist already exists in spotify
     * @async
     * @param {string} playlistId
     */
    async replacePlaylistTracks(playlistId) {
        // Implementation to replace playlist tracks
        try {
            const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            });
            playlistData = await res.json();
            if (!res.ok) throw new Error('Playlist not found');

            //use the replace endpoint to clear the playlist before adding new tracks
            const replaceRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({ uris: [] }),
                method: 'PUT'
            });

            if (!replaceRes.ok) {
                const body = await replaceRes.text();
                throw new Error(`Spotify API error ${replaceRes.status}: ${body}`);
            }

            const trackUris = this.workingPlaylists.flatMap(pl => pl.trackUris || []);
            const chunkSize = 100; // Spotify API allows adding up to 100 tracks at a time

            for (let i = 0; i < trackUris.length; i += chunkSize) {
                const chunk = trackUris.slice(i, i + chunkSize);
                const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playListId}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    },
                    body: JSON.stringify({ uris: chunk }),
                    method: 'POST'
                })
                if (!addTracksRes.ok) {
                    const body = await addTracksRes.text();
                    throw new Error(`Spotify API error ${addTracksRes.status}: ${body}`);
                }
            };

        } catch (err) {
            console.error('Error checking existing playlist:', err);
            throw new Error('Failed to check existing playlist on Spotify: ' + err.message);
        }

        // Now update Supabase record
        try {
            const supaRes = await this.supabaseClient.client
                .from('playlists')
                .update({ playlists: this.workingPlaylists.map(pl => pl.id),
                    last_modified: new Date().toISOString()
                 })
                .eq('playlist_id', playlistId);

            if (supaRes.error) {
                throw new Error('Supabase error: ' + supaRes.error.message);
            }
        } catch (err) {
            throw new Error('Failed to update playlist in Supabase: ' + err.message);
        }

    }

    /**
     * move the playlist order of playlists in working playlists
     * @param {string} direction - 'left' or 'right'
     * @param {string} playlistId
     * @returns void
     */
    movePlaylist(direction, playlistId) {
        // Implementation to move playlist order
        const index = this.workingPlaylists.findIndex(pl => pl.id === playlistId);
        if (index === -1) return; // Playlist not found
        if (direction === 'left' && index > 0) {
            const [pl] = this.workingPlaylists.splice(index, 1);
            this.workingPlaylists.splice(index - 1, 0, pl);
        } else if (direction === 'right' && index < this.workingPlaylists.length - 1) {
            const [pl] = this.workingPlaylists.splice(index, 1);
            this.workingPlaylists.splice(index + 1, 0, pl);
        }
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