export async function getUserPlaylists(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch playlists: ${response.statusText}`);
  }

  const data = await response.json();
    console.log('Fetched playlists:', data);
  return data.items; // Array of playlist objects
}

export async function getCurrentUserId(accessToken) {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch current user ID');
  }
  const data = await res.json();
  return data.id;
}