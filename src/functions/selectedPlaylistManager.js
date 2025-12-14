export function createSelectedPlaylistManager(user, container = document.getElementById('selectedPlaylistsRow')) {
  function addSelectedPlaylist(pl) {
    if (container.querySelector(`[data-id="${pl.id}"]`)) return;
    const wrap = document.createElement('div');
    wrap.dataset.id = pl.id;
    wrap.className = 'saved-playlist-btn';
    const left = document.createElement('button'); left.textContent = '◀';
    const center = document.createElement('button'); center.textContent = pl.name;
    const right = document.createElement('button'); right.textContent = '▶';
    left.addEventListener('click', () => moveLeft(pl.id));
    center.addEventListener('click', () => removeSelectedPlaylist(pl.id));
    right.addEventListener('click', () => moveRight(pl.id));
    wrap.append(left, center, right);
    container.appendChild(wrap);
  }

  function removeSelectedPlaylist(id) {
    const el = container.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
    user.deselectPlaylist(id);
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