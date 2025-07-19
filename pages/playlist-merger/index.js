const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
const selectedPlaylists = new Set();
const allPlaylists = []; // stores all fetched playlists for later use
const finalPlaylist = []; // Stores all URIs to add to the merged playlist
var userId = null; // Will be set after fetching current user ID

async function getCurrentUserId() {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch current user ID');
  }
  const data = await res.json();
  return data.id;
}

async function initializeUserId() {
  try {
    userId = await getCurrentUserId();
    console.log('User ID:', userId);
    // Continue to whatever needs userId here
  } catch (error) {
    console.error('Error fetching user ID:', error);
    document.getElementById('playlist-container').innerText =
      'Error fetching user ID. Please check your access token.';
  }
}

async function renderSavedPlaylistButtons(accessToken) {
  const container = document.getElementById('savedPlaylistButtons');
  container.innerHTML = ''; // Clear previous content

  console.log("Rendering saved playlist buttons...", userId);

  // Step 1: Fetch saved playlists from Supabase
  const { data: savedRows, error: supabaseError } = await supabase
    .from('playlists')
    .select('playlist_id, playlists')
    .eq('user_id', userId);

  if (supabaseError) {
    console.error("Failed to fetch saved playlists:", supabaseError);
    return;
  }

  console.log("Fetched saved playlists:", savedRows);

  const savedPlaylists = {};
  for (const row of savedRows) {
    savedPlaylists[row.playlist_id] = row.playlists;
  }

  // Step 2: Fetch user's playlists from Spotify
  const userPlaylists = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then(res => res.json());

  if (!userPlaylists.items) {
    console.error("Failed to load user playlists:", userPlaylists);
    return;
  }

  console.log("Fetched user playlists:", userPlaylists.items);

  // Step 3: Create buttons for matching playlists
  userPlaylists.items.forEach(playlist => {
    const playlistId = playlist.id;

    if (savedPlaylists[playlistId]) {
      console.log(`Found saved playlist: ${playlist.name} (${playlistId})`);
      const button = document.createElement('button');
      button.textContent = `Load "${playlist.name}"`;
      button.classList.add('saved-playlist-btn');
      button.onclick = () => {
        selectedPlaylists.clear();
        savedPlaylists[playlistId].forEach(id => selectedPlaylists.add(id));
        alert(`Loaded ${savedPlaylists[playlistId].length} playlists from "${playlist.name}"`);
      };
      container.appendChild(button);
    }
  });
}

// Call it after confirming accessToken is available
if (accessToken) {
  initializeUserId().then(() => {
    if (userId) {
      renderSavedPlaylistButtons(accessToken);
    }
  });
}


const SUPABASE_URL = `https://mkdcyzujpwiscipgnzxr.supabase.co`;
const SUPABASE_ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZGN5enVqcHdpc2NpcGduenhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzQxNjUsImV4cCI6MjA2NzA1MDE2NX0.yOLXo2imObFyDZlYjhdF55xiINKpYR9QwjsT1mgbPx4`;

console.log('Access Token:', accessToken); // Debugging line to check if the token is retrieved

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (!accessToken) {
    document.getElementById('playlist-container').innerText = 'No access token found.';
} else {
    fetch(`https://api.spotify.com/v1/me/playlists`, {
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
    })
    .then(res => res.json())
    .then(data => {
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';

    data.items.forEach(playlist => {
        allPlaylists.push(playlist); // Store the playlist for later use
        const btn = document.createElement('button');
        btn.className = 'playlist-btn';
        btn.innerText = playlist.name;

        btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        if (selectedPlaylists.has(playlist.id)) {
            selectedPlaylists.delete(playlist.id);
            removePlaylistBox(playlist.id);
        } else {
            selectedPlaylists.add(playlist.id);
            addPlaylistBox(playlist);
        }

         // Refresh unselected list if checkbox is active
        if (document.getElementById('includeTracks').checked) {
            showUnselectedPlaylists();
        }

        console.log(Array.from(selectedPlaylists)); // Optional: for debugging
        });

        container.appendChild(btn);
    });
    })
    .catch(err => {
    document.getElementById('playlist-container').innerText = 'Error loading playlists.';
    console.error(err);
    });
}


document.getElementById('searchFriend').addEventListener('click', async () => {
  const friendUserId = document.getElementById('friendUserId').value.trim();

  if (!friendUserId) {
    alert('Please enter a Spotify username');
    return;
  }

  const friendDiv = document.getElementById('friendPlaylists');
  friendDiv.innerHTML = 'Loading...';

  try {
    const res = await fetch(`https://api.spotify.com/v1/users/${friendUserId}/playlists`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await res.json();

    if (!res.ok || !data.items) {
      friendDiv.innerHTML = `<p>Error: ${data.error?.message || 'Unable to fetch playlists'}</p>`;
      return;
    }

    friendDiv.innerHTML = `<h3>${friendUserId}'s Public Playlists</h3>`;

    data.items.forEach(playlist => {
      const btn = document.createElement('button');
      btn.className = 'playlist-btn';
      btn.textContent = playlist.name;
      btn.onclick = () => {
        alert(`You selected: ${playlist.name}\nID: ${playlist.id}`);
        // You can add it to your merge list here
      };
      friendDiv.appendChild(btn);
    });

  } catch (err) {
    console.error(err);
    friendDiv.innerHTML = '<p>Failed to load friend playlists.</p>';
  }
});


const row = document.getElementById('selectedPlaylistsRow');

function addPlaylistBox(playlist) {
  const box = document.createElement('div');
  box.className = 'selected-playlist-box';
  box.dataset.playlistId = playlist.id;
  box.textContent = playlist.name;
  row.appendChild(box);
}

function removePlaylistBox(playlistId) {
  const box = row.querySelector(`[data-playlist-id="${playlistId}"]`);
  if (box) box.remove();
}

async function createNewPlaylist(name) {
    const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            name: name,
        })
    }); 
    if (!res.ok) {
        const errorData = await res.json();     
        throw new Error(`Failed to create playlist: ${errorData.error.message}`);
    }
    const data = await res.json();
    return data.id; // Return the new playlist ID
} 

