
'use strict';
const supertest = require('supertest');

const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!');
  });

  it('POST /api/search should receive authorization from Spotify', () => {
    //test the auth function
    return supertest(app)
      .get('/api/search')
      .expect(200);
  });

  it('GET /api/search responds with Spotify data objects', () => {
    return supertest(app)
      .get('/api/search')
      .expect(200)
      .expect('Content-type', /json/)
      .then(res => {
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.all.keys('lat', 'lon');
      });
  });
});