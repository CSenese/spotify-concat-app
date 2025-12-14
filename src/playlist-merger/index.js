import User from "../classes/User.js";
import { createSelectedPlaylistManager } from '../functions/selectedPlaylistManager.js';

const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
let user = new User(accessToken);

const SUPABASE_URL = `https://mkdcyzujpwiscipgnzxr.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = `sb_publishable_fK6Nj4AvtyaXIdIgb2zViA_tLF0TB_p`;

user.initSupabaseClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

try {
  await user.loadUserPlaylists();
} catch (err) {
  console.error('Error loading user playlists:', err);
  alert('Failed to load user playlists. Please check the console for details.');
}

const playlistContainer = document.getElementById('playlist-container');
playlistContainer.innerHTML = '';

console.log('User playlists to display:', user.userPlaylists);

const manager = createSelectedPlaylistManager(user);

for (let pl of user.userPlaylists) {
  //create buttons for each playlist that use the User.selectPlaylist method when clicked and User.deselectPlaylist when clicked again
  const button = document.createElement('button');
  button.className = 'playlist-btn';
  button.innerText = `${pl.name} (${pl.tracks} tracks)`;
  let selected = false;

  button.addEventListener('click', () => {
    if (!selected) {
      user.selectPlaylist(pl);
      manager.addSelectedPlaylist(pl);
      button.classList.add('selected');
      selected = true;
    } else {
      user.deselectPlaylist(pl);
      manager.removeSelectedPlaylist(pl.id);
      button.classList.remove('selected');
      selected = false;
    };
  });

  playlistContainer.appendChild(button);
}

