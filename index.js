const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const moment = require('moment');
require('dotenv').config();


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:8888/callback'
});

const scopes = ['user-follow-read', 'playlist-modify-private', 'playlist-modify-public'];
const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

console.log('Please visit: ' + authorizeURL);

const app = express();

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send('Callback Error: ' + error);
    return;
  }

  spotifyApi.authorizationCodeGrant(code).then(data => {
    const access_token = data.body['access_token'];
    const refresh_token = data.body['refresh_token'];
    const expires_in = data.body['expires_in'];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    console.log('access_token:', access_token);
    console.log('refresh_token:', refresh_token);

    console.log(`Sucessfully retreived access token. Expires in ${expires_in} s.`);
    res.send('Success! You can now close the window.');

    // Get the artists the user follows
    spotifyApi.getFollowedArtists({ limit : 20 })
    .then(function(data) {
      let artistIds = data.body.artists.items.map(artist => artist.id);
      let oneMonthAgo = moment().subtract(365, 'days');

      // Get albums from each artist
      Promise.all(artistIds.map(id => spotifyApi.getArtistAlbums(id)))
        .then(albumData => {
          let albums = albumData.flatMap(data => data.body.items);
          let recentAlbums = albums.filter(album => moment(album.release_date) > oneMonthAgo);

          // Get tracks from each album
          Promise.all(recentAlbums.map(album => spotifyApi.getAlbumTracks(album.id)))
            .then(trackData => {
              let tracks = trackData.flatMap(data => data.body.items);
              console.log(tracks); // Add this line
              let trackUris = tracks.map(track => track.uri);

              // Create a new playlist and add the tracks to it
              console.log('About to create playlist'); // Add this line

              spotifyApi.createPlaylist(`New Music ${generateRandomString(4)}`, { 'description': 'New music in the last 30 days', 'public' : false })
                  .then(playlistData => {
                      if (!playlistData) {
                          console.log('Failed to create playlist.');
                          return;
                      }

                      let playlistId = playlistData.body.id;

                      setTimeout(() => {
                        if (trackUris.length > 0) {
                          // Loop through the trackUris array and log each track as it is added
                          trackUris.forEach((trackUri, index) => {
                            setTimeout(() => {
                              spotifyApi.addTracksToPlaylist(playlistId, [trackUri])
                                .then(function (data) {
                                  console.log(`Added track ${index + 1}/${trackUris.length} to playlist!`);
                                })
                                .catch(function (err) {
                                  console.log('Something went wrong when adding tracks!', err);
                                });
                            }, 200 * index); // Delay each iteration by 200ms multiplied by the index
                          });
                        }
                      }, 200);
                  })
                  .catch(err => {
                      console.log('Something went wrong when creating the playlist!', err);
                  });



            });
        });
    }, function(err) {
      console.log('Something went wrong!', err);
    });

  }).catch(error => {
    console.error('Error getting Tokens:', error);
    res.send('Error getting Tokens: ' + error);
  });
});

app.listen(8888, () => {
  console.log('HTTP server is listening on http://localhost:8888');
});
