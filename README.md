# Spotify New Music Playlist
Create a new Spotify playlist that adds new music added over the last year by artists you follow.

## Screenshot


## Prerequesites
1. Um, I think you just need node installed. That's it!

## Setup
1. Go to https://developer.spotify.com/dashboard and create a new app.
- Give it any name you'd like
- Set the Redirect URI to `http://localhost:8888/callback`
2. Grab the client ID and client secret that is generated
3. Duplicate the `env_example` file as `.env`, replacing the two settings with the ones generated from Spotify
4. Open a terminal and run `npm install` in the project directory to install necessary plugins

## Usage
1. Run `node index.js`
2. The script will generate a URL. Copy/paste/visit the URL in a browser, then close the window
3. The script will run, adding tracks to a newly-created playlist called "New Music"

Done!

## P.S.
Do you like experimental electronic music? Check the playlists on my profile: https://open.spotify.com/user/mvkel?si=8d23ffa89bb042af 😘

