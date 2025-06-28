const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
const selectedPlaylists = new Set();
const allPlaylists = []; // stores all fetched playlists for later use


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


document.getElementById('mergePlaylists').addEventListener('click', () => {
  if (selectedPlaylists.size === 0) {
    alert('Please select at least one playlist to merge.');
    return;
  }

  console.log('Selected Playlists:', Array.from(selectedPlaylists));
});

function showUnselectedPlaylists() {
  const container = document.getElementById('replaceablePlaylists');
  container.innerHTML = ''; // Clear previous list

  const unselected = allPlaylists.filter(p => !selectedPlaylists.has(p.id));

  unselected.forEach(playlist => {
    const div = document.createElement('div');
    div.textContent = playlist.name;
    div.style.padding = '5px 0';
    container.appendChild(div);
  });
}

document.getElementById('includeTracks').addEventListener('change', (e) => {
  if (e.target.checked) {
    showUnselectedPlaylists();
  } else {
    document.getElementById('replaceablePlaylists').innerHTML = '';
  }
});

