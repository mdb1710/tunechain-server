'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const {CLIENT_ORIGIN} = require('./config');
const request = require('request');
const {API_BASE_URL} = require('./config');

const app = express();
const jsonParser = express.json();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
app.use(helmet());

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});





function handleGetPlaylists(req, res){
  
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;

  const { artist, mood, genre } = req.params;
  
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      // use the access token to access the Spotify Web API
      let token = body.access_token;
      let moodSearch = req.query.mood;
      let options = {
        url: `https://api.spotify.com/v1/search?q=${moodSearch}&type=playlist`,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        
        let playlists = body.playlists.items.map(song => {
          return {
            id: song.id,
            name: song.name,
            href: song.href,
            tracks: song.tracks,
            uri: song.uri
          };
        });
        res
          .status(200)
          .json(playlists);

      });
      
    }
  });
}

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// app.get('/refresh_token', function(req, res) {

//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });

app.get('/api/search', handleGetPlaylists); 

app.get('/api/results', (req, res, next) => {
  res.send('Search is over');
});

module.exports = app;