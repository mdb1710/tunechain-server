'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const {CLIENT_ORIGIN} = require('./config');
const request = require('request');
const authRouter = require('./auth/auth-router');


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
app.use('/api/auth', authRouter);

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
      let genreSearch = req.query.genre;
      
      let options = {
        url: `https://api.spotify.com/v1/search?q=${moodSearch}+${genreSearch}&type=playlist`,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          let playlistLink = body.playlists.href;
          
          let playlists = body.playlists.items.map(song => {
            
            return {
              id: song.id,
              name: song.name,
              external_urls: song.external_urls.spotify,
              href: song.href,
              tracks: song.tracks,
              uri: song.uri,
              images: song.images
            };
          });
          res.json(playlists).end();
          
        }
      
      });
    
    }
  });
  
}

// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// function handleAuth (req, res, next) {
//   let username = req.query.username;
//   let password = req.query.password;
//   let loginOptions = {
//     url: `${CLIENT_ORIGIN}/api/login?username=${username}&password=${password}`,
//     headers: {
//       'Authorization': 'Basic ' + .toString('base64'));
//     },
//   };
//   request.post(function(error, response, body){
//     if (!error && response.statusCode === 200) {

//     }
//   })
//   res.json({
//     'authToken': '12345'
//   });
//   next();

// }

app.post('/api/login', authRouter);


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

//will have auth middleware to check authtoken

// app.get('/api/results', (req, res, next) => {
//   res.send('Search is over');
// });

module.exports = app;