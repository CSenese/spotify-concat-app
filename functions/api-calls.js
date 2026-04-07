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

export async function getAvailableDevices(accessToken) {
  const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch devices: ${res.status} ${res.statusText} - ${errorText}`);
  }

  const data = await res.json();
  console.log('Available devices:', data.devices);
  return data.devices;
}

export async function startPlayback(accessToken, playlistId) {
  console.log('Starting playback with playlist ID:', playlistId);
  console.log('Access token provided:', accessToken ? 'Yes' : 'No');
  
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  const devices = await getAvailableDevices(accessToken);
  if (devices.length === 0) {
    alert('No active Spotify devices found. Please open Spotify on one of your devices and try again.');
    return;
  }

  const deviceId = devices[0].id;
  console.log('Using device ID:', deviceId, 'for device:', devices[0].name);

  const requestBody = {
    context_uri: `spotify:playlist:${playlistId}`,
    position_ms: 0
  };
  
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Playback API error response:', errorText);
    throw new Error(`Failed to start playback: ${response.status} ${response.statusText} - ${errorText}`);
  }
}