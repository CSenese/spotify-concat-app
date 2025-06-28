const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
const selectedPlaylists = new Set();
const allPlaylists = []; // stores all fetched playlists for later use
const finalPlaylist = []; // Stores all URIs to add to the merged playlist


console.log('Access Token:', accessToken); // Debugging line to check if the token is retrieved

if (!accessToken) {
    document.getElementById('playlist-container').innerText = 'No access token found.';
} else {
    fetch('https://api.spotify.com/v1/me/playlists', {
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
  const userId = document.getElementById('friendUserId').value.trim();

  if (!userId) {
    alert('Please enter a Spotify username');
    return;
  }

  const friendDiv = document.getElementById('friendPlaylists');
  friendDiv.innerHTML = 'Loading...';

  try {
    const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await res.json();

    if (!res.ok || !data.items) {
      friendDiv.innerHTML = `<p>Error: ${data.error?.message || 'Unable to fetch playlists'}</p>`;
      return;
    }

    friendDiv.innerHTML = `<h3>${userId}'s Public Playlists</h3>`;

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

async function getCurrentUserId() {
    const res = await fetch('https://api.spotify.com/v1/me', {  
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch current user ID');
    }
    const data = await res.json();  
    return data.id; // Return the current user's ID
}

async function createNewPlaylist(userId, name) {
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
    const userId = await getCurrentUserId();

    // Step 1: Create new playlist
    const newPlaylistId = await createNewPlaylist(userId, playlistName);
    console.log(`Created new playlist: ${newPlaylistId}`);

    // Step 2: Gather all tracks
    finalPlaylist.length = 0; // clear any previous data

    for (const playlistId of selectedPlaylists) {
      await addPlaylistTracksToFinal(playlistId);
    }

    if (finalPlaylist.length === 0) {
      alert('No tracks were found in the selected playlists.');
      return;
    }

    // Step 3: Add all tracks to the new playlist (in chunks of 100)
    await addTracksToPlaylist(newPlaylistId, finalPlaylist);

    alert(`Playlist "${playlistName}" created and populated successfully!`);
  } catch (err) {
    console.error('Error merging playlists:', err);
    alert('Something went wrong while merging playlists.');
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
