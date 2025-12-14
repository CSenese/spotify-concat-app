import User from "../classes/User.js";

const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
let user = new User(accessToken);

const SUPABASE_URL = `https://mkdcyzujpwiscipgnzxr.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = `sb_publishable_fK6Nj4AvtyaXIdIgb2zViA_tLF0TB_p`;

user.initSupabaseClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

const playlist = await user.loadUserPlaylists();

const playlistContainer = document.getElementById('playlist-container');
playlistContainer.innerHTML = '';

for (let pl of user.userPlaylists) {
  //create buttons for each playlist that use the User.selectPlaylist method when clicked and User.deselectPlaylist when clicked again
  const button = document.createElement('button');
  button.style = playlist-btn;
  button.innerText = `${pl.name} (${pl.tracks} tracks)`;
  let selected = false;

  button.addEventListener('click', () => {
    if (!selected) {
      user.selectPlaylist(pl);
      button.style = playlist-btn-selected;
      selected = true;
    } else {
      user.deselectPlaylist(pl);
      button.style = playlist-btn;
      selected = false;
    };
  });
}