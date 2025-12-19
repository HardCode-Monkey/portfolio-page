/* 
  ===============
  Spotify API Module
  ===============
*/

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const SPOTIFY_TOKEN = 'BQAssocf8wPhDVfLYHRCBrqyxLgLwkn_zx3qIuW2Pn07_FAx_rQruPJRv7wDgDl3K7Yjtja_6A2wpXlDozxR6xYzvdnDP2IIEubqk1zcdqnnNBG-DDhU4Bj6PozBBSnYGBS7vIrpTpt5DDeQAviRKpL3uqZZEfDVdhzabFYW148Ae805CPyGDbZONQ51VRgve9Oav8yzj1U5yUx9HBZv9kDdK_aOqwzCxbwW95Q1XwHvExqxiFlL05cGyGs2QsadL2B3y2rEb84X8EL2maMSCQMI6Ljw92Cg_wVePZMJubhwJJiv';

const TRACKS_URI = [
  'spotify:track:4gD1qMyIjDyz7Te8nlQEji',
  'spotify:track:51EpFns3CG9taCMQz6XDom',
  'spotify:track:1eMUGMEWrvTXYWrPobq2dH',
  'spotify:track:6TkeafUCCwwZWiTsEIFZFf',
  'spotify:track:0TZmEWmZTyF74bgEK6R84c'
];

/**
 * Generic fetch wrapper for Spotify API calls
 * @param {string} endpoint - API endpoint (e.g., 'v1/me')
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request body (optional)
 * @returns {Promise<object>} API response as JSON
 */
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${SPOTIFY_TOKEN}`,
    },
    method,
    body: JSON.stringify(body)
  });
  return await res.json();
}

/**
 * Creates a Spotify playlist with predefined tracks
 * @param {array} tracksUri - Array of Spotify track URIs
 * @returns {Promise<object>} Created playlist object
 */
async function createPlaylist(tracksUri) {
  const { id: user_id } = await fetchWebApi('v1/me', 'GET');

  const playlist = await fetchWebApi(
    `v1/users/${user_id}/playlists`, 'POST', {
      "name": "My top tracks playlist",
      "description": "Playlist created by the tutorial on developer.spotify.com",
      "public": false
    }
  );

  await fetchWebApi(
    `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
    'POST'
  );

  return playlist;
}

// Initialize playlist creation
(async () => {
  try {
    const createdPlaylist = await createPlaylist(TRACKS_URI);
    console.log('Playlist created:', createdPlaylist.name, createdPlaylist.id);
  } catch (error) {
    console.error('Error creating playlist:', error);
  }
})();
