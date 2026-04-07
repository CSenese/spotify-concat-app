
import { startPlayback } from './api-calls.js';

/**
 * Creates a manager for selected playlists UI
 * @param {User} user - User instance with workingPlaylists
 * @param {HTMLElement} container - Container element for playlist buttons
 * @returns {Object} Manager object with control methods
 */
export function createSelectedPlaylistManager(user, container = document.getElementById('selectedPlaylistsRow')) {
  function addSelectedPlaylist(pl) {
    if (container.querySelector(`[data-id="${pl.playlistId}"]`)) return;
    const wrap = document.createElement('div');
    wrap.dataset.id = pl.playlistId;
    wrap.className = 'saved-playlist-btn';
    const left = document.createElement('button'); left.textContent = '◀';
    const center = document.createElement('button'); center.textContent = pl.playlistName;
    const right = document.createElement('button'); right.textContent = '▶';
    const play = document.createElement('button'); play.textContent = '⏵'; play.title = 'Play playlist'; play.className = 'play-playlist-btn';
    left.addEventListener('click', () => moveLeft(pl.playlistId));
    center.addEventListener('click', () => removeSelectedPlaylist(pl.playlistId));
    right.addEventListener('click', () => moveRight(pl.playlistId));
    play.addEventListener('click', async () => {
      if (!user.accessToken) {
        alert('Playback requires a valid Spotify access token.');
        return;
      }
      try {
        await startPlayback(user.accessToken, pl.playlistId);
      } catch (err) {
        console.error('Failed to start playback:', err);
        alert('Unable to start playback. Check console for details.');
      }
    });
    wrap.append(left, center, right, play);
    container.appendChild(wrap);
  }

  function removeSelectedPlaylist(id) {
    const el = container.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
    // Find the playlist object and remove it from working playlists
    const playlist = user.workingPlaylists.find(pl => pl.playlistId === id);
    if (playlist) {
      user.deselectPlaylist(playlist);
    }
  }

  function moveLeft(id) {
    const el = container.querySelector(`[data-id="${id}"]`);
    const prev = el?.previousElementSibling;
    if (el && prev) container.insertBefore(el, prev);
    user.movePlaylist('left', id);
  }

  function moveRight(id) {
    const el = container.querySelector(`[data-id="${id}"]`);
    const next = el?.nextElementSibling;
    if (el && next) container.insertBefore(next, el);
    user.movePlaylist('right', id);
  }

  function syncFromModel() {
    container.innerHTML = '';
    (user.workingPlaylists || []).forEach(pl => addSelectedPlaylist(pl));
  }

  user.events?.addEventListener('workingPlaylistsChanged', syncFromModel);
  syncFromModel();

  return { addSelectedPlaylist, removeSelectedPlaylist, moveLeft, moveRight, syncFromModel };
}