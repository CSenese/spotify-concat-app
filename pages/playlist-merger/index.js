const accessToken = sessionStorage.getItem('spotifyAccessToken'); // or manually paste one for testing

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

    const selectedPlaylists = new Set();

    data.items.forEach(playlist => {
        const btn = document.createElement('button');
        btn.className = 'playlist-btn';
        btn.innerText = playlist.name;

        btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        if (selectedPlaylists.has(playlist.id)) {
            selectedPlaylists.delete(playlist.id);
        } else {
            selectedPlaylists.add(playlist.id);
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