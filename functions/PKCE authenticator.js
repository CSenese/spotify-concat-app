function generateCodeVerifier(length = 128) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

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