async function addPlaylistTracksToFinal(playlistId) {
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  let allUris = [];

  try {
    while (url) {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(`Failed to fetch tracks for playlist ${playlistId}:`, data.error);
        break;
      }

      const uris = data.items
        .map(item => item.track?.uri)
        .filter(uri => !!uri); // filter out nulls

      allUris = allUris.concat(uris);
      url = data.next; // Spotify paginates 100 tracks at a time
    }

    finalPlaylist.push(...allUris); // Add to the global array
    console.log(`Added ${allUris.length} tracks from playlist ${playlistId}`);
  } catch (err) {
    console.error('Error fetching tracks:', err);
  }
}

async function addTracksToPlaylist(playlistId, tracks) {
    const chunkSize = 100; // Spotify API allows max 100 tracks per request
    for (let i = 0; i < tracks.length; i += chunkSize) {
        const chunk = tracks.slice(i, i + chunkSize);
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ uris: chunk })
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Failed to add tracks: ${errorData.error.message}`);
        }
        console.log(`Added ${chunk.length} tracks to playlist ${playlistId}`);
    }
}


document.getElementById('mergePlaylists').addEventListener('click', async () => {
  if (selectedPlaylists.size === 0) {
    alert('Please select at least one playlist to merge.');
    return;
  }

  const playlistNameInput = document.getElementById('playlistName');
  const playlistName = playlistNameInput.value.trim();

  if (!playlistName) {
    alert('Please enter a name for your new playlist.');
    return;
  }

  document.getElementById('mergePlaylists').disabled = true;

  try {

    let newPlaylistId = null;

    if (document.getElementById('includeTracks').checked) {
      //get the selected playlist id from the allPlaylists array
      const selectedPlaylist = allPlaylists.find(p => p.name === playlistName);
      if (selectedPlaylist) {
        newPlaylistId = selectedPlaylist.id;
        console.log(`Using existing playlist: ${newPlaylistId}`);
      }
    } else {
      newPlaylistId = await createNewPlaylist(playlistName);
      console.log(`Created new playlist: ${newPlaylistId}`);
    }

    // Step 2: Gather all tracks
    finalPlaylist.length = 0;

    for (const playlistId of selectedPlaylists) {
      await addPlaylistTracksToFinal(playlistId);
    }

    if (finalPlaylist.length === 0) {
      alert('No tracks were found in the selected playlists.');
      return;
    }

    // Step 3: Add tracks to new playlist
    await addTracksToPlaylist(newPlaylistId, finalPlaylist);

    alert(`Playlist "${playlistName}" created and populated successfully!`);

    storePlaylist(Array.from(selectedPlaylists), newPlaylistId);
  } catch (err) {
    console.error('Error merging playlists:', err);
    alert('Something went wrong while merging or saving playlists.');
  } finally {
    document.getElementById('mergePlaylists').disabled = false;
  }
});



function showUnselectedPlaylists() {
  const container = document.getElementById('replaceablePlaylists');
  container.innerHTML = ''; // Clear previous buttons

  const unselected = allPlaylists.filter(p => !selectedPlaylists.has(p.id));
  const playlistNameInput = document.getElementById('playlistName');

  unselected.forEach(playlist => {
    const btn = document.createElement('button');
    btn.className = 'playlist-btn';
    btn.textContent = playlist.name;

    btn.addEventListener('click', () => {
      // Set input value and disable it
      playlistNameInput.value = playlist.name;
      playlistNameInput.disabled = true;

      // Highlight selected button visually
      const allBtns = container.querySelectorAll('.playlist-btn');
      allBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });

    container.appendChild(btn);
  });
}


document.getElementById('includeTracks').addEventListener('change', (e) => {
  const playlistNameInput = document.getElementById('playlistName');
  const replaceableContainer = document.getElementById('replaceablePlaylists');

  if (e.target.checked) {
    showUnselectedPlaylists();
  } else {
    replaceableContainer.innerHTML = '';
    playlistNameInput.disabled = false; // 🔥 Re-enable the input
    playlistNameInput.value = '';       // (Optional) clear it
  }
});



document.getElementById('playlistName').addEventListener('focus', () => {
  if (document.getElementById('playlistName').disabled) return;

  // Optional: Clear selected highlight from unselected buttons
  const buttons = document.querySelectorAll('#selectedPlaylists .playlist-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
});

// Add new playlist
/**
 * Stores a list of playlist IDs under a playlist ID.
 * @param {string} playlistId - Spotify main playlist ID
 * @param {string[]} playlistList - List of playlist IDs
 */
async function storePlaylist(playlistList, playlistId) {
  const { data, error: fetchError } = await supabase
    .from('playlists')
    .select('playlist_id')
    .eq('playlist_id', playlistId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing playlist:', fetchError);
    return;
  }

  const payload = {
    user_id: userId,
    playlist_id: playlistId,
    playlists: playlistList,
    last_modified: new Date().toISOString()
  };

  let result;
  if (data) {
    // Record exists, update it
    result = await supabase
      .from('playlists')
      .update(payload)
      .eq('playlist_id', playlistId)
      .eq('user_id', userId);
  } else {
    // Insert new record
    result = await supabase
      .from('playlists')
      .insert(payload);
  }

  const { error } = result;
  if (error) {
    console.error('Error saving playlist:', error);
  } else {
    console.log('Playlist saved successfully!');
  }
}
