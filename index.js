
function updateUIForAuth() {
  const loginBtn = document.getElementById('login');
  const loggedInSection = document.getElementById('loggedIn');
  
  if (accessToken) {
    loginBtn.style.display = 'none';
    loggedInSection.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    loggedInSection.style.display = 'none';
  }
}

let accessToken = sessionStorage.getItem('access_token') || null;

function storeAccessToken(token) {
  console.log('Storing access token:', token);
  accessToken = token;
  sessionStorage.setItem('access_token', token);
}

if (accessToken) {
  // If access token is already available, update the UI
  updateUIForAuth();
}

document.getElementById('login').onclick = async () => {
  console.log('Login button clicked - redirecting to Spotify authorization');
  

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: '97462b80a7864533a23a82791a1f662f',
    scope: 'playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative user-modify-playback-state user-read-playback-state',
    redirect_uri: 'https://young-pseudoeducational-mayola.ngrok-free.dev/',
    show_dialog: 'true'
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log('Redirecting to:', authUrl);
  window.location.href = authUrl;
};

document.getElementById('clearSession').onclick = () => {
  sessionStorage.clear();
  accessToken = null;
  updateUIForAuth();
  alert('Session cleared! You can now log in again.');
};


async function getAccessToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  console.log('Checking for authorization code in URL:', code ? 'Found' : 'Not found');

  if (!code) return;

  console.log('Authorization code received, exchanging for token...');

  const body = new URLSearchParams({
    client_id: '97462b80a7864533a23a82791a1f662f',
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://young-pseudoeducational-mayola.ngrok-free.dev/',
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa('97462b80a7864533a23a82791a1f662f' + ':' + 'a134b70178794cb18304fb8467cdfb95'),
    },
    body: body
  });

  const data = await response.json();
  console.log('Token exchange response:', data);
  
  if (!data.access_token) {
    console.error('Failed to retrieve access token:', data);
    return;
  }

  console.log('Access Token obtained successfully');
  storeAccessToken(data.access_token);
  updateUIForAuth();
}

getAccessToken();