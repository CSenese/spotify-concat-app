import Playlist from "../classes/Playlist.js";
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

// Add clear button functionality
document.getElementById('clearWorkingPlaylists').addEventListener('click', () => {
  user.workingPlaylists = [];
  manager.syncFromModel();
  // Deselect all playlist buttons
  document.querySelectorAll('.playlist-btn.selected').forEach(btn => {
    btn.classList.remove('selected');
  });
  updateReplaceablePlaylistsList();
});

for (let pl of user.userPlaylists) {
  //create buttons for each playlist that use the User.selectPlaylist method when clicked and User.deselectPlaylist when clicked again
  const button = document.createElement('button');
  button.className = 'playlist-btn';
  button.innerText = `${pl.playlistName} (${pl.tracks} tracks)`;

  button.addEventListener('click', () => {
    const isSelected = button.classList.contains('selected');
    if (!isSelected) {
      user.selectPlaylist(pl);
      manager.addSelectedPlaylist(pl);
      button.classList.add('selected');
      updateReplaceablePlaylistsList();
    } else {
      user.deselectPlaylist(pl);
      manager.removeSelectedPlaylist(pl.playlistId);
      button.classList.remove('selected');
      updateReplaceablePlaylistsList();
    };
  });

  playlistContainer.appendChild(button);
}

document.getElementById('mergePlaylists').addEventListener('click', async () => {
  try {
    const playlistName = document.getElementById('playlistName').value || 'A playlist merged using Spotify Playlist Merger App';
    const isReplace = document.getElementById('includeTracks').checked;
    
    if (isReplace) {
      const existingPlaylist = user.userPlaylists.find(p => p.playlistName === playlistName);
      if (!existingPlaylist) {
        alert('Playlist not found. Please select an existing playlist to replace.');
        return;
      }
      await user.replacePlaylistTracks(existingPlaylist.playlistId);
      alert(`Playlist "${playlistName}" tracks replaced successfully!`);
    } else {
      await user.savePlaylist(playlistName); 
      alert(`New playlist "${playlistName}" created successfully!`);
    }
  } catch (err) {
    console.error('Error merging playlists:', err);
    alert('Failed to merge playlists. Please check the console for details.');
  }
});


document.getElementById('includeTracks').addEventListener('change', (e) => {
  updateReplaceablePlaylistsList();
  if (e.target.checked) {
    document.getElementById('playlistName').disabled = true;
  } else {
    document.getElementById('playlistName').disabled = false;
    document.getElementById('replaceablePlaylists').innerHTML = '';
  }
});

// Function to update the replaceable playlists list
function updateReplaceablePlaylistsList() {
  const isReplaceMode = document.getElementById('includeTracks').checked;
  if (!isReplaceMode) return;
  
  // Filter out playlists that are in workingPlaylists
  const workingIds = user.workingPlaylists.map(pl => pl.playlistId);
  const replaceablePlaylists = user.userPlaylists.filter(pl => !workingIds.includes(pl.playlistId));

  document.getElementById('replaceablePlaylists').innerHTML = '';
  replaceablePlaylists.forEach(pl => {
    const option = document.createElement('button');
    option.value = pl.playlistId;
    option.textContent = pl.playlistName;
    option.addEventListener('click', () => {
      document.getElementById('playlistName').value = pl.playlistName;
    });
    document.getElementById('replaceablePlaylists').appendChild(option);
  });
}


document.getElementById('searchFriend').addEventListener('click', async () => {
  const friendId = document.getElementById('friendUserId').value;
  try {
    const friendPlaylists = await user.getFriendPublicPlaylists(friendId);
    const friendContainer = document.getElementById('friendPlaylists');
    friendContainer.innerHTML = '';
    friendPlaylists.forEach(pl => {
      const button = document.createElement('button');
      button.className = 'playlist-btn';
      button.innerText = `${pl.playlistName} (${pl.tracks} tracks)`;
      button.addEventListener('click', () => {
        const isSelected = button.classList.contains('selected');
        if (!isSelected) {
          user.selectPlaylist(pl);
          manager.addSelectedPlaylist(pl);
          button.classList.add('selected');
          updateReplaceablePlaylistsList();
        } else {
          user.deselectPlaylist(pl);
          manager.removeSelectedPlaylist(pl.playlistId);
          button.classList.remove('selected');
          updateReplaceablePlaylistsList();
        };
      });
      friendContainer.appendChild(button);
    });
  } catch (err) {
    console.error('Error loading friend playlists:', err);
    alert('Failed to load friend playlists. Please check the console for details.');
  } 
});