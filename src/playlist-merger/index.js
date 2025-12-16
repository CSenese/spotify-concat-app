import Playlist from "../classes/Playlist.js";
import User from "../classes/User.js";
import { createSelectedPlaylistManager } from '../functions/selectedPlaylistManager.js';

// Loading indicator functions
function showLoading(message = 'Loading...') {
  const indicator = document.getElementById('loadingIndicator');
  indicator.textContent = message;
  indicator.style.display = 'block';
}

function hideLoading() {
  document.getElementById('loadingIndicator').style.display = 'none';
}

const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
let user = new User(accessToken);

const SUPABASE_URL = `https://mkdcyzujpwiscipgnzxr.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = `sb_publishable_fK6Nj4AvtyaXIdIgb2zViA_tLF0TB_p`;

user.initSupabaseClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

showLoading('Loading your playlists...');
try {
  await user.loadUserPlaylists();
} catch (err) {
  console.error('Error loading user playlists:', err);
  alert('Failed to load user playlists. Please check the console for details.');
} finally {
  hideLoading();
}

const playlistContainer = document.getElementById('playlist-container');
playlistContainer.innerHTML = '';

console.log('User playlists to display:', user.userPlaylists);

const manager = createSelectedPlaylistManager(user);

// Helper function to create a playlist button with click handling
function createPlaylistButton(pl, options = {}) {
  const { 
    isSelected = false, 
    container = null 
  } = options;
  
  const button = document.createElement('button');
  button.className = 'playlist-btn';
  if (isSelected) button.classList.add('selected');
  button.dataset.id = pl.playlistId;
  button.innerText = `${pl.playlistName} (${pl.tracks} tracks)`;

  button.addEventListener('click', () => {
    const selected = button.classList.contains('selected');
    if (!selected) {
      user.selectPlaylist(pl);
      manager.addSelectedPlaylist(pl);
      button.classList.add('selected');
      updateReplaceablePlaylistsList();
    } else {
      user.deselectPlaylist(pl);
      manager.removeSelectedPlaylist(pl.playlistId);
      button.classList.remove('selected');
      updateReplaceablePlaylistsList();
    }
  });

  if (container) {
    container.appendChild(button);
  }
  
  return button;
}

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
  createPlaylistButton(pl, { container: playlistContainer });
}

document.getElementById('mergePlaylists').addEventListener('click', async () => {
  const playlistName = document.getElementById('playlistName').value || 'A playlist merged using Spotify Playlist Merger App';
  const isReplace = document.getElementById('includeTracks').checked;
  
  if (isReplace) {
    const existingPlaylist = user.userPlaylists.find(p => p.playlistName === playlistName);
    if (!existingPlaylist) {
      alert('Playlist not found. Please select an existing playlist to replace.');
      return;
    }
  }
  
  showLoading(isReplace ? 'Replacing playlist tracks...' : 'Creating merged playlist...');
  try {
    if (isReplace) {
      const existingPlaylist = user.userPlaylists.find(p => p.playlistName === playlistName);
      await user.replacePlaylistTracks(existingPlaylist.playlistId);
      alert(`Playlist "${playlistName}" tracks replaced successfully!`);
    } else {
      await user.savePlaylist(playlistName); 
      alert(`New playlist "${playlistName}" created successfully!`);
    }
  } catch (err) {
    console.error('Error merging playlists:', err);
    alert('Failed to merge playlists. Please check the console for details.');
  } finally {
    hideLoading();
  }
  }
);


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
  if (!friendId) {
    alert('Please enter a Spotify username');
    return;
  }
  
  showLoading('Loading friend\'s playlists...');
  try {
    const friendPlaylists = await user.getFriendPublicPlaylists(friendId);
    const friendContainer = document.getElementById('friendPlaylists');
    friendContainer.innerHTML = '';
    friendPlaylists.forEach(pl => {
      createPlaylistButton(pl, { container: friendContainer });
    });
  } catch (err) {
    console.error('Error loading friend playlists:', err);
    alert('Failed to load friend playlists. Please check the console for details.');
  } finally {
    hideLoading();
  }
});


showLoading('Loading saved playlists...');
user.loadSupaPlaylists().then(() => {
  document.getElementById('savedPlaylistButtons').innerHTML = '';
  user.supaPlaylists.forEach(pl => {
    const button = document.createElement('button');
    button.className = 'playlist-btn';
    button.innerText = `${pl.playlistName} (${pl.tracks} tracks)`;
    button.addEventListener('click', async () => {
      const isCurrentlyLoaded = button.classList.contains('selected');
      
      if (isCurrentlyLoaded) {
        // Unload the saved playlist configuration
        user.workingPlaylists = [];
        manager.syncFromModel();
        document.querySelectorAll('.playlist-btn.selected').forEach(btn => {
          btn.classList.remove('selected');
        });
        button.classList.remove('selected');
        
        // Uncheck replace mode and clear playlist name
        document.getElementById('includeTracks').checked = false;
        document.getElementById('playlistName').value = '';
        document.getElementById('playlistName').disabled = false;
        document.getElementById('replaceablePlaylists').innerHTML = '';
        return;
      }
      
      showLoading('Loading playlist configuration...');
      try {
        // Load the source playlists that made up this merged playlist
        const retrievedPlaylists = await user.loadWorkingPlaylistsFromSupa(pl.playlistId);
        
        // Clear current working playlists and buttons
        user.workingPlaylists = [];
        manager.syncFromModel();
        document.querySelectorAll('.playlist-btn.selected').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Set replace mode and populate playlist name
        document.getElementById('includeTracks').checked = true;
        document.getElementById('playlistName').value = pl.playlistName;
        document.getElementById('playlistName').disabled = true;
        updateReplaceablePlaylistsList();
        
        // Add each retrieved playlist to working playlists
        for (let rpl of retrievedPlaylists) {
          user.selectPlaylist(rpl);
          manager.addSelectedPlaylist(rpl);
          
          // Try to find and select the button in userPlaylists container
          const userButton = document.querySelector(`#playlist-container .playlist-btn[data-id="${rpl.playlistId}"]`);
          if (userButton) {
            userButton.classList.add('selected');
          } else {
            // Playlist not in user's playlists, check if button already exists in friend area
            const friendContainer = document.getElementById('friendPlaylists');
            const existingButton = friendContainer.querySelector(`.playlist-btn[data-id="${rpl.playlistId}"]`);
            if (!existingButton) {
              createPlaylistButton(rpl, { isSelected: true, container: friendContainer });
            } else {
              existingButton.classList.add('selected');
            }
          }
        }
        updateReplaceablePlaylistsList();
        button.classList.add('selected');
      } catch (err) {
        console.error('Error loading playlist configuration:', err);
        alert('Failed to load playlist configuration.');
      } finally {
        hideLoading();
      }
    });
    document.getElementById('savedPlaylistButtons').appendChild(button);
  });
}).catch(err => {
  console.error('Error loading Supabase playlists:', err);
}).finally(() => {
  hideLoading();
});