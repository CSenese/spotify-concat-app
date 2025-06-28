import { generateCodeVerifier, generateCodeChallenge } from './pkce-authenticator.js';



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
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier in localStorage for later use
  sessionStorage.setItem('code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: '97462b80a7864533a23a82791a1f662f',
    scope: 'playlist-read-private playlist-modify-public playlist-modify-private',
    redirect_uri: 'https://spotify-concat-app.vercel.app/',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};


async function getAccessToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) return;

  const codeVerifier = sessionStorage.getItem('code_verifier');

  if (!codeVerifier) {
    console.error('Code verifier not found in localStorage.');  
    return;
  }

  const body = new URLSearchParams({
    client_id: '97462b80a7864533a23a82791a1f662f',
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://spotify-concat-app.vercel.app/',
    code_verifier: codeVerifier
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body
  });

  const data = await response.json();
  console.log('Response from token endpoint:', data);
  accessToken = data.access_token;
  if (!accessToken) {
    console.error('Failed to retrieve access token:', data);
    return;
  }

  console.log('Access Token:', data.access_token);
  storeAccessToken(data.access_token);
  updateUIForAuth();
}

getAccessToken();


window.onload = () => {
  updateUIForAuth(); // show/hide sections
};
