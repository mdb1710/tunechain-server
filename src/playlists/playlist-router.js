'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');


const playlistRouter = express.Router();
const jsonParser = express.json();

const serializePlaylist = playlist => ({
  id: playlist.item.id,
  name: playlist.item.name,
  tracks: playlist.item.tracks,
  url: playlist.item.url

});